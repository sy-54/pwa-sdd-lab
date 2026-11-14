# 支出メモ タスク

> UI契約のマークアップを土台に、logic.js で集計ロジックを単体テストから作る。main.js でイベント処理とストレージを結線。E2E で全画面操作を確認。
> 各タスクは1時間以内、1コミット。土台→ロジック（単体テスト）→結線→E2E の順。
> 単体テスト合格、全 AC の E2E 通過で完了。

- [x] T01: index.html / main.css に全 data-testid を配置して土台を置く (setup)
- [x] T02: logic.js で addExpense / deleteExpense / sumCurrentMonth / sumByCategory を実装し、logic.test.js で単体テスト (AC-01, AC-02, AC-03, AC-04, AC-11)
- [x] T03: main.js で SDK と連携してイベント処理・ストレージ・画面更新を実装 (AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
- [x] T04: expense.spec.ts で全 AC の E2E テストを書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11)
