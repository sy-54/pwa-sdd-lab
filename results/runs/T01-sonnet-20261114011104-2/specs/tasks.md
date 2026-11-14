# タイマー タスク

> 土台（マークアップ）→ ロジック（単体テスト）→ 画面結線 → カウントダウン/一時停止 → リセット/done → 全ACのE2Eの順に進める。
> 1タスクは1時間以内・1コミットで終わる大きさとし、タスク内でRed→Greenを回す。
> 全タスク完了後、単体テストとE2Eが全て通ることが完了条件。

- [x] T01: apps/timer/index.html に app-root と各 data-testid 要素、apps/timer/manifest.json を作る (setup)
- [x] T02: apps/timer/logic.js の parseMinutes/minutesToSeconds/formatTime をtests/unit/logic.test.jsのRed→Greenで作る (AC-01, AC-02, AC-05, AC-06, AC-07)
- [x] T03: apps/timer/main.js でmountApp呼び出しと初期表示、minutes入力に応じたstart有効/無効を結線する (AC-07)
- [x] T04: main.jsにstart押下時の開始処理と1秒ごとのカウントダウン表示更新を実装する (AC-01, AC-02)
- [x] T05: main.jsにpause/再開（一時停止中start）の処理を実装する (AC-03, AC-04)
- [x] T06: main.jsにreset（minutes現在値へ再計算）とdone表示（00:00到達時の自動停止）を実装する (AC-05, AC-06)
- [x] T07: 全ACのE2Eをtests/e2e/timer.spec.tsに書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07)
