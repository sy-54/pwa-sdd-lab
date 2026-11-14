# 読書記録 設計

> `logic.js`（DOM に触れない純粋関数）で並び替え・絞り込み・保存用データの整形を行い、`main.js` が画面とSDK呼び出しを担う。
> 保存は `storage` の1キー `books` に本の配列をまとめ、壊れていれば空配列扱いにする。
> ロジックは単体テストで、画面・SDK連携はE2Eで確認する。

## モジュール構成
- `apps/books/index.html`：画面の骨格（`app-root`、一覧、フォーム）
- `apps/books/main.js`：SDK呼び出し（`storage`／`ui`／`camera`）、DOM描画、イベント処理
- `apps/books/logic.js`：`normalizeBooks`（壊れた保存値を空配列に正規化）、`addBook`（先頭に追加した新配列を返す）、`applyEdit`（`done` 以外なら評価を消し感想は保持した本を返す）、`filterBooks`（`filter`値で絞り込んだ配列を返す）、`isValidTitle`（前後空白を除いて空でないか）

## データモデル
- キー `books`：本の配列。各要素 `{ id: string, title: string, status: 'want'|'reading'|'done', rating: number|null, note: string, coverBlob: Blob|null }`
  - 例：`[{ id: "1699999999999", title: "吾輩は猫である", status: "want", rating: null, note: "", coverBlob: null }]`
  - `id` は `Date.now()` 文字列化（新規登録順の一意キー。並び順は配列の並びそのもので管理し `id` では並べ替えない）
  - 読んだ本の例：`{ id: "...", title: "本A", status: "done", rating: 5, note: "面白かった", coverBlob: Blob }`
- 壊れた値（配列でない、要素が壊れている）は `normalizeBooks` で空配列に正規化する（例外を出さない）

## 使用するSDK API
- `storage.get('books', [])` / `storage.set('books', books)`：一覧の読み書き
- `ui.toast`：空タイトル時のエラー表示（AC-11）
- `ui.confirm`：削除確認（AC-09／AC-10）
- `camera.takePhoto({ maxSize: 1280 })`：表紙撮影（AC-13）。`null` 時は既存／空のまま保持
- `mountApp({ title: '読書記録' })`：起動時に1度

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: addBook が1件の配列を返す | books.spec.ts |
| AC-02 | logic.test.js: addBook は先頭に追加する | books.spec.ts |
| AC-03 | logic.test.js: applyEdit は配列中の位置を変えない | books.spec.ts |
| AC-04 | ― | books.spec.ts |
| AC-05 | logic.test.js: applyEdit は done のとき評価・感想を保持する | books.spec.ts |
| AC-06 | logic.test.js: applyEdit は done 以外で評価を null にする | books.spec.ts |
| AC-07 | logic.test.js: applyEdit は done 以外でも note を保持する | books.spec.ts |
| AC-08 | logic.test.js: filterBooks が status で絞り込む | books.spec.ts |
| AC-09 | ― | books.spec.ts |
| AC-10 | ― | books.spec.ts |
| AC-11 | logic.test.js: isValidTitle が空白のみを不正とする | books.spec.ts |
| AC-12 | logic.test.js: normalizeBooks は正しい配列をそのまま返す | books.spec.ts |
| AC-13 | ― | books.spec.ts |
| AC-14 | logic.test.js: normalizeBooks は配列でない値を空配列にする | books.spec.ts |
