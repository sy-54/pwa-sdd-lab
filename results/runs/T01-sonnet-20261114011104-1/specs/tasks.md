# タイマー タスク

> 土台（マークアップ）→ ロジック（単体テスト駆動）→ 画面結線 → 全ACのE2Eの順に進める。
> 1タスクは1時間以内・1コミットで完結させ、「テストを書く」と「実装する」を同タスク内で行う（Red→Green）。
> 全タスク完了後、全ACがE2Eで通ることを完了条件とする。

- [x] T01: apps/timer/manifest.json と index.html の骨格（minutes/time/start/pause/reset/done の data-testid）を作る (setup)
- [x] T02: tests/unit/timer.logic.test.js に createState/formatTime/clampMinutes のテストを書き、logic.js に実装する (AC-01, AC-08)
- [x] T03: 同テストに onStart/onTick/onPause のケースを追加し、logic.js に実装する (AC-02, AC-03, AC-04)
- [x] T04: 同テストに onReset/done到達/done中onStart のケースを追加し、logic.js に実装する (AC-05, AC-06, AC-07)
- [x] T05: main.js でlogic.jsを呼び、DOM描画・イベント登録・setInterval(1000ms)駆動・mountAppを実装して画面を結線する (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
- [x] T06: tests/e2e/timer.spec.ts に全ACのE2Eを書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
