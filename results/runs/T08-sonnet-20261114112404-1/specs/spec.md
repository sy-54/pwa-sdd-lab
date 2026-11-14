# 読書記録 外部仕様

> 本を登録・編集・削除し、状態（読みたい／読んでいる／読んだ）で絞り込める一覧アプリ。
> 評価と感想は「読んだ」の本だけのもので、他の状態に戻すと評価だけ消え、感想は残る。表紙写真は任意で撮影・差し替えできる（削除不可）。
> 未決事項なし。評価・感想欄の表示方法（非表示）と空タイトル時のメッセージ手段（トースト）は仮決めなのでレビューで確認してほしい。

## 画面と操作
- エントリ：`apps/books/index.html`（`manifest.json` も置く）、ルート要素：`data-testid="app-root"`
- 一覧：追加 `book-new`、絞り込み `filter`（`select`。値 `all` / `want` / `reading` / `done`）、件数 `book-count`（表示中の件数。数字のみ）
- 各本 `book-item`：`book-title`、`book-status`（読みたい／読んでいる／読んだ）、`book-edit`、評価があれば `book-rating`（★を評価の数だけ。例 `★★★`）、写真があれば `book-cover`（`img`）
- フォーム `book-form`（追加・編集のときだけ表示）：`form-title`、`form-status`（`select`。値 `want` / `reading` / `done`）、`form-rating`（`select`。値は空 / `1`〜`5`）、`form-note`（`textarea`）、`form-cover`（撮影ボタン）、`form-save`、`form-cancel`、`form-delete`（編集のときだけ表示）

## 振る舞い
- 一覧の並び順：新しく登録した本が一番上。編集で状態や内容を変えても順番は変わらない
- `book-new` を押すと `form-status` が `want` で初期化された空のフォームが開く
- `form-status` が `done` のときだけ `form-rating` と `form-note` を表示する（`done` 以外では `hidden` 属性で非表示にする）
- 本を保存するとき、`form-status` が `done` でなければ評価は保存しない（既存の評価も消す）。感想はどの状態でも保存し、保持する
- `filter` の初期値は常に `all`。選択は保存せず、再読み込みのたびに `all` から始まる
- `book-count` は現在の `filter` で絞り込んだ後に表示されている `book-item` の件数
- 表紙写真は撮影のたびに差し替わる。削除する手段はない
- 保存は `storage` の1キー（本の配列）にまとめ、アプリを閉じて開き直しても残る

## エラー時の挙動
- `form-title` が空（前後の空白のみも含む）のまま `form-save` を押すと、保存を中止し `ui.toast` でエラーを表示する。フォームは開いたまま、入力内容も消えない
- `form-delete` は `ui.confirm` で確認し、OK のときだけ削除する。キャンセルなら何も変わらない
- 保存されている本データが配列でない・壊れているときは、空の一覧として扱う（例外を出さない）
- `camera.takePhoto` がキャンセル（`null`）のときは、既存の表紙（編集時）はそのまま、未設定（新規時）は表紙なしのまま保存する

## 受け入れ条件
### AC-01: 本を登録する
- Given 一覧が空
- When `book-new` を押し `form-title` に「吾輩は猫である」、`form-status` を `want` のまま `form-save` で保存する
- Then `book-item` が1件表示され `book-title` が「吾輩は猫である」、`book-status` が「読みたい」、`book-count` が 1

### AC-02: 新規登録は一番上に入る
- Given 「本A」が登録済みの一覧
- When 「本B」を新規登録して保存する
- Then 一覧の先頭が「本B」、2番目が「本A」

### AC-03: 編集しても順番は変わらない
- Given 「本A」を先に、「本B」を後に登録した一覧（先頭が本B）
- When 「本A」を編集して `form-status` を `reading` に変えて保存する
- Then 一覧の先頭は依然「本B」、2番目が「本A」のまま

### AC-04: 読んだ以外では評価と感想の欄が出ない
- Given `book-new` を押した直後のフォーム（`form-status` は `want`）
- When フォームを確認する
- Then `form-rating` と `form-note` に `hidden` 属性が付いている

### AC-05: 読んだにすると評価と感想を保存できる
- Given 本の編集フォームで `form-status` を `done` にする
- When `form-rating` を `5`、`form-note` に「面白かった」を入力して保存する
- Then `book-item` に `book-rating` が「★★★★★」と表示される

### AC-06: 読んだから戻すと評価だけ消える
- Given `form-status` が `done`、評価 `4`、感想「良かった」で保存済みの本
- When 編集して `form-status` を `reading` に変えて保存する
- Then その `book-item` に `book-rating` は表示されない

### AC-07: 読んだから戻しても感想は残る
- Given AC-06 の操作をした直後の本
- When 再度編集フォームを開く
- Then `form-note` に「良かった」が表示されている

### AC-08: 絞り込みと件数
- Given `want` の本が1件、`reading` の本が1件、`done` の本が2件
- When `filter` を `done` に変更する
- Then `done` の本2件だけが表示され `book-count` が 2

### AC-09: 削除は確認してから消える
- Given 本が1件登録済み
- When 編集フォームの `form-delete` を押し `ui.confirm` で OK を選ぶ
- Then 一覧から消え `book-count` が 0

### AC-10: 削除をキャンセルすると消えない
- Given 本が1件登録済み
- When 編集フォームの `form-delete` を押し `ui.confirm` でキャンセルを選ぶ
- Then 一覧に残り `book-count` が 1

### AC-11: 空タイトルは保存されない
- Given `book-new` を押したフォーム（`form-title` が空）
- When `form-save` を押す
- Then `sdk-toast` にエラーが表示され、一覧は追加されず `book-count` が変わらない

### AC-12: 再読み込みしても残る
- Given 本を1件登録して保存した直後
- When アプリを再読み込みする
- Then `book-item` が1件表示され `book-count` が 1

### AC-13: 表紙写真を付けられる
- Given `book-new` を押したフォームで撮影して画像を選ぶ
- When `form-save` で保存する
- Then `book-item` に `book-cover` の `img` が表示される

### AC-14: 壊れた保存データは空として開く
- Given `storage` の本データが配列でない壊れた値になっている
- When アプリを開く
- Then 一覧は0件として表示され `book-count` が 0

## 決定事項
- D1: 新規登録は一番上。編集では順番を変えない（Q1-R1）
- D2: 評価・感想は `done` の本だけのもの。他の状態では欄を使えない（Q2-R1）
- D3: `done` から他の状態に変更保存すると評価は消える。感想は残る（Q2-R2）
- D4: 空タイトルは保存を中止しエラー表示する（Q3-R1）
- D5: `filter` の初期値は常に `all`。保存しない（Q4-R1）
- D6: 表紙を削除する手段は提供しない（Q5-R1）
- D7: `form-delete` は `ui.confirm` で確認する（Q1-R2）
- D8: `book-new` 直後の `form-status` 初期値は `want`（Q3-R2）

## 未決事項
- なし（評価・感想欄は `done` 以外で `hidden` にする、空タイトルのエラーは `ui.toast` で出す、という実装手段は決定事項D2・D4の具体化として採用）
