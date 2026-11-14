# ToDo 設計

> ロジック（`logic.js`）は DOM に触れない純粋関数、画面（`main.js`）はそれを呼ぶだけに分ける。
> 保存は `storage` の `items` キーに配列1本で、壊れた値は空配列に正規化してから使う。
> 単体テストは `logic.js` の純粋関数、E2E は `apps/todo/index.html` 上の実際の操作を確認する。

## モジュール構成
- `apps/todo/manifest.json`：アプリ定義（id・name・icon・description）
- `apps/todo/index.html`：`app-root` と入力欄・追加ボタン・件数・リストの枠を置く
- `apps/todo/logic.js`：`normalizeItems`・`addItem`・`toggleItem`・`removeItem`・`countRemaining` を実装（DOM非依存、純粋関数）
- `apps/todo/main.js`：`storage.get/set` の呼び出しと、`logic.js` の結果を DOM に反映する描画・イベント登録

## データモデル
- キー：`items`、値：`{ text: string, done: boolean }[]`
  - 例：`[{ "text": "牛乳を買う", "done": false }, { "text": "買い物", "done": true }]`
- 壊れた値（`null`／配列でない／要素が `{text: string, done: boolean}` でない）は `normalizeItems` で空配列 `[]` に正規化する。壊れた要素のみ除外する運用はせず、配列全体を検証して不正なら丸ごと空にする（spec の「壊れている場合は空のリスト」に合わせる）

## 使用するSDK API
- `storage.get('items', [])`：起動時の読み込み
- `storage.set('items', items)`：追加・切替・削除のたびに保存
- `mountApp({ title: 'ToDo' })`：起動時に1度呼ぶ

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `addItem` が末尾に `done:false` で追加する／`countRemaining` が増える | todo.spec.ts |
| AC-02 | logic.test.js: `addItem` が空白のみの文字列で配列を変えずに返す | todo.spec.ts |
| AC-03 | logic.test.js: `toggleItem` が対象の `done` を反転する／`countRemaining` が減る | todo.spec.ts |
| AC-04 | logic.test.js: `removeItem` が対象を取り除く | todo.spec.ts |
| AC-05 | ― | todo.spec.ts（`storage` 経由の再読み込みはブラウザ環境でのみ確認） |
| AC-06 | logic.test.js: `normalizeItems` が壊れた値を `[]` にする | todo.spec.ts（`storage` の既定値はE2Eで不正値を仕込んで確認） |
