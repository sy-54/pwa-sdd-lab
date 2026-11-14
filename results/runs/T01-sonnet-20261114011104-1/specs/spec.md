# タイマー 外部仕様

> 分数を指定するカウントダウンタイマー。開始・一時停止・再開・リセットができ、0になると終了表示を出す。
> 状態は保存しない（再読み込みで初期値3分・停止状態に戻る）。
> `minutes` はカウント中（running）のみ無効化し、停止中（初期・pause後・reset後・done中）は編集でき、編集すると即座に `time` が書き換わる。

## 画面と操作
- `minutes`（`input type="number"` min=1 max=99 step=1）：分数指定。既定値 `3`
- `time`：残り時間を `MM:SS` で表示（例 `03:00`）
- `start`：停止中は「開始」、一時停止中は「再開」とラベルが変わる
- `pause`：カウント中のみ押せる
- `reset`：常に押せる
- `done`：残り時間が0になった間だけ表示（例文言は実装に委ねる）

## 振る舞い
- 状態は `idle`（初期・reset後）／`running`／`paused`／`done` の4つ。
- 初期状態：`idle`、`minutes=3`、`time=03:00`、`start` 有効（「開始」）、`pause` 無効、`done` 非表示。
- `minutes` 編集可否：`running` のときのみ入力欄を無効化。それ以外（`idle`／`paused`／`done`）は編集可能。
- `minutes` を編集すると（`idle`／`paused`／`done` のいずれでも）、`time` を直ちに `(新しい分数):00` に書き換える。`done` 表示中に編集した場合は `done` を非表示にする。
- `start`（「開始」ラベル、`idle`／`done` から）：押すと `minutes` の現在値から `running` に入り、1秒ごとに `time` を減算する。
- `start`（「再開」ラベル、`paused` から）：押すと `time` に表示中の値から `running` を再開する（`minutes` を編集していなければ pause 時点の残り時間から続く）。
- `pause`：`running` 中に押すと、その時点の `time` を保持したまま `paused` になる。
- `reset`：どの状態からでも押すと `idle` になり、`time` を `minutes` の現在値（`(分数):00`）に戻し、`done` を非表示にする。
- `time` が `00:00` に達したら自動的に `done` 状態になり、`done` を表示し、`pause` を無効化する。

## エラー時の挙動
- `minutes` に範囲外（1未満・100以上）または整数でない値が入力された場合、値を確定時（`change`）に 1〜99 の整数へ補正し（小数は切り捨て、下限未満は1、上限超は99、空欄やNaNは1）、入力欄の表示も補正後の値に書き換える。`time` もこの補正後の値に合わせて更新する。
- ページを再読み込みすると、保存されたタイマー状態は使わず常に `idle`・`minutes=3`・`time=03:00` から始まる。

## 受け入れ条件
### AC-01: 初期表示
- Given アプリを開いた直後
- When 何も操作しない
- Then `minutes` に `3`、`time` に `03:00` と表示され、`done` は非表示である

### AC-02: 開始すると減っていく
- Given `minutes` が `3`（`time` は `03:00`）
- When `start` を押し、1秒待つ
- Then `time` が `02:59` に変わり、`minutes` が無効化される

### AC-03: 一時停止すると止まる
- Given `start` 後に `time` が `02:59` になっている
- When `pause` を押して2秒待つ
- Then `time` は `02:59` のまま変わらず、`minutes` が編集可能になる

### AC-04: 再開すると続きから減る
- Given `pause` 後に `time` が `02:59` のまま
- When `start`（「再開」）を押し、1秒待つ
- Then `time` が `02:58` に変わる

### AC-05: リセットは指定分数に戻る
- Given `minutes` が `5`、`start` 後に `time` が減っている状態
- When `reset` を押す
- Then `time` が `05:00` に戻り、`minutes` が編集可能になり、`start` が「開始」ラベルになる

### AC-06: 時間切れでdone表示
- Given `minutes` が `1` で `start` 済み、`time` が `00:01` になっている
- When 1秒待つ
- Then `time` が `00:00` になり、`done` が表示され、`pause` が無効化される

### AC-07: done中にstartを押すと新しいカウントダウン
- Given `done` が表示され `minutes` が `3` のまま
- When `start` を押す
- Then `done` が非表示になり、`time` が `03:00` から1秒後に `02:59` に変わる

### AC-08: 範囲外の分数は補正される
- Given `idle` 状態
- When `minutes` に `150` を入力して確定する
- Then `minutes` が `99` に補正され、`time` が `99:00` と表示される

## 決定事項
- D1: `minutes` は整数のみ、1〜99分、既定値3（Q1）
- D2: `minutes` は `running` 中のみ編集不可。`idle`／`paused`／`done` では編集でき、編集すると `time` を即時更新する（Q2）
- D3: `reset` は常に `minutes` の現在値（`(分数):00`）に戻る（Q3）
- D4: 状態は保存しない。再読み込みは常に `idle`・既定値3分から始まる（Q4）
- D5: `done` 表示中に `start` を押すと `done` を消し、`minutes` の現在値から新しいカウントダウンを開始する（Q5、要求者「お任せ」のため推奨案を採用）

## 未決事項
- `minutes` の範囲外・非整数入力時の補正方法はQ&Aで問われていない。仮に採用：確定時に1〜99の整数へクランプ（小数切り捨て、空欄/NaNは1）し、入力欄表示も補正後の値に書き換える
