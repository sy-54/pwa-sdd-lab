# タイマー 設計

> UI の操作を logic.js の純粋関数に委譲し、DOM 操作と分離する。
> メモリ内に現在の分・残り秒数・実行状態を保持し、ページリロードで失われる。
> タイムアップは notify.send() で通知し、E2E は sdk-toast で確認する。

## モジュール構成
- `main.js`：DOM 初期化、入力イベントハンドラ、ボタン操作の UI 反映
- `logic.js`：秒と MM:SS フォーマットの相互変換、残り秒数の計算、タイマー状態管理（純粋関数）

## データモデル
- メモリ内状態（ページリロードで初期化）
  - `currentMinutes`：分の入力値（初期値 3、範囲 1～99）
  - `remainingSeconds`：残り秒数（初期値 180 = 3分）
  - `isRunning`：カウントダウン実行中フラグ（初期値 false）
  - `intervalId`：setInterval ID（初期値 null）
  - 壊れた値：想定なし（メモリ内のみで保存なし）

## 使用するSDK API
- `mountApp({ title })`：アプリ起動時に1度呼び出す
- `notify.send()`：タイムアップ時に通知送信（E2E では sdk-toast で表示）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: 初期値 | spec.ts: ページロード時の表示 |
| AC-02 | logic.test.js: MM:SS 計算 | spec.ts: 分入力で time 更新 |
| AC-03 | logic.test.js: 秒減算ロジック | spec.ts: 開始後 1 秒で減少 |
| AC-04 | ― | spec.ts: 実行中に minutes disabled |
| AC-05 | logic.test.js: 一時停止状態 | spec.ts: 一時停止でカウント停止 |
| AC-06 | logic.test.js: 再開ロジック | spec.ts: 一時停止から再開 |
| AC-07 | logic.test.js: リセット計算 | spec.ts: リセットで 3 分に戻る |
| AC-08 | ― | spec.ts: リセット後も minutes 値は変わらず |
| AC-09 | ― | spec.ts: タイムアップで done 表示 |
| AC-10 | logic.test.js: notify 呼び出し | spec.ts: タイムアップで sdk-toast 確認 |
| AC-11 | ― | spec.ts: リセットで done 消える |
| AC-12 | ― | spec.ts: 再ロードで 3 分に初期化 |
