# タイマー 設計

> ロジックと UI を分離。カウントダウン状態を storage に保存。
> タイマー終了時に SDK 通知と画面表示で知らせる。
> UI は 1秒ごとにロジックから状態を取得して更新。

## モジュール構成
- `logic.js`：カウントダウン計算（分・秒換算、状態遷移）。DOM に触れない純粋関数
- `main.js`：UI 初期化、イベントハンドラ、storage への保存・読み込み、タイマー実行ループ

## データモデル
- キー `"timer"`、値は以下のオブジェクト：
  ```json
  {
    "minutes": 5,
    "remainingSeconds": 298,
    "isRunning": true,
    "isPaused": false
  }
  ```
- `minutes`：入力された分数（1～99 の整数）。リセット時も保持
- `remainingSeconds`：残り時間（秒単位）
- `isRunning`：カウント中（true）または停止中（false）
- `isPaused`：一時停止中（true）か再開可能状態
- 壊れた値の扱い：minutes が 1～99 の範囲外なら、初期状態 `{ minutes: null, remainingSeconds: 0, isRunning: false, isPaused: false }` に直す

## 使用するSDK API
- `storage.get`、`storage.set`：タイマー状態を保存・読み込み
- `notify.send`：時間到達時に OS 通知（トースト代替対応含む）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | ― | spec.timer.spec.ts |
| AC-02 | ― | spec.timer.spec.ts |
| AC-03 | logic.test.js: pause時に秒が止まる | spec.timer.spec.ts |
| AC-04 | logic.test.js: resume時に再開される | spec.timer.spec.ts |
| AC-05 | logic.test.js: reset時に分保持、秒リセット | spec.timer.spec.ts |
| AC-06 | ― | spec.timer.spec.ts |
| AC-07 | logic.test.js: 不正な入力は開始無効 | spec.timer.spec.ts |
