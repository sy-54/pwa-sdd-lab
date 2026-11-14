# タイマー タスク

> 土台（マークアップ）→ logic.js（単体テストから）→ main.js の結線 → done/通知 → 全AC E2E の順で進める。
> 1タスク1コミット。「テストを書く」と「実装する」は同じタスクの中でRed→Greenを回す。
> 全タスク完了＝全AC（AC-01〜AC-10）がどこかのタスクでカバーされ、単体テストとE2Eが通る。

- [x] T01: `apps/timer/index.html`・`manifest.json`（`id: "timer"`）を作り、`app-root`/`minutes`/`time`/`start`/`pause`/`reset`/`done` を静的マークアップで配置 (setup)
- [x] T02: `logic.js` に `initialState`・`formatTime`・`parseMinutesToSeconds` をテストから実装 (AC-01, AC-06)
- [x] T03: `logic.js` の `start`（新規開始／不正値は無変化／一時停止から再開／done後は作り直し）を実装 (AC-02, AC-06, AC-08)
- [x] T04: `logic.js` の `tick`（1秒減算、0でdone遷移）を実装 (AC-02, AC-07)
- [x] T05: `logic.js` の `pause`（running停止・それ以外は無変化）を実装 (AC-04, AC-09)
- [x] T06: `logic.js` の `reset`（常に初期状態へ戻す）を実装 (AC-05)
- [x] T07: `main.js` で `mountApp` 呼び出しと `start`結線（`time`/`minutes.disabled` 描画）を実装 (AC-01, AC-02, AC-03)
- [x] T08: `main.js` に `setInterval` での `tick` 呼び出しと `pause`/`reset` ボタン結線を実装 (AC-04, AC-05, AC-09)
- [x] T09: `main.js` で `done` 表示切替・`notify.send` 呼び出し・done後の`start`再構築を実装 (AC-07, AC-08)
- [x] T10: 全ACのE2Eを書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
