# ToDo 外部仕様

> やることの追加・完了切替・削除ができる単一画面のミニアプリ。
> 保存は `storage` に `items`（配列）として1キーにまとめ、再読み込みでも残る。
> 未決事項はなし。

## 画面と操作
- エントリ：`apps/todo/index.html`（`apps/todo/manifest.json` も置く）
- ルート要素：`data-testid="app-root"`
- 入力欄：`data-testid="new-todo"`。追加ボタン：`data-testid="add"`。入力欄で Enter を押しても追加される
- 各項目：`data-testid="todo-item"`。内部に以下を持つ
  - `data-testid="todo-text"`：やることの内容
  - `data-testid="todo-toggle"`（`input type="checkbox"`）：完了／未完了の切り替え
  - `data-testid="todo-delete"`（ボタン）：その項目を削除
- 残り件数：`data-testid="todo-count"`（テキストは数字のみ）

## 振る舞い
- 初期状態：保存データがなければ一覧は0件、`todo-count` は `0`
- 追加：入力欄の文字列を項目として一覧の**末尾**に追加し、入力欄を空にする。入力内容の重複チェックはしない（同じ文字列を複数回追加できる）
- 完了切り替え：`todo-toggle` で完了／未完了を切り替える。切り替えても一覧の並び順は変わらない（並べ替えはしない）
- 削除：`todo-delete` を押すと確認なしでその項目を即削除する
- `todo-count` は**未完了（チェックが付いていない）件数**を表示する
- 保存：追加・切替・削除のたびに `items`（配列。各項目は内容・完了状態・識別子を持つ）を `storage.set` で保存する。アプリを開くと `storage.get('items', [])` で復元する

## エラー時の挙動
- 入力欄が空、または空白のみの状態で `add` を押す／Enter を押しても何も起きない（追加されない。入力欄の内容も変えない）
- 保存データが配列でない、または壊れている場合は空の一覧（0件）として起動する（保存は上書きしない。次に変更があったときに正しい形で保存される）

## 受け入れ条件
### AC-01: 末尾に追加される
- Given 一覧に「買い物」のみがある
- When `new-todo` に「掃除」と入力して `add` を押す
- Then `todo-item` が2件になり、2番目の `todo-text` が「掃除」になる

### AC-02: Enter でも追加される
- Given 一覧が0件
- When `new-todo` に「洗濯」と入力して Enter を押す
- Then `todo-item` が1件になり、`todo-text` が「洗濯」になる

### AC-03: 空入力では追加されない
- Given 一覧が0件
- When `new-todo` を空（または空白のみ）にして `add` を押す
- Then `todo-item` は0件のまま

### AC-04: 完了切り替えで件数が減る
- Given 未完了の項目が1件ある
- When その `todo-toggle` にチェックを入れる
- Then `todo-count` が1減った数になる

### AC-05: 削除は確認なしで即時反映
- Given 項目が2件ある
- When 1件目の `todo-delete` を押す
- Then `todo-item` が1件になり、残った項目は元の2件目の内容になる

### AC-06: 未完了件数が表示される
- Given 項目が3件あり、1件が完了済み
- When 一覧を表示する
- Then `todo-count` に `2` と表示される

### AC-07: 再読み込み後も内容が残る
- Given 項目を追加し、1件を完了にした状態で保存済み
- When ページを再読み込みする
- Then 同じ項目と完了状態が復元され、`todo-count` も同じ値になる

### AC-08: 完了項目は取り消し線で表示される
- Given 未完了の項目が1件ある
- When その `todo-toggle` にチェックを入れる
- Then その項目の `todo-text` に取り消し線のスタイルが付く

### AC-09: 壊れた保存データでも起動できる
- Given `storage` の `items` が配列でない壊れた値になっている
- When アプリを開く
- Then `todo-item` は0件、`todo-count` は `0` と表示される

## 決定事項
- D1: 新規項目は一覧の末尾に追加する（Q1）
- D2: 空欄／空白のみでは追加ボタン・Enterともに何も起きない（Q2）
- D3: 削除は `ui.confirm` を使わず、確認なしで即削除する（Q3）
- D4: `todo-count` は未完了件数を表示する（Q4）
- D5: 完了項目は取り消し線で表示する。文字色の指定はなし（Q5。推奨の`muted`色は必須としない）

## 未決事項
- なし
