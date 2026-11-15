# 支出メモ タスク

> 静的HTML → ロジック（単体テスト）→ UI接続 → 保存・エラー → E2E全AC
> 各タスク1時間以内、1コミット。段階：土台 → ロジック → 結線 → エラー・保存 → テスト
> 全15 AC をカバー。完了：npm test・npm run e2e が全通過

- [x] T01: apps/expense/index.html と manifest.json 置く (setup)
- [x] T02: logic.js isValidAmount()、tests/unit 単体テスト (AC-09, AC-10, AC-11, AC-12, AC-13)
- [x] T03: logic.js filterCurrentMonth()・categorySum()、単体テスト (AC-04, AC-05, AC-15)
- [x] T04: main.js 初期化・rendering・合計 (AC-01, AC-03)
- [x] T05: main.js addExpense()・validation・toast (AC-02, AC-09, AC-10, AC-11, AC-12, AC-13)
- [x] T06: main.js deleteExpense()・ui.confirm() (AC-06, AC-07, AC-08)
- [x] T07: storage.get/set 永続化 (AC-14)
- [x] T08: E2E テスト全 AC (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15)
