# 単語帳 外部仕様

> 一覧画面でカードを追加・削除し、学習画面で表→裏をめくって「覚えた／まだ」を判定する。
> カードは `storage` に保存して再読み込み後も残すが、学習中の進行状態（出題キューや判定結果）は保存しない。
> 未決事項は学習中に閉じて開き直した場合の挙動のみ（仮の挙動を採用）。

## 画面と操作
- 一覧画面（既定表示）：ルート `app-root`
  - 入力 `card-front-input`、`card-back-input`、追加ボタン `add-card`
  - カードごとに `card-item`（内側に `card-front`、`card-back`、削除ボタン `card-delete`）
  - 学習開始ボタン `study-start`
- 学習画面 `study-view`（学習中だけ表示。一覧・結果は非表示）
  - 表 `study-front`、裏 `study-back`（めくるまで非表示）、めくるボタン `flip`
  - 判定ボタン `know`（覚えた）、`again`（まだ）
  - 進み具合 `study-progress`（`覚えた枚数/全体の枚数`、例 `2/5`）
- 結果 `study-result`（学習が終わったときだけ表示。一覧・学習画面は非表示）
  - `result-known`（1回で覚えた枚数、数字のみ）、一覧へ戻るボタン `study-finish`

## 振る舞い
- 初期状態：カード0枚、一覧画面を表示。`card-item` はなし
- 追加：`card-front-input` と `card-back-input` の両方が空でないときだけ、一覧の末尾に新しいカードを追加し、両入力欄を空に戻す
- 削除：`card-delete` を押すと確認なしで即削除する。表示中の一覧からもその場で消える
- カードの保存：追加・削除のたびに全カードを `storage` に保存する。再読み込み後も保存済みの全カードを登録順のまま表示する
- 学習開始：カードが1枚以上のときだけ `study-start` が押せる（0枚のときは無効化）。押すと一覧の登録順でキューを作り学習画面を表示する
- めくる：各カード表示時は裏が隠れた状態で始まる。`flip` を押すと `study-back` が見える。見えた状態は `know`／`again` を押すまで保たれる
- 判定：
  - `know`：そのカードをキューから外し、次のカードを表示する。「1回で覚えた」フラグ（このカードで一度も `again` を押していない）を保持したまま結果集計に使う
  - `again`：そのカードを「1回で覚えた」対象から外し、残りの未判定カードをひと通り出した後にキューの最後尾へ回す（ラウンドロビン）。次は残りの未判定カードを先に表示する
- 進み具合：`study-progress` は `know` 済みの枚数 / その学習に含む総枚数（学習開始時に固定）
- 終了：キューの全カードが `know` 済みになったら学習画面を隠し `study-result` を表示する。`result-known` には、一度も `again` を押されずに `know` となったカードの枚数を表示する
- 一覧へ戻る：`study-finish` を押すと結果を隠し一覧画面を表示する。カードデータは変化しない

## エラー時の挙動
- 空欄での追加：`card-front-input` か `card-back-input` が空（前後の空白だけの場合も空扱い）のまま `add-card` を押しても何も追加されず、`ui.toast` で知らせる。入力欄の内容はそのまま残す
- 壊れた保存データ：`storage` から読んだ値がカードの配列として読めない場合は、カード0枚として一覧画面を表示する（保存データは次の追加時に正しい形で上書きされる）

## 受け入れ条件
### AC-01: カード0枚では学習を開始できない
- Given カードが1枚も登録されていない
- When 一覧画面を開く
- Then `study-start` は無効化されていて押せない

### AC-02: カードを追加する
- Given 一覧画面でカードが0枚
- When `card-front-input` に「apple」、`card-back-input` に「りんご」を入力して `add-card` を押す
- Then `card-item` が1件増え、その中の `card-front` に「apple」、`card-back` に「りんご」が表示される

### AC-03: カードを削除する
- Given カードが2枚登録されている
- When 1枚目の `card-delete` を押す
- Then 確認は出ずに即座に `card-item` が1件になる

### AC-04: 学習は登録順に出題される
- Given A、B、Cの順でカードを登録している
- When `study-start` を押す
- Then `study-front` にAの表が表示される

### AC-05: めくると裏が見える
- Given 学習中でAの表が表示されている（`study-back` は非表示）
- When `flip` を押す
- Then `study-back` にAの裏が表示される

### AC-06: 「まだ」は未判定カードを出し終えてから繰り返す
- Given A、B、Cの順で学習中（キュー順A→B→C）でAを表示中
- When Aで `again` を押す
- Then 次に `study-front` にはBが表示され、Bを `know`、Cを `know` と判定した後に `study-front` にAが再表示される

### AC-07: 進み具合が更新される
- Given A、B、Cの3枚で学習中
- When Aを `know` と判定する
- Then `study-progress` に「1/3」と表示される

### AC-08: 結果は1回で覚えた枚数を表示する
- Given A、B、Cの3枚で学習中、Aを `again` の後 `know`、BとCをそれぞれ最初の表示で `know` と判定済み
- When 最後のカードを `know` と判定する
- Then `study-view` が隠れ `study-result` が表示され、`result-known` に「2」と表示される

### AC-09: 結果から一覧へ戻る
- Given `study-result` が表示されている
- When `study-finish` を押す
- Then `study-result` が隠れ一覧画面が表示される

### AC-10: 再読み込み後もカードが残る
- Given カードを1枚追加した
- When ページを再読み込みする
- Then 一覧に追加したカードの `card-item` が1件残っている

### AC-11: 空欄のままでは追加できない
- Given 一覧画面でカードが0枚
- When `card-front-input` を空のまま、`card-back-input` に「りんご」を入力して `add-card` を押す
- Then `card-item` は増えず `sdk-toast` が表示される

## 決定事項
- D1: カードが0枚のとき `study-start` は無効化（disabled）で押せない（Q1）
- D2: 「まだ」のカードは、残りの未判定カードをひと通り出した後にキューの最後尾に回す、ラウンドロビン方式（Q2）
- D3: 学習開始時の出題順（と一覧の表示順）は登録順（Q3）
- D4: `card-delete` は確認なしで即削除する（Q4）
- D5: `card-front-input`／`card-back-input` のいずれかが空（前後空白のみも空扱い）なら追加せず、トーストで知らせる（Q5）

## 未決事項
- 学習中にアプリを閉じて開き直した場合の挙動は要求に明記がない。仮の挙動：カードデータ自体は保存されて残るが、学習の進行状態（出題キューや判定結果）は保存せず、開き直すと一覧画面に戻る
