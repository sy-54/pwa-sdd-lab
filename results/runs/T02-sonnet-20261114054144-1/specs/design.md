# ToDo 設計

> ロジックは `logic.js` に純粋関数で分け、画面側 `main.js` は DOM と `storage` の橋渡しのみ行う。
> 保存は `storage` の単一キー `todos` に配列まるごとを入れ、壊れた値は空配列として扱う。
> ロジックは単体テスト、画面は E2E で確認する。

## モジュール構成
- `apps/todo/index.html`：画面の骨格（入力欄・追加ボタン・一覧・件数）
- `apps/todo/main.js`：起動処理。`storage` から読み込み／保存、DOM 描画、イベント配線
- `apps/todo/logic.js`：DOM に触れない純粋関数（追加・トグル・削除・件数計算・保存データの検証）
- `apps/todo/manifest.json`：アプリ定義

## データモデル
- キー `todos`、値は配列。要素は `{ id: string, text: string, done: boolean }`
  - 例：`[{ "id": "1", "text": "牛乳を買う", "done": true }, { "id": "2", "text": "卵を買う", "done": false }]`
- `id` は追加時に `crypto.randomUUID()` で発行し、並び順は配列の順そのもの（末尾追加・並べ替えなし）
- 壊れた値（配列でない、要素が `{id, text, done}` の形でない）は `logic.js` の `sanitizeTodos` で検出し、空配列 `[]` として扱う

## 使用するSDK API
- `mountApp({ title })`：起動時のヘッダー表示
- `storage.get('todos', [])`：起動時の読み込み
- `storage.set('todos', todos)`：追加・切り替え・削除のたびに保存
- `ui.toast(文言)`：`storage.set` 失敗時のエラー通知
- `ui.confirm` は使わない（削除は確認なし、D3）
- `notify.send`／`camera.takePhoto` は使わない（本アプリに通知・カメラ機能はない）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | `logic.test.js`: `addTodo` が末尾に未完了項目を追加する | `todo.spec.ts` |
| AC-02 | `logic.test.js`: `addTodo` が空白のみの入力で変化しない | `todo.spec.ts` |
| AC-03 | `logic.test.js`: `toggleTodo` が対象の `done` のみ反転し件数が減る | `todo.spec.ts` |
| AC-04 | `logic.test.js`: `removeTodo` が対象を除いた配列を返す | `todo.spec.ts` |
| AC-05 | `logic.test.js`: `sanitizeTodos` が正常な配列をそのまま復元する | `todo.spec.ts` |
| AC-06 | `logic.test.js`: `sanitizeTodos` が配列以外の値を `[]` にする | `todo.spec.ts` |
