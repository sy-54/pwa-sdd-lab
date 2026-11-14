# タイマー 設計

> ロジックは `logic.js` の純粋関数（状態オブジェクトの遷移）に分離し、`main.js` はDOMイベントと1秒ごとの `setInterval` のみを担う。
> 状態は `{ status, minutes, remainingSeconds }` のメモリ上オブジェクトのみで、保存しない（D4）。
> テストはロジックの状態遷移を単体で、画面の見た目と操作を E2E で確認する。

## モジュール構成
- `apps/timer/manifest.json`：アプリ定義（id/name/icon/description）
- `apps/timer/index.html`：画面構造。`minutes`／`time`／`start`／`pause`／`reset`／`done` の各 `data-testid` を配置
- `apps/timer/logic.js`：DOMに触れない純粋関数。`clampMinutes`／`formatTime`／`createState`／`onStart`／`onPause`／`onReset`／`onSetMinutes`／`onTick`
- `apps/timer/main.js`：`logic.js` を呼び、DOM描画・イベント登録・`setInterval(1000ms)` での `onTick` 駆動を行う

## データモデル
- 状態は変数1つ：`state = { status, minutes, remainingSeconds }`
  - `status`：`'idle' | 'running' | 'paused' | 'done'`
  - `minutes`：1〜99の整数（表示中の分数入力値）
  - `remainingSeconds`：残り秒数（`time` 表示は `formatTime(remainingSeconds)`）
  - 例：`{ status: 'idle', minutes: 3, remainingSeconds: 180 }`
- 永続化しない（D4）。保存／読み込みを行わないため、壊れた値を読む経路自体が存在しない
- `clampMinutes(raw)` の補正：数値化できない／NaN→`1`、整数化は切り捨て、`1`未満→`1`、`99`超→`99`

## 使用するSDK API
- `mountApp({ title: 'タイマー' })`：起動時に1度呼び、共通ヘッダーを表示する
- `storage`：なし（D4で状態を保存しない方針のため、使う対象のデータがない）
- `notify`／`camera`：なし（UI契約・ACは `done` の画面表示のみを要求しており、OS通知や撮影は不要）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `createState(3)` が `{status:'idle', minutes:3, remainingSeconds:180}` | timer.spec.ts |
| AC-02 | logic.test.js: `onTick(onStart(state))` で `remainingSeconds` が179、`status`が`running` | timer.spec.ts |
| AC-03 | logic.test.js: `onPause` 後に `onTick` を呼んでも `remainingSeconds` が変化しない | timer.spec.ts |
| AC-04 | logic.test.js: `onStart`（pausedから）→`onTick` で `remainingSeconds` が1減る | timer.spec.ts |
| AC-05 | logic.test.js: `onReset` で `status`が`idle`、`remainingSeconds`が`minutes*60` | timer.spec.ts |
| AC-06 | logic.test.js: `remainingSeconds`が1の状態で`onTick`すると`status`が`done`、`remainingSeconds`が0 | timer.spec.ts |
| AC-07 | logic.test.js: `done`状態で`onStart`すると`status`が`running`、`remainingSeconds`が`minutes*60` | timer.spec.ts |
| AC-08 | logic.test.js: `clampMinutes(150)`が`99`を返す | timer.spec.ts |
