# タイマー 外部仕様

> 分を指定してカウントダウンし、開始・一時停止・再開・リセットができる単一タイマー。
> 保存はせず、再読み込みで常に初期状態（3分）に戻る。終了時は `done` 表示とSDK通知の両方で知らせる。
> 未決事項なし。ボタンを押した状態の組み合わせ（例：未開始でpause）の挙動に注目してレビューしてほしい。

## 画面と操作
- エントリ：`apps/timer/index.html`（`apps/timer/manifest.json` も置く）
- ルート要素：`data-testid="app-root"`
- 分の入力：`data-testid="minutes"`（`input type="number"`）。初期値は `3`
- 残り時間：`data-testid="time"`（`MM:SS` 形式のみ。例 `03:00`）
- ボタン：`data-testid="start"`（開始・再開）、`"pause"`、`"reset"`
- 終了の表示：`data-testid="done"`（時間になったときだけ表示、それ以外は非表示）

## 振る舞い
- 状態は「停止中（未開始／一時停止／終了後）」と「実行中」の2つ。初期状態は停止中・未開始、`minutes` は `3`、`time` は `03:00`、`done` は非表示
- `time` の表示が変わるのは次のときだけ：`start` で新規カウントダウンを始めたとき、カウントダウン中（1秒ごとに減る）、`reset` のとき。`minutes` を変更しただけでは `time` は変わらない
- `start` を押すと：
  - 実行中なら何もしない
  - 一時停止中なら、残っていた秒数からカウントダウンを再開する（`minutes` の現在値は使わない）
  - 未開始または終了後なら、`minutes` の値が正の整数（小数・0・負数・空欄でない）のときだけ `minutes * 60` 秒で新規カウントダウンを開始する。不正な値のときは何も起きない（`time` は変化しない）
  - 開始・再開すると `minutes` は `disabled` になり、`done` は非表示にする
- カウントダウンは1秒ごとに `time` を減らす。`0:00` に達すると実行中をやめ、`done` を表示し、SDKの `notify.send` を呼ぶ（本文・題名は実装側で決める）。この時点で `minutes` の `disabled` を解除する
- `pause` を押すと：実行中なら停止して残り秒数を保持し、`minutes` の `disabled` を解除する。実行中でなければ何も起きない
- `reset` を押すと：状態に関わらずカウントダウンを止め、`minutes` を `3`、`time` を `03:00` に戻し、`done` を非表示にし、`minutes` の `disabled` を解除する
- 保存はしない。再読み込みすると常に初期状態（`minutes=3`、`time=03:00`、未開始、`done` 非表示）になる

## エラー時の挙動
- `minutes` が不正な値（空欄・`0`・負数・小数）のときに `start` を押しても、カウントダウンは始まらず `time` は変化しない。エラー表示はしない

## 受け入れ条件
### AC-01: 初期表示
- Given アプリを初めて開く
- When 画面を開く
- Then `minutes` に `3`、`time` に `03:00`、`done` は非表示

### AC-02: 開始するとカウントダウンする
- Given `minutes` が `3`
- When `start` を押し、2秒待つ
- Then `time` が `02:58` になる

### AC-03: 開始中は分を変更できない
- Given `start` を押してカウントダウン中
- When `minutes` を見る
- Then `minutes` が `disabled` になっている

### AC-04: 一時停止してから再開する
- Given `start` を押し、1秒後に `pause` を押した状態（`time` が `02:59`）
- When 2秒待ってから `start` を押し、1秒待つ
- Then `time` が `02:58` になる（一時停止中は進まず、再開後だけ進む）

### AC-05: リセットで初期状態に戻る
- Given `start` を押してカウントダウン中（`time` が `02:59`）
- When `reset` を押す
- Then `minutes` が `3`、`time` が `03:00`、`done` が非表示になる

### AC-06: 不正な分では開始しない
- Given `minutes` を空欄にする
- When `start` を押す
- Then `time` は `03:00` のまま変化せず、`disabled` にもならない

### AC-07: 終了すると done 表示と通知が出る
- Given `minutes` を `1` にして `start` を押す
- When 60秒待つ
- Then `done` が表示され、通知としてトースト（`sdk-toast`）が表示される

### AC-08: 終了後に開始すると作り直される
- Given AC-07 の状態（`done` 表示、`time` が `00:00`）
- When `minutes` を `2` にして `start` を押す
- Then `done` が非表示になり、`time` が `02:00` になる

### AC-09: 未開始での pause/reset は安全
- Given アプリを開いた直後（未開始）
- When `pause` を押す
- Then `time` は `03:00` のまま、`minutes` は `disabled` ではない

### AC-10: 再読み込みすると初期状態に戻る
- Given `start` を押してカウントダウンを進めた状態
- When 画面を再読み込みする
- Then `minutes` が `3`、`time` が `03:00`、`done` が非表示になる

## 決定事項
- D1: 終了時は `done` 表示に加えて `notify.send` も呼ぶ。文言は実装側で決める（Q1）
- D2: 初期値は3分（`03:00`）。`minutes` が0・空欄・小数・負数のときは `start` を押しても何も起きない。エラー表示はしない（Q2）
- D3: カウントダウン中のみ `minutes` を `disabled` にする。`done` 後の `start` は現在の `minutes` 値で新規に作り直す（Q3）
- D4: 保存しない。再読み込みで常に初期状態に戻る（Q4）
- D5: 未開始・終了後・一時停止中に `pause` を押しても何も起きない。`reset` は常に初期状態（`minutes=3`、`time=03:00`）へ戻す（Q5）
- D6: 一時停止からの再開は、保持していた残り秒数から続ける。一時停止中に `minutes` を変更していても再開には反映しない

## 未決事項
- なし
