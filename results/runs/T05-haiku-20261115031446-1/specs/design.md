# 支出メモ 設計

> 金額検証ロジックを純粋関数に分離し、単体テストで確認
> 記録は {amount, category, dateTime} の配列を storage に保存
> 表示時に現在の月で フィルタリングして計算し直す

## モジュール構成
- `main.js`：DOM 操作、UI イベント処理、storage との連携
- `logic.js`：金額検証、記録の月別フィルタリング、分類別集計（DOM に触れない純粋関数）

## データモデル
- **キー**：`expenses`
- **値**：`[{amount: number, category: 'food'|'daily'|'transport'|'other', dateTime: number}, ...]`
  - 例：`[{amount: 1000, category: 'food', dateTime: 1700000000000}]`
  - dateTime は記録追加時の `Date.now()`（ミリ秒）
- **壊れた値**：読込時に配列を確認。要素が不正な形なら除外、キーそのものが異なる形なら新規作成

## 使用するSDK API
- `storage.get`：記録一覧を読み込む
- `storage.set`：記録を保存
- `ui.toast`：金額入力エラーをユーザーに通知
- `ui.confirm`：削除前の確認ダイアログを表示

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | ― | 初期状態.spec.ts |
| AC-02 | ― | 記録追加.spec.ts |
| AC-03 | ― | 新しい記録が上.spec.ts |
| AC-04 | ― | 合計表示.spec.ts |
| AC-05 | ― | 分類ごと合計.spec.ts |
| AC-06 | ― | 削除ダイアログ表示.spec.ts |
| AC-07 | ― | 削除実行.spec.ts |
| AC-08 | ― | 削除キャンセル.spec.ts |
| AC-09 | isValidAmount.test.js | 金額空.spec.ts |
| AC-10 | isValidAmount.test.js | 金額0.spec.ts |
| AC-11 | isValidAmount.test.js | 金額負.spec.ts |
| AC-12 | isValidAmount.test.js | 金額小数.spec.ts |
| AC-13 | isValidAmount.test.js | 大きな数.spec.ts |
| AC-14 | ― | 保存永続.spec.ts |
| AC-15 | filterCurrentMonth.test.js | 月変更.spec.ts |
