# 支出メモ 設計

> ロジック（検証・計算・保存）を `logic.js` に、画面（DOM・イベント）を `main.js` に分離。
> 記録は `expenses` キーの配列で保存し、月判定で今月分をフィルタリング。
> 削除確認と不正入力エラーは SDK の API を使う。

## モジュール構成
- `main.js`：DOM操作、イベントハンドリング、storage API呼び出し、画面更新
- `logic.js`：金額検証、分類確認、記録追加・削除、月判定、合計計算（DOM に触れない純粋関数）

## データモデル
- キー `expenses`：記録の配列。形式は `[{ amount: 100, category: 'food', date: '2026-11-14' }, ...]`
  - `amount`：数値。1 円以上の整数
  - `category`：文字列。`'food'` `'daily'` `'transport'` `'other'` のいずれか
  - `date`：文字列。ISO形式の日付（`YYYY-MM-DD`）。月の判定に使う
  - 具体例：`[{ amount: 1200, category: 'food', date: '2026-11-14' }]`
  - 壊れた値（null、配列以外、不正な要素）は空配列 `[]` で初期化
- キー `lastCategory`：最後に選択した分類。文字列。初期値は `'food'`。壊れた値は `'food'` で初期化

## 使用するSDK API
- `storage.get(key, 既定値)`：`expenses` と `lastCategory` を読み込み
- `storage.set(key, value)`：記録追加・削除時に変更を保存
- `ui.toast(文言)`：不正入力エラーと保存失敗時のメッセージ表示（3秒）
- `ui.confirm(文言, { ok, cancel })`：削除前の確認ダイアログ

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: addExpense() が記録を作成 | expense.spec.ts |
| AC-02 | ― | expense.spec.ts |
| AC-03 | logic.test.js: calculateMonthlyTotal() が今月の合計を計算 | expense.spec.ts |
| AC-04 | logic.test.js: formatAmount() が3桁区切りのカンマを挿入 | expense.spec.ts |
| AC-05 | logic.test.js: validateAmount() が不正な入力を判定 | expense.spec.ts |
| AC-06 | ― | expense.spec.ts |
| AC-07 | logic.test.js: deleteExpense() が記録を削除 | expense.spec.ts |
| AC-08 | ― | expense.spec.ts |
| AC-09 | logic.test.js: saveExpenses()・loadExpenses() が保存・復元 | expense.spec.ts |
| AC-10 | logic.test.js: calculateMonthlyTotal() が月が変わると合計をリセット | expense.spec.ts |
