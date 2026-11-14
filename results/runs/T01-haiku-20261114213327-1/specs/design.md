# タイマー 設計

> ロジック（時間計算・状態遷移）を純粋関数に分離し、DOM・イベント・保存を main.js で管理。
> 状態は メモリ（実行中の秒数）と ストレージ（ユーザー入力）に分ける。
> タイマー終了時は SDK 通知で知らせる。

## モジュール構成
- `main.js`：アプリ初期化、DOM 操作、イベントハンドラ、状態表示の更新、SDK との連携
- `timer.js`：開始条件判定、秒数カウント、状態遷移、終了判定。DOM に触れない純粋関数

## データモデル
- **ストレージキー `minutes`**：ユーザーが入力した分数（1～99 の整数、または 0/空）。型は `string` または `number`。初期値は空文字列 `''`。壊れた値（非数値、マイナス、100以上）は `0` に初期化
- **メモリ（変数）**：
  - `remainingSeconds`：現在の残り秒数（整数）
  - `state`：`'idle'`（停止中）、`'running'`（実行中）、`'paused'`（一時停止）
  - `intervalId`：1秒ごとの更新タイマーの ID

## 使用するSDK API
- `notify.send()`：タイマー終了時に通知を送る
- `storage.get(key, 既定値)`：保存されたユーザー入力を読む
- `storage.set(key, value)`：ユーザー入力を保存する

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | timer.test.js: 1～99分で開始可能 | 03-start.spec.ts |
| AC-02 | timer.test.js: 0分・空欄で開始不可 | 03-start.spec.ts |
| AC-03 | ― | 03-start.spec.ts（入力欄の disabled 属性確認） |
| AC-04 | timer.test.js: 一時停止・再開の秒数遷移 | 04-pause.spec.ts |
| AC-05 | timer.test.js: リセット後の秒数復帰 | 04-pause.spec.ts |
| AC-06 | timer.test.js: 0秒で done フラグ | 05-done.spec.ts（notify 呼び出し確認） |
