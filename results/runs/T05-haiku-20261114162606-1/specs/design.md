# 支出メモ 設計

> ロジックを DOM から分離し、記録の追加・削除・集計は純粋関数で実装。
> ストレージキー `expenses` に配列を保存し、壊れた値は空配列でリセット。
> 単体テストで集計ロジックを確認、E2E で画面操作と復元を確認。

## モジュール構成
- `main.js`：DOM操作、イベント処理、SDK呼び出し、画面更新
- `logic.js`：記録の追加、削除、集計（月別、分類別）。DOM に触れない純粋関数

## データモデル
キー：`expenses`

値の形（具体例）：
```javascript
[
  { amount: 1000, category: 'food', date: '2026-11-15' },
  { amount: 500, category: 'daily', date: '2026-11-14' }
]
```

壊れた値の扱い：ストレージから読んだ値が配列でない、または要素にフィールド不足の場合は空配列 `[]` にリセット。

## 使用するSDK API
- `storage.get('expenses', [])`：起動時に記録を読み込み
- `storage.set('expenses', value)`：追加・削除後に保存
- `ui.confirm(文言, { ok, cancel })`：削除確認ダイアログ
- `ui.toast(文言)`：保存エラー時の通知

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: addExpense（単一記録追加） | expense.spec.ts: 記録を追加し表示確認 |
| AC-02 | logic.test.js: addExpense（複数追加、順序） | expense.spec.ts: 複数記録を追加し新しい順の確認 |
| AC-03 | logic.test.js: sumCurrentMonth（合計計算） | expense.spec.ts: 合計が表示される |
| AC-04 | logic.test.js: sumByCategory（分類別集計） | expense.spec.ts: 分類ごとの合計が表示 |
| AC-05 | logic.test.js: deleteExpense（削除） | expense.spec.ts: 削除確認で OK を選ぶ |
| AC-06 | ― | expense.spec.ts: 削除確認で キャンセルを選ぶ |
| AC-07 | ― | expense.spec.ts: 起動時に category の初期値が food |
| AC-08 | ― | expense.spec.ts: 追加後に入力フィールドがクリア |
| AC-09 | ― | expense.spec.ts: 金額未入力で追加ボタン、記録されない |
| AC-10 | ― | expense.spec.ts: リロード後に記録が残る |
| AC-11 | logic.test.js: 3桁区切りフォーマット | expense.spec.ts: 3桁区切りの表示確認 |
