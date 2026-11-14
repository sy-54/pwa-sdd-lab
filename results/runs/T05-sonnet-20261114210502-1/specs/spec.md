# 支出メモ 外部仕様

> 金額と分類を入力してその場で記録し、今月の合計と分類ごとの合計を確認できる支出メモ。一覧は今月分のみを新しい順で表示し、削除は確認を挟む。
> 記録は `storage` に配列で保存し、再読み込み後も残る。配列として読めない壊れたデータは0件として扱う。
> 未決事項はなし。Should要件（分類ごとの今月合計）も実装する。

## 画面と操作
- エントリ：`apps/expense/index.html`（`apps/expense/manifest.json` も置く）。ルート要素：`data-testid="app-root"`
- 入力行：金額 `data-testid="amount"`（`input`）、分類 `data-testid="category"`（`select`。値は `food`/`daily`/`transport`/`other`。表示順は食費・日用品・交通・その他で、初期選択は食費）、追加ボタン `data-testid="add"`
- 一覧：各記録を `data-testid="expense-item"` で表示。中に金額 `"expense-amount"`、分類の表示名 `"expense-category"`（食費/日用品/交通/その他）、削除ボタン `"expense-delete"`
- 今月の合計：`data-testid="total"`
- 分類ごとの今月合計：分類ごとに1要素、`data-testid="category-total"` を `data-category="food"` など4値で区別し、4分類すべてを常に表示する（記録が0件の分類は `"0"`）
- 金額の表示（`expense-amount`／`total`／`category-total`）は数字と3桁区切りのカンマのみ（例 `1,200`）

## 振る舞い
- 初期状態：記録0件、`total` は `"0"`、`category-total` は4分類すべて `"0"`、`category` の初期選択は食費
- 追加：金額と分類を入力し `add` を押すと記録を新規作成して保存し、一覧の先頭（最新）に表示する。追加後、金額欄は空に、分類欄は食費に戻る
- 一覧の表示範囲と並び順：今月分の記録だけを、登録が新しいものから順に表示する（先月以前の記録は一覧には出さないが保存データからは削除しない）
- 今月の合計・分類ごとの合計：一覧に表示されている今月分の記録から、画面を開くたびに計算し直す
- 削除：`expense-delete` を押すと `ui.confirm` で確認し、OKなら保存データと一覧からその記録を削除して合計を再計算する。キャンセルなら何も変わらない
- 保存：記録は `storage` に配列で保持し、アプリを閉じて開き直しても同じ記録が残る

## エラー時の挙動
- 金額欄が空／`"0"`／負の値／数字以外／小数点を含む、のいずれかで `add` を押した場合：記録を追加せず `ui.toast` でエラーを知らせる。金額欄・分類欄の入力値はクリアしない
- 保存データが配列として読めない（壊れている・存在しない）場合：記録0件として扱い、一覧・`total`・`category-total` はすべて空（0）の状態で表示する

## 受け入れ条件
### AC-01: 記録の追加
- Given 記録が0件の初期状態
- When 金額欄に `500` を入力し、分類を `交通` に変更して `add` を押す
- Then 一覧の先頭に `expense-item` が現れ、その中の `expense-amount` に `500`、`expense-category` に `交通` と表示される

### AC-02: 今月合計への反映
- Given 記録が0件、`total` が `0`
- When 金額 `500` ・分類「食費」の記録を追加する
- Then `total` に `500` と表示される

### AC-03: 3桁区切り表示
- Given 記録なし
- When 金額に `12000` を入力し分類「その他」で追加する
- Then その記録の `expense-amount` と `total` に `12,000` と表示される

### AC-04: 削除の確認（OK）
- Given 記録が1件ある
- When `expense-delete` を押し `ui.confirm` でOKを選ぶ
- Then その記録が一覧から消え、`total` がその記録の金額を除いた値に更新される

### AC-05: 削除のキャンセル
- Given 記録が1件ある
- When `expense-delete` を押し `ui.confirm` でキャンセルを選ぶ
- Then その記録は一覧から消えず、`total` も変わらない

### AC-06: 不正な金額入力
- Given 金額欄が空のまま
- When `add` を押す
- Then 記録は追加されず、トースト（`sdk-toast`）が表示され、`expense-item` は増えない

### AC-07: 今月分のみ・新しい順の一覧
- Given 先月に登録した記録Aと、今月に登録した記録B・Cが保存データにある（B→Cの順で登録）
- When 一覧を開く
- Then `expense-item` はCが最初、Bがその次の順で2件だけ表示され、Aは表示されない

### AC-08: 再読み込み後も残る
- Given 記録を1件追加した
- When ページを再読み込みする
- Then 同じ `expense-item` が一覧に残り、`total` も追加直後と同じ値になる

### AC-09: 月が変わった後に開き直す
- Given 前月に登録した記録だけが保存データにある状態
- When 月が変わった後にアプリを開き直す
- Then `total` は `0`、一覧に `expense-item` は表示されない

### AC-10: 分類ごとの今月合計
- Given 今月に食費300円、交通200円の記録がある
- When 一覧を開く
- Then `data-category="food"` の `category-total` に `300`、`data-category="transport"` の `category-total` に `200`、`data-category="daily"`／`"other"` の `category-total` に `0` と表示される

## 決定事項
- D1: 不正な入力（空／`0`／負の値／数字以外／小数点を含む）のときは追加せず `ui.toast` でエラーを知らせる（Q1）。入力欄の値はクリアしない（こちらで決定、Q1）
- D2: 一覧は今月分の記録だけを新しい順に表示する（Q2）
- D3: 削除は `ui.confirm` で確認してから行う（Q3）
- D4: Should要件「分類ごとの今月合計」を実装する。testidは `category-total`、`data-category` 属性（food/daily/transport/other）で区別する（こちらで決定、Q4）
- D5: 金額は整数のみ有効とし、小数点を含む入力はD1のエラーとして扱う（Q5）
- D6: 保存データが配列として読めない場合は記録0件として扱う（こちらで決定）

## 未決事項
- なし
