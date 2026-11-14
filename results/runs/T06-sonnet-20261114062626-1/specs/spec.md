# カウンタ 外部仕様

> ボタンで数値を増減・リセットする単一画面アプリ。値は常にlocalStorageに自動保存し、再読み込み後も復元する。
> カウント値は0以上の整数、増減の幅は1/5/10から選択可能（既定1）、上限なし。目標回数を設定すると到達中だけ分かる表示が出る。
> 未決事項なし。既存利用者の `count` は更新後もそのまま残る。

## 画面と操作
- ルート要素 `data-testid="app-root"` 内に、現在値表示 `data-testid="count"`（数字のみのテキスト）と、ボタン3つ（`data-testid="inc"`、`"dec"`、`"reset"`）を表示する。
- `inc` を押すと現在値に1加算する。
- `dec` を押すと現在値から1減算する。ただし0未満にはしない。
- `reset` を押すと現在値を0にする。
- 【追加】増減の幅を選ぶ `data-testid="step"`（`select`、選択肢は `1`/`5`/`10`）を表示する。`inc`/`dec` はこの選択値の分だけ増減する。
- 【追加】目標回数を入力する `data-testid="goal"`（`input type="number"`）を表示する。空欄も可。
- 【追加】`count` が有効な `goal` 以上になっている間だけ、達成を表す `data-testid="goal-reached"` を表示する。

## 振る舞い
- 初期状態：保存データがなければ `count` は0、`step` は `1`、`goal` は空欄（目標なし）。
- 状態が変わるたび（inc / dec / reset / stepの変更 / goalの変更）に、値をlocalStorageへ即時保存する。
- 再読み込み時：保存値があればそれぞれ `count`・`step`・`goal` に復元し表示する。
- 下限は0。`dec` は現在値から `step` を引いた結果が0未満になる場合、0にクランプする（0未満にしない）。
- 上限なし（実質 `Number.MAX_SAFE_INTEGER` まで、それ以上の挙動は規定しない）。
- 【追加】`goal` が未入力・空欄・0以下・小数・数値でない場合は「目標なし」として扱い、`goal-reached` は表示せず、エラー表示もしない。
- 【追加】目標が有効（1以上の整数）で `count >= goal` のとき `goal-reached` を表示する。`count` が `goal` 未満に戻る、または `goal` が無効になった場合は非表示にする。
- 【追加】更新前から使っていた利用者（保存データに `step`/`goal` のキーがない）が開いた場合、既存の `count` 値はそのまま表示し、`step` は `1`、`goal` は空欄として起動する。

## エラー時の挙動
- 保存データが存在しない、パースできない、0以上の整数でない場合は、0として扱い、同時にlocalStorageを0で上書きする。
- 【追加】`step` の保存データが `1`/`5`/`10` のいずれでもない（欠落・不正値）場合は `1` として扱い、同時にlocalStorageを `1` で上書きする。
- 【追加】`goal` の保存データが無効（上記の「目標なし」の条件）な場合は、未入力（空欄）として表示する。入力欄には書き戻さず、エラー表示もしない。

## 受け入れ条件
### AC-01: 初期表示
- Given localStorageに保存データがない状態でアプリを開く
- When 画面を表示する
- Then `count` に `0` と表示される

### AC-02: incで増える
- Given `count` が `0` の状態
- When `inc` を1回押す
- Then `count` に `1` と表示される

### AC-03: decは0未満にならない
- Given `count` が `0` の状態
- When `dec` を1回押す
- Then `count` に `0` と表示される

### AC-04: resetで0に戻る
- Given `count` が `3` の状態（`inc` を3回押した状態）
- When `reset` を押す
- Then `count` に `0` と表示される

### AC-05: 再読み込みで値が残る
- Given `inc` を2回押して `count` が `2` の状態
- When ページを再読み込みする
- Then `count` に `2` と表示される

### AC-06: 壊れた保存データは0として初期化
- Given localStorageの保存値が不正な文字列（数値でも整数でもない値）になっている状態
- When 画面を表示する
- Then `count` に `0` と表示され、保存データも `0` に上書きされる

### AC-07: stepを選ぶとincの増分が変わる
- Given `count` が `0`、`step` で `5` を選択した状態
- When `inc` を1回押す
- Then `count` に `5` と表示される

### AC-08: 大きいstepのdecは0でクランプする
- Given `count` が `3`、`step` で `5` を選択した状態
- When `dec` を1回押す
- Then `count` に `0` と表示される

### AC-09: 目標回数に到達するとgoal-reachedが表示される
- Given `count` が `4`、`goal` に `5` を入力した状態
- When `inc` を1回押して `count` が `5` になる
- Then `goal-reached` が表示される

### AC-10: 目標未到達・未設定ではgoal-reachedが表示されない
- Given `count` が `3`、`goal` が未入力（空欄）の状態
- When 画面を表示する
- Then `goal-reached` は表示されない

### AC-11: countが目標未満に戻るとgoal-reachedが消える
- Given `count` が `5`、`goal` に `5` を入力して `goal-reached` が表示されている状態
- When `dec` を1回押して `count` が `4` になる
- Then `goal-reached` は表示されない

### AC-12: stepとgoalは再読み込み後も残る
- Given `step` で `10` を選択し、`goal` に `20` を入力した状態
- When ページを再読み込みする
- Then `step` の選択値が `10`、`goal` の入力値が `20` のままである

### AC-13: 既存利用者のcount値は更新後も残る
- Given 更新前のバージョンの保存データとして `count` のみ `7` が保存されており、`step`/`goal` の保存データがない状態
- When 画面を表示する
- Then `count` に `7` と表示され、`step` の選択値は `1`、`goal` は空欄になる

## 決定事項
- D1: `dec` は0で下限、0未満にならない（Q1）
- D2: `reset` は常に0に戻す（Q2）
- D3: 増減のステップは常に1（Q3）
- D4: 上限なし（実質無制限）（Q4）
- D5: 壊れた保存データは0として初期化し上書きする（Q5）
- D6: `step` の既定値は `1`。選択値はlocalStorageに保存し、再読み込み後も復元する（Q1）
- D7: `step` が現在値より大きいときの`dec`は、結果を0にクランプする（Q2）
- D8: `goal` もlocalStorageに保存し、再読み込み後も復元する（Q3）
- D9: `goal` が未入力・空欄・0以下・小数・数値でない場合は「目標なし」とし、`goal-reached` は表示せずエラー表示もしない（Q4）
- D10: `count >= goal`（ちょうど到達を含む）で`goal-reached`を表示する（Q5）

## 未決事項
- なし
