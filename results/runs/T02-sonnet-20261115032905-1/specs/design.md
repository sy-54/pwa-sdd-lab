# ToDo 設計

> ロジック（追加・切替・削除・件数計算・保存データの検証）は `logic.js` に純粋関数として分離し、`main.js` は DOM 操作と `storage` 呼び出しのみを行う。
> 状態は `{ id, text, done }[]` の配列1つで持ち、`items` キーにまるごと保存する。
> 壊れた保存データは検証関数で空配列に正規化する。

## モジュール構成
- `apps/todo/index.html`：画面構造（入力欄・追加ボタン・一覧・件数表示）
- `apps/todo/manifest.json`：アプリ定義
- `apps/todo/logic.js`：DOM に触れない純粋関数（正規化・追加・切替・削除・件数計算）
- `apps/todo/main.js`：`mountApp` 呼び出し、`storage` の読み書き、DOM イベントと `logic.js` の結合・再描画

## データモデル
- キー `items`：`{ id: string, text: string, done: boolean }[]`
  - 例：`[{ "id": "1700000000000-0", "text": "買い物", "done": false }]`
  - `id` は `main.js` が追加時に `Date.now()` と連番から生成する文字列（重複許容の `text` と区別するため）
- 壊れた値の扱い：`logic.js` の `normalizeItems(value)` が、配列でない、または要素が `{ id: string, text: string, done: boolean }` の形でない場合に空配列 `[]` を返す。`main.js` は `storage.get('items', [])` の結果を必ず `normalizeItems` に通してから使う

## 使用するSDK API
- `mountApp({ title })`：起動時のヘッダー表示
- `storage.get('items', [])` / `storage.set('items', items)`：一覧の読み込みと、追加・切替・削除のたびの保存

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `addItem` が末尾に追加し整形後の文字列を保持する | todo.spec.ts: 入力して追加ボタンを押すと末尾に表示され入力欄が空になる |
| AC-02 | logic.test.js: `addItem` が空白のみの入力で配列を変えない | todo.spec.ts: 空白のみで追加しても項目・件数が変わらない |
| AC-03 | logic.test.js: `toggleItem` が対象の `done` のみ反転し順序を変えない | todo.spec.ts: チェックすると取り消し線がつき件数が減る |
| AC-04 | logic.test.js: `removeItem` が対象を除いた配列を返す | todo.spec.ts: 削除ボタンで一覧から消える |
| AC-05 | logic.test.js: `countRemaining` が未完了件数を返す | todo.spec.ts: 3件中1件完了で件数表示が2になる |
| AC-06 | logic.test.js: `normalizeItems` が正しい形をそのまま復元する | todo.spec.ts: 追加・完了後に再読み込みして内容が残る |
