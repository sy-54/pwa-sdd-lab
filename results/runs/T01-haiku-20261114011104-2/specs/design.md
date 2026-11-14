# タイマー 設計

> DOM 管理とタイマーロジックを分離。`main.js` で画面とイベントを処理し、`timer.js` の純粋関数でカウント計算を担当。
> 状態は現在の秒数と実行フラグで保持。SDK の通知機能で終了を通知。
> テストはロジックは単体で、UI は E2E で検証。

## モジュール構成
- `main.js`：DOM 操作、イベントハンドラ、SDK 連携
- `timer.js`：カウント計算、時間フォーマット（純粋関数のみ）

## データモデル
- メモリ上の状態：
  - `minutes`: 入力値（1～99）。初期値 3
  - `remainingSeconds`: 残り秒数。初期値 `minutes * 60`
  - `isRunning`: カウント中か（boolean）
- 例：`{ minutes: 3, remainingSeconds: 180, isRunning: false }`
- 壊れた値：なし（永続化なし、メモリのみ）

## 使用するSDK API
- `mountApp({ title })`：起動時に1度呼ぶ
- `notify.send(タイトル, 本文)`：時間終了時に通知

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | ― | timer.spec.ts |
| AC-02 | timer.test.js: formatTime | timer.spec.ts |
| AC-03 | timer.test.js: tick | timer.spec.ts |
| AC-04 | timer.test.js: tick（停止） | timer.spec.ts |
| AC-05 | timer.test.js: reset | timer.spec.ts |
| AC-06 | timer.test.js: isTimerDone | timer.spec.ts |
| AC-07 | timer.test.js: handleMinutesChange | timer.spec.ts |
