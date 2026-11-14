# ToDo 外部仕様

> 入力欄に文字を入れて追加ボタンまたは Enter でやることを末尾に追加し、チェックボックスで完了／未完了を切り替え、削除ボタンで取り除く。
> 全件を `storage` の `items` キーに配列として保存し、起動時に復元する。
> 未決事項なし。

## 画面と操作
- ルート `data-testid="app-root"` の中に、入力欄 `data-testid="new-todo"` と追加ボタン `data-testid="add"` を横並びで置く
- 入力欄で Enter キーを押しても追加ボタンと同じ動作をする
- 残り件数 `data-testid="todo-count"`（未完了の件数のみ。数字のみのテキスト）を入力欄の下に表示する
- リストは `ul` で、各項目は `li data-testid="todo-item"` とし、その中に以下を持つ
  - `data-testid="todo-text"`：内容のテキスト
  - `data-testid="todo-toggle"`：`input type="checkbox"`。完了状態を表す
  - `data-testid="todo-delete"`：削除ボタン。押すと確認なしで即削除する

## 振る舞い
- 初期状態：`storage.get('items', [])` で読み込んだ配列をそのまま表示する。空ならリストは0件、`todo-count` は `0`
- 追加：入力欄の値の前後の空白を取り除いた文字列が1文字以上のとき、新規項目（`text`：トリム後の文字列、`done`：`false`）をリストの末尾に追加し、`storage.set('items', ...)` で保存し、入力欄を空にする
- 空文字・空白のみで追加しようとした場合：何もしない（追加されず、入力欄も変化しない）
- 切り替え：`todo-toggle` のチェック状態の変更で、その項目の `done` を反転し保存する
- 削除：`todo-delete` を押すとその項目をリストから取り除き保存する（確認ダイアログなし）
- 完了した項目は見た目で区別する（`todo-item` に完了を示すクラスを付け、取り消し線など CSS で表現する）
- 件数：`todo-count` は常に `done === false` の項目数を表示する
- 並び順：追加された順（末尾追加）を保ち、完了切り替えでは順序を変えない
- 件数や内容に上限はない

## エラー時の挙動
- 保存データが壊れていて配列として読めない場合（`null`／配列でない／要素が `{text: string, done: boolean}` の形でない等）：空のリストとして扱って表示する。その後にユーザーが追加・切替・削除のいずれかの操作を行った時点で、正常な形の配列が `storage.set` により上書き保存される

## 受け入れ条件
### AC-01: 追加すると末尾に表示され件数が増える
- Given `app-root` が表示され、リストが空（`todo-count` が `0`）
- When `new-todo` に `牛乳を買う` と入力し `add` をクリックする
- Then `todo-item` が1件表示され、その `todo-text` が `牛乳を買う`、`todo-count` が `1` になる

### AC-02: 空文字では追加されない
- Given `app-root` が表示され、リストが空
- When `new-todo` に空白のみ（`"   "`）を入力し `add` をクリックする
- Then `todo-item` は0件のまま、`todo-count` は `0` のまま、`new-todo` の値は変化しない

### AC-03: 完了に切り替えると件数が減り見た目が変わる
- Given `todo-item` が1件（未完了）あり `todo-count` が `1`
- When その項目の `todo-toggle` をクリックする
- Then `todo-count` が `0` になり、その `todo-item` に完了を示すクラスが付く

### AC-04: 削除すると即座に消える
- Given `todo-item` が1件あり `todo-count` が `1`
- When その項目の `todo-delete` をクリックする
- Then `todo-item` が0件になり `todo-count` が `0` になる

### AC-05: 再読み込みしても内容が残る
- Given `new-todo` に `買い物` と入力して `add` をクリックした
- When ページを再読み込みする
- Then `todo-item` が1件表示され、その `todo-text` が `買い物` になる

### AC-06: 壊れた保存データは空リストとして扱う
- Given `storage` の `items` が配列でない壊れた値になっている
- When アプリを開く
- Then `todo-item` は0件、`todo-count` は `0` と表示される

## 決定事項
- D1: 空文字・空白のみの内容で追加しようとした場合、追加されず入力欄も変化しない（Q1）
- D2: 新しく追加した項目は末尾に追加する（Q2）
- D3: `todo-count` は未完了の件数のみを数える（Q3）
- D4: 保存データが壊れている場合、空のリストとして扱い、以後の操作で正常なデータに上書きする（Q4）
- D5: 削除操作に確認ダイアログは不要（即削除）（Q5）

## 未決事項
- なし
