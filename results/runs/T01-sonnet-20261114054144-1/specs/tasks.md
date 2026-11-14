# タイマー タスク

> 土台（DOM＋manifest）→ logic.js を単体テストで作る → main.js で結線 → 全ACのE2E、の順に進める。
> 1タスク1コミット、1時間以内。テストと実装は同じタスクでRed→Greenを回す。
> 全AC（AC-01〜AC-08）がE2Eで確認できればタスク完了。

- [x] T01: `apps/timer/manifest.json`・`index.html` を作り、`app-root`・`minutes`・`time`・`start`・`pause`・`reset`・`done` を静的に配置する (setup)
- [x] T02: `logic.js` に `parseMinutes`・`formatTime`・`createInitialState` を実装し単体テストを書く (AC-01)
- [x] T03: `logic.js` に `tryStart`・`pause`・`reset`・`tick` を実装し単体テストを書く (AC-02, AC-03, AC-04, AC-05, AC-06, AC-07)
- [x] T04: `main.js` で `mountApp`・初期描画・`minutes`入力の有効/無効切り替えを結線する (AC-01)
- [x] T05: `main.js` に `start`/`pause`/`reset` のクリック処理と `setInterval` による1秒ごとの `tick`・DOM反映を実装する (AC-02, AC-04, AC-05, AC-06)
- [x] T06: `tick` で `status` が `done` になった瞬間に `notify.send` を1回呼ぶ処理を実装する (AC-07)
- [x] T07: 全ACのE2E（timer.spec.ts）を書いて通す（再読み込みでの初期化含む） (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
