# タイマー 設計

> 状態遷移（start/pause/reset/tick）は DOM に触れない純粋関数 `logic.js` に閉じ込め、単体テストで全パターンを確認する。
> 状態はメモリ内の1オブジェクト `{ status, remainingSeconds }` のみ。保存はしない。
> `main.js` は `logic.js` の戻り値を描画し、1秒ごとの `tick` と通知呼び出しだけを担当する。

## モジュール構成
- `apps/timer/index.html`：画面骨格（`app-root`／`minutes`／`time`／`start`／`pause`／`reset`／`done`）
- `apps/timer/manifest.json`：アプリ定義（`id: "timer"`）
- `apps/timer/logic.js`：状態遷移の純粋関数（`initialState`／`parseMinutesToSeconds`／`formatTime`／`start`／`pause`／`reset`／`tick`）。DOM・SDK に触れない
- `apps/timer/main.js`：`logic.js` の呼び出し、DOM描画（`time`・`minutes.disabled`・`done` の表示切替）、1秒ごとの `setInterval` での `tick` 呼び出し、`done` 遷移時の `notify.send` 呼び出し

## データモデル
- 保存しない（要件D4）。状態は `main.js` 内の変数1つ `{ status: 'idle'|'running'|'paused'|'done', remainingSeconds: number }` のみで、再読み込みで消える
- 初期値：`{ status: 'idle', remainingSeconds: 180 }`（`minutes=3` 相当）
- 壊れた値の扱い：`parseMinutesToSeconds` が非対応の入力（空欄・`0`・負数・小数・非数値）には `null` を返す。呼び出し側（`start`）は `null` のとき状態を変えない

## 使用するSDK API
- `mountApp({ title })`：起動時に1度呼ぶ（必須のヘッダー表示）
- `notify.send(title, body)`：`tick` が `done` へ遷移した瞬間に1度呼ぶ。失敗しても例外を投げないため追加のエラー処理は不要
- `storage`：なし（保存しない要件のため使わない）
- `camera`：なし（タイマーに撮影機能はない）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic: `initialState` が `{idle, 180}` | timer.spec |
| AC-02 | logic: `start`→`tick`×2 で `remainingSeconds` が2減る | timer.spec |
| AC-03 | logic: `start` 後の `status` が `running`（`disabled` 描画自体はDOM） | timer.spec |
| AC-04 | logic: `start`→`tick`→`pause`→`start`→`tick` の順で停止中は変化せず再開後だけ減る | timer.spec |
| AC-05 | logic: 任意の状態から `reset` で `initialState` に戻る | timer.spec |
| AC-06 | logic: `parseMinutesToSeconds('')`／`'0'`／`'-1'`／`'1.5'` が `null`、`start` が状態を変えない | timer.spec |
| AC-07 | logic: `remainingSeconds=1` の `running` に `tick` で `{done, 0}` になる（通知呼び出し自体はDOM） | timer.spec |
| AC-08 | logic: `done` 状態に `start('2')` で `{running, 120}` になる | timer.spec |
| AC-09 | logic: `idle` 状態に `pause` を適用しても変化しない | timer.spec |
| AC-10 | ―（保存しない設計そのものが根拠。ブラウザ再読み込みはJSでは再現できない） | timer.spec |
