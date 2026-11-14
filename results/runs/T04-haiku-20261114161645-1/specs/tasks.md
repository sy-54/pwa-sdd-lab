# 習慣トラッカー タスク

> 土台（HTML + manifest）→ logic.js の単体テスト + 実装 → main.js の画面結線 → E2E 全 AC
> 各タスク 1 時間以内、1 コミット。AC ごとに単体テスト（Red→Green）→ E2E で検証
> スケッチ段階で StorageAPI と ui.confirm を確認してリスク低減

- [x] T01: 土台を置く (setup)
- [x] T02: logic.js - addHabit() の単体テスト + 実装（バリデーション含む） (AC-01, AC-08, AC-09)
- [x] T03: logic.js - calculateStreak() の単体テスト + 実装（日付ベース） (AC-03, AC-04, AC-05)
- [x] T04: logic.js - sortHabits()、updateChecked()、deleteHabit() の単体テスト + 実装 (AC-02, AC-06, AC-07)
- [x] T05: main.js - 初期化と DOM 描画（storage.get + render） (AC-10)
- [x] T06: main.js - 追加・チェック・保存フロー（add-habit ボタン、checkbox イベント、storage.set） (AC-01, AC-02)
- [x] T07: main.js - 削除フロー（delete ボタン、ui.confirm、DOM 更新） (AC-07)
- [x] T08: E2E テスト - 全 AC を検証 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
