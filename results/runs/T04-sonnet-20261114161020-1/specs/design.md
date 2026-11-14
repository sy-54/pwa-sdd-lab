# 習慣トラッカー 設計

> ロジック（検証・連続日数計算・保存データの正規化）は `logic.js` の純粋関数に分離し、`main.js` は DOM とイベント、`storage`/`ui` 呼び出しのみを担う。
> 保存は1キー `habits` に `{ name, dates }` の配列をまるごと持ち、連続日数は保存せず表示時に毎回算出する。
> 単体テストは `logic.js` の各関数を、E2Eは `index.html` 上の操作と表示を確認する。

## モジュール構成
- `apps/habit/index.html`：画面の骨格（`app-root`、入力欄、一覧のコンテナ）
- `apps/habit/manifest.json`：アプリ定義（id/name/icon/description）
- `apps/habit/main.js`：起動処理、`storage` からの読込・保存、一覧のDOM生成・再描画、イベント処理（追加・チェック・削除）、`ui.confirm` 呼び出し
- `apps/habit/logic.js`：DOMに触れない純粋関数（データの正規化、追加可否判定、連続日数計算、チェック日付配列の更新）

## データモデル
- キー `habits`：値は配列。各要素 `{ name: string, dates: string[] }`（`dates` は `YYYY-MM-DD` の昇順でなくてもよい重複なし配列）
  - 例：`[{ "name": "読書", "dates": ["2026-11-13", "2026-11-14"] }]`
- 壊れた値の扱い（`logic.js` の `sanitizeHabits`）：
  - 配列でない → 空配列として扱う
  - 要素が `object` でない／`name` が非空文字列でない／`dates` が配列でない → その要素を無視
  - `dates` 内の要素のうち `YYYY-MM-DD` 形式（`/^\d{4}-\d{2}-\d{2}$/`）でないものは除去。結果が空でもその習慣自体は残す
- チェックのオン／オフ、追加、削除のたびに正規化後の配列全体を `storage.set('habits', habits)` で保存する

## 使用するSDK API
- `mountApp({ title: '習慣トラッカー' })`：起動時に1度
- `storage.get('habits', [])`：起動時に読込
- `storage.set('habits', habits)`：追加・チェック変更・削除のたびに保存
- `ui.confirm(文言)`：削除前の確認（AC-06/07）
- `notify`／`camera`：使わない（このアプリの要件にない）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `canAddHabit` が空でない新規名でtrueを返す | habit.spec.ts |
| AC-02 | logic.test.js: `calcStreak` が今日のみチェックで1を返す | habit.spec.ts |
| AC-03 | logic.test.js: `toggleDate` でオフにすると配列から除去される | habit.spec.ts |
| AC-04 | logic.test.js: `calcStreak` が今日含め3日連続で3を返す | habit.spec.ts |
| AC-05 | logic.test.js: `calcStreak` が2日前最終チェックで0を返す | habit.spec.ts |
| AC-06 | ― | habit.spec.ts（`ui.confirm` でOKを選び一覧から消える） |
| AC-07 | ― | habit.spec.ts（`ui.confirm` でキャンセルし一覧に残る） |
| AC-08 | logic.test.js: `sanitizeHabits` が正常データをそのまま復元する | habit.spec.ts（再読み込み後も表示が残る） |
| AC-09 | logic.test.js: `canAddHabit` が空白のみの名前でfalseを返す | habit.spec.ts |
| AC-10 | logic.test.js: `canAddHabit` が前後空白を除き完全一致する既存名でfalseを返す | habit.spec.ts |
| AC-11 | logic.test.js: `calcStreak` の結果が0のとき未チェック判定になる | habit.spec.ts |
