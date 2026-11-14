# ToDo 設計

> ロジックは純粋関数（`logic.js`）、画面の更新は `main.js` に分ける。
> `items` キーに `{ text, completed }` の配列を保存。操作のたびに storage に書き込む。
> 残り件数は `items` から計算し、確認ボタンや通知は使わない。

## モジュール構成
- `main.js`：DOM の初期化、入力・ボタンのイベントリスナー、storage との連携（読み込み・保存）
- `logic.js`：アイテムの追加・完了・削除の純粋関数。DOM に触れない

## データモデル
- **キー**：`items`
- **値**：配列 `[{ text: string, completed: boolean }, ...]`
- **具体例**：`[{ text: "買い物", completed: false }, { text: "レポート", completed: true }]`
- **初期値**：`[]`
- **壊れた値の扱い**：配列でなければ、または要素が `{ text, completed }` 形式でなければ、空配列に初期化

## 使用するSDK API
- `storage.get('items', [])`：アプリ起動時に保存データを読む。壊れていれば既定値を使う
- `storage.set('items', items)`：操作のたびに storage に書き込む（追加・完了・削除）

## ACとテストの対応

| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: addItem で1つ追加 | todo.spec.ts: 1つ追加されて表示 |
| AC-02 | logic.test.js: addItem を2回 | todo.spec.ts: 2つ追加、順序を確認 |
| AC-03 | logic.test.js: toggleCompleted フラグ反転 | todo.spec.ts: 打ち消し線の有無を確認 |
| AC-04 | logic.test.js: deleteItem で配列から削除 | todo.spec.ts: 削除ボタン後、要素が消える |
| AC-05 | logic.test.js: count 関数で未完了のみ | todo.spec.ts: 残り件数を確認 |
| AC-06 | ― | todo.spec.ts: リロード後、データが復元 |
| AC-07 | logic.test.js: addItem に空白文字列は拒否 | todo.spec.ts: 空白のみ入力で追加されない |
| AC-08 | ― | todo.spec.ts: 入力がないときボタン無効 |
