# ToDo 設計

> DOM 操作と入出力（保存・UI）は `main.js` に、データ変更ロジックは `logic.js` に分離。
> アイテム配列を storage に保存。壊れたデータは空配列で復元。
> storage と ui.toast の SDK API を使用。

## モジュール構成
- `main.js`：画面の初期化、イベント受け取り、storage への保存呼び出し、UI 更新
- `logic.js`：タイム追加、完了切り替え、削除ロジック（純粋関数、単体テスト対象）

## データモデル
- 保存キー：`items`
- 値の形：`[{ text: "やることテキスト", completed: false }, ...]`
- 具体例：`[{ text: "買い物", completed: false }, { text: "勉強", completed: true }]`
- 壊れた値：配列でない場合、または要素が `{ text, completed }` 形式でない場合は空配列 `[]` として扱う。ユーザーにトーストで「データをリセットしました」と通知

## 使用するSDK API
- `storage.get('items', [])` ：起動時にアイテム一覧を取得
- `storage.set('items', items)` ：変更（追加・切り替え・削除）後に保存
- `ui.toast()` ：保存失敗時とデータリセット時にエラーメッセージを表示

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: 空文字列は追加されない | todo.spec.ts: 入力欄に「買い物」入力、追加ボタン→リストに表示、count に「1」 |
| AC-02 | logic.test.js: 複数アイテムを順番に追加 | todo.spec.ts: 「買い物」「勉強」を追加→順序確認、count に「2」 |
| AC-03 | ― | todo.spec.ts: 入力欄に「返電話」入力、Enter キー→追加、入力欄空になる |
| AC-04 | logic.test.js: 空白のみの入力は追加されない | todo.spec.ts: 入力欄空のまま追加ボタン→リスト変わらず |
| AC-05 | logic.test.js: 完了フラグ切り替え→未完了数−1 | todo.spec.ts: チェックボックスクリック→取り消し線、count−1 |
| AC-06 | logic.test.js: 完了→未完了→未完了数+1 | todo.spec.ts: チェック解除→取り消し線消える、count+1 |
| AC-07 | logic.test.js: アイテム削除→削除済みは配列から消える | todo.spec.ts: 削除ボタン→リストから消える、count−1 |
| AC-08 | logic.test.js: 完了済みアイテム削除→未完了数変わらず | todo.spec.ts: 完了済みを削除→count 変わらず |
| AC-09 | ― | todo.spec.ts: 3個追加、1個完了、1個削除→リロード→状態復元、count「1」 |
| AC-10 | logic.test.js: 未完了のみをカウント | todo.spec.ts: 3個追加、2個完了→count に「1」 |
