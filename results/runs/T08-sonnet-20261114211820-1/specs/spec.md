# 読書記録 外部仕様

> 本を登録・編集・削除し、状態（読みたい／読んでいる／読んだ）と評価・感想・表紙写真を1画面で管理する。
> データは SDK の `storage` に配列で保存し、再読み込みでも復元する。評価・感想は「読んだ」のときだけ有効で、他の状態に変えると消える。
> 未決事項なし。レビューでは D3・D4（評価・感想の扱い）と D5（未保存変更の切り替え）を確認してほしい。

## 画面と操作
- `apps/books/index.html`（`manifest.json` も置く）。ルート要素 `data-testid="app-root"`
- 一覧画面：
  - 追加ボタン `book-new`
  - 絞り込み `filter`（`select`。値 `all` / `want` / `reading` / `done`）
  - 件数 `book-count`（絞り込み後に表示されている件数。数字のみ）
  - 各本 `book-item`：`book-title`、`book-status`（読みたい／読んでいる／読んだ）、`book-edit`、評価があれば `book-rating`（★を評価の数だけ）、写真があれば `book-cover`（`img`）
- フォーム `book-form`（追加・編集のときだけ表示）：
  - `form-title`、`form-status`（`select`。値 `want` / `reading` / `done`）
  - `form-rating`（`select`。値は空 / `1`〜`5`）、`form-note`（`textarea`）：`form-status` が `done` のときだけ操作可能
  - `form-cover`（撮影ボタン）、`form-save`、`form-cancel`、`form-delete`（編集のときだけ表示）

## 振る舞い
- 起動時に `storage.get('books', [])` で読み込む。配列でない値が保存されていた場合は空配列として扱う
- 一覧の並び順：新規登録した本は先頭に追加する。既存の本を編集しても並び順は変わらない
- `filter` の初期値は `all`（すべて表示）
- `book-count` は `filter` で絞り込んだ後に一覧へ表示されている件数
- `book-new` を押すと、空の `book-form` を開く（`form-status` 初期値は `want`）
- `book-edit` を押すと、その本の内容を反映した `book-form` を開く
- すでに `book-form` が開いていて未保存の変更がある状態で `book-new` や別の本の `book-edit` を押しても、確認なしでフォームを切り替える（未保存の変更は失われる）
- `form-status` を変更した時点（保存前）で、`form-status` が `done` のときだけ `form-rating`・`form-note` を操作可能にし、`done` 以外では `hidden` 属性で非表示にする。この切り替えは保存前でも即座に反映する
- `form-cover` を押すと `camera.takePhoto()` を呼ぶ。撮影結果（`Blob`）はフォーム内に保持し、`form-save` で本のデータに反映する。キャンセル（`null`）のときは既存の写真を変更しない
- `form-save` を押すと：
  - `form-title` が空（前後の空白のみも含む）のときは保存せず、フォームを開いたままにする（エラー時の挙動を参照）
  - `form-status` が `done` のときは、入力されている評価・感想をその本のデータとして保存する
  - `form-status` が `done` 以外のときは、評価・感想をデータごと削除して保存する（以前「読んだ」だったときの値があっても消える）
  - 保存に成功したら `book-form` を閉じ、一覧に反映する
- `form-cancel` を押すと、変更を保存せず `book-form` を閉じる
- `form-delete` を押すと `ui.confirm()` で確認し、OK のときだけ本を削除して `book-form` を閉じる。キャンセルのときは何もしない
- 保存は `storage.set('books', 配列)` で行う。アプリを閉じて開き直しても同じ内容が復元される

## エラー時の挙動
- `form-title` が空のまま `form-save` を押すと、`ui.toast()` でエラーを表示し、保存せず `book-form` は表示されたままにする（入力内容は保持する）
- `storage.get('books', [])` の値が配列でない場合は、壊れたデータとして空配列を初期値に使う（登録済みデータは失われるが、起動時に例外は出さない）
- `camera.takePhoto()` が例外を投げた場合（画像でないファイルの選択など）は `ui.toast()` でエラーを表示し、写真は変更しない

## 受け入れ条件
### AC-01: 新規追加は一覧の先頭に表示される
- Given 一覧に本「A」が1件登録されている
- When `book-new` からタイトル「B」、状態「読みたい」を入力して `form-save` を押す
- Then 一覧の先頭の `book-item` の `book-title` に「B」と表示される

### AC-02: 編集しても並び順は変わらない
- Given 本「A」「B」がこの順（A が先頭）で登録されている
- When 先頭の「A」を `book-edit` で開き、タイトルを「A2」に変更して `form-save` を押す
- Then 一覧の先頭の `book-title` は「A2」のままで、2番目は「B」のままである

### AC-03: 状態が「読んだ」以外のとき評価・感想欄は非表示
- Given `book-new` で `book-form` を開いている
- When `form-status` を「読みたい」（`want`）にする
- Then `form-rating` と `form-note` に `hidden` 属性が付く

### AC-04: 「読んだ」から他状態に変更すると評価・感想は消える
- Given 本「C」が状態「読んだ」、評価 `3`、感想「良い」で登録されている
- When `book-edit` で開き、`form-status` を「読んでいる」に変更して `form-save` を押す
- Then 一覧のその `book-item` に `book-rating` は表示されない。再度 `book-edit` で開き `form-status` を「読んだ」に戻すと、`form-rating` は空、`form-note` は空である

### AC-05: タイトル空欄では保存できない
- Given `book-new` で `form-title` を空欄のままにする
- When `form-save` を押す
- Then トースト（`sdk-toast`）にエラーが表示され、`book-form` は表示されたままである

### AC-06: 絞り込みで表示件数が変わる
- Given 状態「読みたい」の本が2件、「読んだ」の本が1件登録されている
- When `filter` を「読んだ」（`done`）に変更する
- Then `book-count` に「1」と表示され、`book-item` は1件のみ表示される

### AC-07: 削除は確認後に行われる
- Given 本「D」が登録され、`book-edit` で開いている
- When `form-delete` を押し、`ui.confirm` で OK を選ぶ
- Then 一覧から「D」の `book-item` が消え、`book-form` は閉じる

### AC-08: 保存データは再読み込みしても残る
- Given 本「E」を登録して `form-save` を押した
- When ページを再読み込みする
- Then 一覧に `book-title` が「E」の `book-item` が表示される

## 決定事項
- D1: `form-title` が空欄のまま `form-save` を押すと保存せず、トーストでエラーを表示し、`book-form` は開いたままにする（Q1-R1）
- D2: 新規登録した本は一覧の先頭に追加する。既存の本を編集しても並び順は変わらない（Q2-R1）
- D3: 評価・感想が入力できるのは状態が「読んだ」のときだけ。他の状態では `form-rating`・`form-note` を `hidden` 属性で非表示にする（Q3-R1, Q4-R2）
- D4: 「読んだ」から他の状態に変更して保存すると評価・感想はデータごと消える。一覧に `book-rating` は表示されず、再度「読んだ」に戻しても `form-rating`・`form-note` は空になる（Q3-R1, Q2-R2）
- D5: `book-new` や別の本の `book-edit` を押したとき、`book-form` が開いていて未保存の変更があっても確認なしで切り替える（Q4-R1）
- D6: `filter` の初期値は `all`（Q5-R1）
- D7: `form-delete` で削除する前に `ui.confirm` で確認する（Q1-R2）
- D8: `form-status` を変更した時点（保存前）で `form-rating`・`form-note` の表示はすぐに切り替わる（Q3-R2）

## 未決事項
- なし
