# 支出メモ 設計

> ロジック（検証・整形・合計・並び替え）は `logic.js` に純粋関数で分け、`main.js` は DOM と `storage`／`ui` 呼び出しだけを行う。
> 記録は `storage` の `records` キーに配列で保存し、壊れた値は空配列として扱う。
> 単体テストは `logic.js` の純粋関数、E2E は画面操作と保存の永続化を確認する。

## モジュール構成
- `apps/expense/index.html`：画面の骨格（`app-root` と各 `data-testid` 要素）
- `apps/expense/main.js`：起動処理、`storage`／`ui` の呼び出し、`logic.js` の関数を使った画面更新
- `apps/expense/logic.js`：金額検証、表示整形、今月合計の計算、記録の形の検証（すべて DOM に触れない純粋関数）
- `apps/expense/manifest.json`：アプリ定義

## データモデル
- キー `records`：配列。各要素 `{ id: string, amount: number, category: 'food'|'daily'|'transport'|'other', createdAt: string }`
  - 例：`[{ "id": "1700000000000", "amount": 1200, "category": "food", "createdAt": "2026-11-14T10:00:00.000" }]`
  - `id` は作成時刻のミリ秒文字列（削除時の特定に使う）。`createdAt` はローカル日時から作った ISO 風文字列（年月の判定に使うため `toISOString()` は使わない）
  - 壊れた値（配列でない、要素が `amount`（正の整数）・`category`（4種のいずれか）を満たさない）は読み込み時にその要素を無視し、配列でなければ空配列として扱う

## 使用するSDK API
- `mountApp({ title })`：起動時にヘッダー表示
- `storage.get('records', [])` / `storage.set('records', 配列)`：記録の読み書き
- `ui.toast(文言)`：金額エラーの通知
- `ui.confirm(文言)`：削除確認

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: validateAmount・formatAmount | expense.spec.ts |
| AC-02 | logic.test.js: 新規記録を先頭に並べる | expense.spec.ts |
| AC-03 | logic.test.js: calcMonthlyTotal | expense.spec.ts |
| AC-04 | ― | expense.spec.ts |
| AC-05 | ― | expense.spec.ts |
| AC-06 | logic.test.js: validateAmount の不正値判定 | expense.spec.ts |
| AC-07 | logic.test.js: parseRecords（保存形式の往復） | expense.spec.ts |
| AC-08 | logic.test.js: calcMonthlyTotal（月が異なる記録は除外） | expense.spec.ts |
