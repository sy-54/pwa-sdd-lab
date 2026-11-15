# 買い物リスト 設計

> ロジック（検証・追加・切替・削除・件数計算・壊れたデータの復旧）は `logic.js` に純粋関数として分け、`main.js` は SDK呼び出しとDOM操作のみを担う。
> 保存は `storage` の単一キー `items` に配列をまるごと保存し、各項目へ一意な `id` を持たせて切替・削除を特定する。
> 単体テストは `logic.js` の純粋関数で AC-01〜04・07・09 を、E2Eは画面操作が絡む全ACを確認する。

## モジュール構成
- `apps/shopping/index.html`：入力欄・追加ボタン・一覧・残り件数の骨組み（DOM構造のみ）
- `apps/shopping/manifest.json`：アプリ定義（id・name・icon・description）
- `apps/shopping/logic.js`：DOMに触れない純粋関数（検証・CRUD・集計・復旧）
- `apps/shopping/main.js`：`mountApp`／`storage`／`ui.toast` の呼び出し、DOM描画とイベント登録

## データモデル
- キー `items`、既定値 `[]`
- 値：`{ id: string, name: string, qty: number, done: boolean }` の配列。登録順を保つ
  - 例：`[{ "id": "a1", "name": "牛乳", "qty": 2, "done": false }]`
- `id` は追加時に `crypto.randomUUID()` で発行し、切替・削除のキーにする（同名項目を区別するため）
- 壊れた値（配列でない）：`sanitizeItems` で空配列 `[]` に置き換え、保存はし直さず次回の `set` 時に上書きする

## 使用するSDK API
- `mountApp({ title })`：起動時に1度呼ぶ
- `storage.get('items', [])`：起動時に読み込む
- `storage.set('items', items)`：追加・切替・削除のたびに保存する
- `ui.toast(文言)`：数量が不正なとき通知する
- `notify.send`／`camera.takePhoto`：なし（通知・カメラを使う機能がない）

## logic.js の関数
- `sanitizeItems(value)`：配列でなければ `[]` を返す
- `validateQty(raw)`：空欄→`{ok:true, value:1}`、正の整数文字列→`{ok:true, value:Number(raw)}`、それ以外→`{ok:false}`
- `createItem(name, qty)`：空欄／空白のみの `name` は `null`、それ以外は新しい項目を返す
- `toggleItem(items, id)` / `deleteItem(items, id)`：新しい配列を返す（元を変更しない）
- `countRemaining(items)`：`done` が `false` の件数

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: createItem が正しい項目を返す | shopping.spec.ts |
| AC-02 | logic.test.js: validateQty の空欄→1 | shopping.spec.ts |
| AC-03 | logic.test.js: createItem が空白のみで null を返す | shopping.spec.ts |
| AC-04 | logic.test.js: validateQty が0・負数・小数・非数字を拒否 | shopping.spec.ts |
| AC-05 | logic.test.js: toggleItem が対象のみ切替・countRemaining が減る | shopping.spec.ts |
| AC-06 | logic.test.js: deleteItem が対象を除いた配列を返す | shopping.spec.ts |
| AC-07 | logic.test.js: createItem は同名でも別のidを発行する | shopping.spec.ts |
| AC-08 | ― | shopping.spec.ts（`storage.set`／再読み込みはSDK経由のためE2Eで確認） |
| AC-09 | logic.test.js: sanitizeItems が配列以外を[]にする | shopping.spec.ts |
