# 買い物リスト 設計

> ロジック（アイテム管理・状態遷移）を純粋関数で分離し、DOM 操作と保存処理は画面層で行う
> JSON キー `items` に `{ name, qty, purchased }` のオブジェクト配列を保存
> ロジックは単体テスト、画面は E2E で検証

## モジュール構成
- `main.js`：DOM 操作、イベントハンドリング、保存・トースト呼び出し
- `logic.js`：状態管理（アイテム追加・削除・チェック切り替え）、未購入件数計算、バリデーション

## データモデル
- キー：`items`
- 値の形：`[{ name, qty, purchased }, ...]`
- 具体例：`[{ name: "牛乳", qty: 2, purchased: false }, { name: "パン", qty: 1, purchased: true }]`
- 壊れた値の扱い：配列でない、または各アイテムに `name`（文字列）、`qty`（正の整数）、`purchased`（真偽値）がない場合は、空配列 `[]` として扱う

## 使用するSDK API
- `storage.get`：起動時に保存済みアイテムを読む
- `storage.set`：アイテム追加・更新・削除のたびに保存
- `ui.toast`：数量が 0 以下のとき警告を出す

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: 正の数量で追加 | shopping.spec.ts |
| AC-02 | logic.test.js: 数量なしで 1 個に | shopping.spec.ts |
| AC-03 | logic.test.js: 商品名空で追加しない | ― |
| AC-04 | logic.test.js: 負の数量で追加しない | shopping.spec.ts（トースト確認） |
| AC-05 | ― | shopping.spec.ts（Enter キー） |
| AC-06 | logic.test.js: 未購入件数計算 | shopping.spec.ts |
| AC-07 | logic.test.js: チェック切り替え | shopping.spec.ts |
| AC-08 | logic.test.js: 項目削除 | shopping.spec.ts |
| AC-09 | logic.test.js: 追加順を保持 | shopping.spec.ts |
| AC-10 | logic.test.js: チェック時に順序変わらない | shopping.spec.ts |
| AC-11 | ― | shopping.spec.ts（アプリ再起動） |
