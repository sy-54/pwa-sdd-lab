# 写真メモ 設計

> ロジック（一覧の追加・並び替え・メモ更新・削除・不正データの除去）は `logic.js` に純粋関数として分け、`main.js` は DOM とSDK呼び出しだけを担う。
> 保存は `items` キー1つに「写真Blobとメモを含む配列」をまるごと保存し、変更のたびに全体を書き直す。
> 壊れた保存データは要素単位で検証し、使える項目だけを残す。

## モジュール構成
- `apps/photo-memo/index.html`：画面の骨組み（`app-root`、`shoot`、`memo-empty`、一覧コンテナ）
- `apps/photo-memo/main.js`：起動時の読み込み・描画、`shoot`/`memo-caption`/`memo-delete` のイベント処理、SDK呼び出し
- `apps/photo-memo/logic.js`：`addItem`／`updateCaption`／`removeItem`／`sanitizeItems` の純粋関数
- `apps/photo-memo/manifest.json`：アプリ定義

## データモデル
- キー `items`：配列 `[{ id: string, photo: Blob, caption: string }, ...]`。先頭が最新
  - 例：`[{ id: "1699999999999", photo: <Blob image/jpeg>, caption: "駐車場3F" }]`
- `id` は撮影時の `Date.now()` の文字列化。項目特定・一覧描画のキーに使う
- `sanitizeItems(value)`：`value` が配列でなければ `[]`。各要素は `id` が string、`photo` が `Blob` インスタンス、`caption` が string（欠落時は `""`）であることを確認し、不正な要素は除外する

## 使用するSDK API
- `mountApp`：起動時に1度呼ぶ
- `storage.get` / `storage.set`：`items` の読み書き
- `camera.takePhoto`：撮影ボタン押下時に呼ぶ
- `ui.confirm`：削除確認

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: addItem で新規項目が先頭に入る | photo-memo.spec.ts |
| AC-02 | logic.test.js: addItem を2回呼ぶと順序が入れ替わる | photo-memo.spec.ts |
| AC-03 | logic.test.js: updateCaption が対象項目のcaptionのみ更新する | photo-memo.spec.ts |
| AC-04 | logic.test.js: removeItem が対象項目を除いた配列を返す | photo-memo.spec.ts |
| AC-05 | ― | photo-memo.spec.ts |
| AC-06 | logic.test.js: sanitizeItems([]) が空配列を返す | photo-memo.spec.ts |
| AC-07 | logic.test.js: sanitizeItems が壊れた要素を除外し有効な要素を残す | photo-memo.spec.ts |
| AC-08 | ― | photo-memo.spec.ts |
