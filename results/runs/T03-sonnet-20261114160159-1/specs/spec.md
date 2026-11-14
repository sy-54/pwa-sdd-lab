# 写真メモ 外部仕様

> 撮影ボタン1つと一覧だけの画面。撮るたびに一覧の先頭へ写真が増え、各写真にメモを付けたり削除したりできる。
> 写真（Blob）とメモは `storage` に `items` として丸ごと保存し、閉じて開き直しても残る。
> 未決事項なし。削除確認・キャンセル時の挙動・エラー表示が確認ポイント。

## 画面と操作
- エントリ：`apps/photo-memo/index.html`（`apps/photo-memo/manifest.json` も置く）
- ルート要素：`data-testid="app-root"`
- 撮影ボタン：`data-testid="shoot"`（常に押せる。押すたびにカメラを開く）
- 一覧：写真ごとに `data-testid="memo-item"` を1つ。中に
  - `data-testid="memo-img"`（`img`。撮影した画像を表示）
  - `data-testid="memo-caption"`（`input type="text"`。一言メモ）
  - `data-testid="memo-delete"`（削除ボタン）
- 写真が0枚のときだけ `data-testid="memo-empty"` を表示（`hidden` 属性で切替。1枚以上では非表示）
- 並び順：新しく撮った写真が一覧の先頭（新着順）

## 振る舞い
- 起動時：`storage.get('items', [])` を読み、新着順（保存順そのまま、先頭が最新）で一覧を描画する
- 撮影：`shoot` 押下 → `camera.takePhoto()` を呼ぶ
  - 写真（Blob）が返ったら、`{ image: Blob, caption: '' }` を `items` の先頭に追加し `storage.set('items', items)` で保存、一覧を再描画
  - `null`（キャンセル）が返ったら、一覧・保存データとも変化なし
- メモ編集：`memo-caption` の `change`（フォーカスが外れたとき）で、該当 item の `caption` を更新し `storage.set('items', items)` で保存。入力中（`input` イベント）では保存しない
  - メモは空文字のままでもよい（メモなしの写真として扱う）
- 削除：`memo-delete` 押下 → `ui.confirm('この写真を削除しますか？', …)` で確認
  - OK：該当 item を `items` から取り除き `storage.set('items', items)` で保存、一覧を再描画（0件になれば `memo-empty` を表示）
  - キャンセル：一覧・保存データとも変化なし
- 永続化：追加・編集・削除のたびに `items` 全体を `storage.set` する。再読み込み時は保存済みの `items` から同じ順序・内容で復元する

## エラー時の挙動
- `camera.takePhoto()` が例外を投げたとき（画像でないファイルを選んだ場合など）：`ui.toast` でエラーを知らせ、`items` と一覧は変更しない（追加しない）
- `storage.set()` が失敗したとき：`ui.toast` でエラーを知らせ、画面上の変更（追加・編集・削除）を取り消して保存済みの状態の表示に戻す
- 保存データが壊れている（`items` が配列でない等）とき：空配列として扱い、`memo-empty` を表示した状態から始める

## 受け入れ条件
### AC-01: 撮影すると一覧の先頭に追加される
- Given 写真が0枚の状態
- When `shoot` を押し、カメラが写真を返す
- Then 一覧の先頭（1番目）の `memo-item` に `memo-img` が表示される

### AC-02: 新着順で並ぶ
- Given 写真Aを撮って保存済み（`memo-item` が1件）
- When 続けて写真Bを撮る
- Then 1番目の `memo-item` が写真B、2番目が写真Aになる

### AC-03: メモを保存できる
- Given 写真が1件あり `memo-caption` が空の状態
- When その `memo-caption` に「駐車場3F」と入力してフォーカスを外す
- Then `memo-caption` の値が「駐車場3F」になり、ページを再読み込みしても「駐車場3F」のまま表示される

### AC-04: 空メモのまま保存できる
- Given 写真が1件あり `memo-caption` が空の状態
- When 何も入力せずページを再読み込みする
- Then `memo-item` は1件のまま残り、`memo-caption` の値は空である

### AC-05: 削除は確認後に反映される
- Given 写真が1件ある状態
- When `memo-delete` を押し、確認ダイアログで `sdk-confirm-ok` を押す
- Then `memo-item` が0件になり `memo-empty` が表示される

### AC-06: 削除確認をキャンセルすると消えない
- Given 写真が1件ある状態
- When `memo-delete` を押し、確認ダイアログで `sdk-confirm-cancel` を押す
- Then `memo-item` は1件のまま残り、`memo-empty` は表示されない

### AC-07: 撮影をキャンセルしても何も起こらない
- Given 写真が0枚で `memo-empty` が表示されている状態
- When `shoot` を押し、カメラでキャンセルする（`camera.takePhoto` が `null` を返す）
- Then `memo-item` は追加されず、`memo-empty` が表示され続ける

### AC-08: 写真が無いときの表示
- Given 写真を1枚も撮っていない初期状態でアプリを開く
- When 何も操作しない
- Then `memo-empty` が表示され、`memo-item` は0件である

### AC-09: 再読み込み後もデータが残る
- Given 写真2件（それぞれメモ付き）を保存済みの状態
- When ページを再読み込みする
- Then 保存時と同じ順序・同じ `memo-caption` の値で2件の `memo-item` が表示される

### AC-10: 画像でないファイルを選んだときはエラーになる
- Given `shoot` を押してファイル選択を開いた状態
- When 画像でないファイル（例：テキストファイル）を選ぶ
- Then `sdk-toast` でエラーが知らされ、`memo-item` は増えない

## 決定事項
- D1: 一覧は新着順（新しく撮った写真が先頭）にする（Q1）
- D2: 削除は `ui.confirm` で確認してから行う（Q2）
- D3: 撮影をキャンセル（`camera.takePhoto` が `null`）したときは何もしない（トースト等でも知らせない）（Q3）
- D4: メモはフォーカスが外れたとき（`change`）に保存する。要求者は「お任せ」と回答したため、連打による保存回数を抑えられる推奨案を採用（Q4）
- D5: メモは空文字のままでも保存できる（Q5）

## 未決事項
- なし
