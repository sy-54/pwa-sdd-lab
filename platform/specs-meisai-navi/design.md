# 明細節約ナビ 設計

> CSV・分類・集計・節約ポイントは DOM に触れない純粋関数のモジュールに分け、`main.js` が画面と保存をつなぐ。
> 状態は `storage` のキー `state` 1つにまとめる。集計結果は保存せず、表示のたびに明細から計算する。
> ロジックは単体テスト、画面と文字コードは E2E（WebKit）。実物の楽天CSVと iPhone のファイル選択は実機で確かめる。

## モジュール構成
- `apps/meisai-navi/manifest.json`：ランチャー用（id `meisai-navi`、名前「明細節約ナビ」）
- `apps/meisai-navi/index.html`：4画面の枠、タブ、費目の選択肢を出す下部シート
- `apps/meisai-navi/style.css`：アプリ固有の見た目。色は `sdk.css` の変数と、費目色の変数（ライト／ダーク各12色）だけを使う
- `apps/meisai-navi/main.js`：画面。描画、イベント、`storage` の読み書き、`ui.toast`／`ui.confirm` の呼び出し
- `apps/meisai-navi/csv.js`：`decodeText(buffer)`（UTF-8→だめなら Shift_JIS）、`parseCsv(text)`、`readStatement(text)`（明細の配列を返す。読めなければ理由つきの例外）
- `apps/meisai-navi/classify.js`：`normalize(name)`、`shopKey(name)`、キーワード表、`autoClassify(name)`（`{ cat, tag }`。tag は `conv`／`deli`／`cafe`／`tel`／`ec` など節約ポイント用の細目）
- `apps/meisai-navi/model.js`：状態の操作。`initialState()`、`repairState(value)`、`putFile`、`removeFile`、`addCategory`、`renameCategory`、`deleteCategory`、`setRule`、`resolveRows(state)`（各明細に費目・tag・年月を付ける）、`summarize(rows, cats)`（合計、費目別、店別、月別）
- `apps/meisai-navi/tips.js`：`buildTips({ rows, allRows, month, months, cats })`。spec の節約ポイント表をそのまま実装し、`{ kind, title, body, saving }` の配列を返す
- `apps/meisai-navi/format.js`：`yen(n)`（数字とカンマのみ）、`share(part, total)`（小数1桁と `%`）、月の表示名

## データモデル
- `storage` のキー `state`（これ1つ）。例：
  ```json
  { "v": 1,
    "files": [{ "name": "enavi202610.csv",
                "rows": [{ "d": "2026-10-01", "n": "ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ", "a": 1234, "f": 0, "p": "1回払い" }] }],
    "cats": [{ "id": "food", "name": "食料品", "color": 0 }, { "id": "c1", "name": "ペット", "color": 9 }],
    "rules": { "個人商店カワムラ": "food" } }
  ```
- `rows`：`d` 利用日、`n` CSVにあった店名そのまま、`a` 利用金額、`f` 手数料、`p` 支払方法。表示用の店名と費目は保存せず、`resolveRows` で毎回作る
- `cats`：`color` は費目色の番号（0〜11）。追加した費目の ID は `c` と連番。色は空いている番号のうち最小のもの。`other` は必ず含む
- `rules`：キーは `shopKey(店名)`、値は費目ID
- 壊れた値（`repairState`）：オブジェクトでない、`files` が配列でない、`cats` に `other` がない → `initialState()`。形の違う明細の行は捨てる。存在しない費目を指す `rules` は捨てる
- 期間・画面・検索語・しぼり込みは `main.js` の変数に持ち、保存しない

## 使用するSDK API
- `mountApp`：ヘッダーと共通スタイル
- `storage.get` / `storage.set`：`state` の読み書き。`set` の失敗は捕まえて `ui.toast`
- `ui.toast`：費目名の不正入力、上限超過、保存失敗の通知
- `ui.confirm`：すべて消す、費目の削除の確認
- `notify`、`camera` は使わない（通知・写真の要求がない）

## ACとテストの対応
単体は `platform/tests/unit/meisai-*.test.ts`、E2E は `platform/tests/e2e/meisai-navi.spec.ts`。CSV は E2E の中で文字列から作り、`setInputFiles` で渡す。

| AC | 単体 | E2E |
|---|---|---|
| AC-01 | meisai-csv.test.ts: 引用符・カンマ・BOM、列の部分一致、日付でない行を飛ばす | meisai-navi.spec.ts |
| AC-02 | meisai-classify.test.ts: 半角カナ、最長一致（ガスト／ガス）／meisai-model.test.ts: 費目別の合計と割合、並び | meisai-navi.spec.ts |
| AC-03 | meisai-model.test.ts: 月の一覧と月ごとの集計 | meisai-navi.spec.ts |
| AC-04 | meisai-tips.test.ts: 各 kind の出る条件と目安額、並び、月数での割り算 | meisai-navi.spec.ts |
| AC-05 | meisai-model.test.ts: `setRule` が同じ店すべてに効く、自動分類と同じなら消える | meisai-navi.spec.ts |
| AC-06 | meisai-model.test.ts: `repairState` が正常な値をそのまま返す | meisai-navi.spec.ts（再読み込み） |
| AC-07 | meisai-model.test.ts: `putFile` が同名を置き換える | meisai-navi.spec.ts |
| AC-08 | meisai-model.test.ts: `removeFile` | meisai-navi.spec.ts |
| AC-09 | ― | meisai-navi.spec.ts（`sdk-confirm-cancel`／`sdk-confirm-ok`） |
| AC-10 | meisai-model.test.ts: `addCategory` の ID と色、上限12 | meisai-navi.spec.ts |
| AC-11 | meisai-model.test.ts: `renameCategory` | meisai-navi.spec.ts |
| AC-12 | meisai-csv.test.ts: 列がない・明細0行で理由つきの例外 | meisai-navi.spec.ts |
| AC-13 | meisai-csv.test.ts: Shift_JIS のバイト列を `decodeText` で読む（Node の ICU で確かめられる） | meisai-navi.spec.ts（WebKit の `TextDecoder('shift_jis')` を確かめる） |
| AC-14 | ― | meisai-navi.spec.ts |
| AC-15 | meisai-model.test.ts: 空・空白だけ・重複は追加も改名もしない、20文字で切る | meisai-navi.spec.ts（`sdk-toast`） |
| AC-16 | meisai-model.test.ts: `deleteCategory` で修正が消える、自動分類先が削除済みなら `other`、`other` は消せない | meisai-navi.spec.ts |

テスト環境で確かめられないもの（マージ後に実機で確認）：
- 楽天e-NAVIから実際にダウンロードしたCSVの列名と文字コード（手元に実物がないため、想定の見出しで作ったCSVで代用）
- iPhone のホーム画面から起動した状態で、ファイルアプリのCSVを選べること
