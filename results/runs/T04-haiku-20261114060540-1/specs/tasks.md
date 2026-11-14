# 習慣トラッカー タスク

> 土台のマークアップ・SDK初期化 → ロジック実装（単体テスト駆動）→ UI結線 → E2E。
> 各タスク1時間以内、1コミット。
> 全AC が何かのタスクに含まれる。

- [x] T01: index.html、main.js、logic.js、manifest.json の静的マークアップと SDK 初期化 (setup)
- [x] T02: logic.addHabit を実装、空入力・重複を拒否、logic.test.js で検証 (AC-01, AC-08)
- [x] T03: logic.checkHabit と streak 計算を実装、日付判定含む、logic.test.js で検証 (AC-03, AC-04, AC-05)
- [x] T04: logic.deleteHabit を実装、logic.test.js で検証 (AC-06)
- [x] T05: main.js で SDK 初期化、storage.get で読み込み、習慣リスト初期表示 (AC-07)
- [x] T06: 入力欄と追加ボタンの UI 結線、addHabit 呼び出し、re-render (AC-01, AC-08)
- [x] T07: チェックボックス変更イベント、checkHabit 呼び出し、storage.set、re-render (AC-02)
- [x] T08: 削除ボタン UI 結線、ui.confirm ダイアログ、deleteHabit 呼び出し、re-render (AC-06)
- [x] T09: アプリ起動時に日付確認、streak 再計算とリセット、UI 更新 (AC-04, AC-05)
- [x] T10: tests/e2e/habit.spec.ts に全 AC の E2E テスト実装、npm run e2e 全通過 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
