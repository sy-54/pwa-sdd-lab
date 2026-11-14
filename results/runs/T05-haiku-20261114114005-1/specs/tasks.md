# 支出メモ タスク

> 土台の UI マークアップから始めて、ロジック（単体テスト）、画面の結線、保存・エラー処理を順に実装。
> 最後に全 AC の E2E テストを書いて通す。
> 1つのタスクは 1 時間以内、1 コミットで終わる大きさ。

- [x] T01: UI マークアップと静的 HTML を配置 (setup)
- [x] T02: 入力検証ロジック（validateAmount, validateCategory）を単体テストで実装 (AC-05)
- [x] T03: 記録追加・削除・合計計算ロジック（addExpense, deleteExpense, getTotalByMonth, formatAmount）を単体テストで実装 (AC-01, AC-03, AC-04, AC-07, AC-10)
- [x] T04: DOM イベント、画面更新、保存・エラー処理を実装（main.js にて SDK の storage・ui API を使用） (AC-01, AC-02, AC-06, AC-07, AC-08, AC-09)
- [x] T05: 全 AC の E2E テストを実装して通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
