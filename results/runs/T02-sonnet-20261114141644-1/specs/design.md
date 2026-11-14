# ToDo 設計

> ロジックは `logic.js`（DOM非依存の純粋関数）、画面は `main.js`（DOM・イベント・storage呼び出し）に分離する。
> 状態は `items` 配列1キーに丸ごと保存し、壊れた値は空配列として扱う。
> ロジックは単体テスト、画面とSDK連携はE2Eで確認する。

## モジュール構成
- `apps/todo/index.html`：ルート要素とレイアウト、`main.js` の読み込み
- `apps/todo/manifest.json`：アプリ定義（id/name/icon/description）
- `apps/todo/main.js`：DOM構築・イベント登録・`storage.get`/`storage.set` の呼び出し・再描画
- `apps/todo/logic.js`：`normalizeItems`／`addItem`／`toggleItem`／`deleteItem`／`countRemaining` の純粋関数

## データモデル
- キー `items`：配列。各要素は `{ id: string, text: string, done: boolean }`
  - 例：`[{ "id": "a1b2", "text": "買い物", "done": false }]`
- `id` は `crypto.randomUUID()` で生成（追加時のみ）
- 壊れた値（配列でない、要素が不正）は `normalizeItems` が `[]` を返す。読み込み直後に空一覧として表示し、保存は上書きしない（次回変更時に正しい形で `storage.set` される）

## 使用するSDK API
- `storage.get('items', [])`：起動時に復元
- `storage.set('items', items)`：追加・切替・削除のたびに保存
- `mountApp({ title: 'ToDo' })`：起動時に1度呼ぶ
- `ui.confirm` は使わない（D3：削除は確認なしで即時）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: addItemが末尾に追加する | todo.spec.ts |
| AC-02 | logic.test.js: addItemが末尾に追加する | todo.spec.ts（Enterキー） |
| AC-03 | logic.test.js: addItemが空白のみで何もしない | todo.spec.ts |
| AC-04 | logic.test.js: countRemainingがtoggle後に減る | todo.spec.ts |
| AC-05 | logic.test.js: deleteItemが対象のみ除く | todo.spec.ts |
| AC-06 | logic.test.js: countRemainingが未完了数を返す | todo.spec.ts |
| AC-07 | ― | todo.spec.ts（再読み込み後の復元） |
| AC-08 | ― | todo.spec.ts（取り消し線のスタイル確認） |
| AC-09 | logic.test.js: normalizeItemsが不正値を[]にする | todo.spec.ts |
