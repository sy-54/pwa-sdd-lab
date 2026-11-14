# 読書記録 設計

> ロジック（本の管理）と UI（画面・イベント）を分離。本は配列で保存。
> 状態変更時の評価・感想は spec の D3・U1 のルールに従う。
> モジュールは main.js（UI）と books.js（ロジック）の2ファイル。

## モジュール構成
- `main.js`：DOM 操作、イベントハンドリング、SDK 呼び出し
- `books.js`：本の追加・編集・削除・フィルタなどの純粋関数

## データモデル
- キー：`books`
- 値：本のオブジェクトの配列
  ```json
  [
    { id: "b1", title: "つながる利他", status: "done", rating: 5, note: "おもしろい", cover: Blob }
  ]
  ```
- 各本：`{ id, title, status, rating, note, cover }`
  - `id`：生成される文字列（UUID または タイムスタンプ）
  - `title`：本のタイトル（文字列、必須）
  - `status`：状態（`"want"` / `"reading"` / `"done"`）
  - `rating`：評価（1〜5、未評価時は `undefined`）
  - `note`：感想（文字列、空文字列 または `undefined`）
  - `cover`：写真（Blob または `undefined`）
- 壊れた値の扱い：
  - 起動時に storage から読み込み、型と構造を確認。異なる場合は `[]` で初期化

## 使用するSDK API
- `storage.get(key, 既定値)`：起動時に本の一覧を読み込む
- `storage.set(key, value)`：本を登録・編集・削除した後、一覧全体を保存
- `ui.toast(文言)`：保存失敗時、カメラエラー時にメッセージ表示
- `ui.confirm(文言, { ok, cancel })`：削除時に確認ダイアログを表示
- `camera.takePhoto({ maxSize })`：写真撮影

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | ― | e2e/books.spec.ts: フォーム表示 |
| AC-02 | unit/books.test.js: 本の追加 | e2e/books.spec.ts: 本の登録 |
| AC-03 | unit/books.test.js: ステータス更新（want→done） | e2e/books.spec.ts: 状態変更 |
| AC-04 | unit/books.test.js: ステータス更新（done→reading） | e2e/books.spec.ts: 状態を戻す |
| AC-05 | ― | e2e/books.spec.ts: 削除ダイアログ表示 |
| AC-06 | unit/books.test.js: 本の削除 | e2e/books.spec.ts: 削除実行 |
| AC-07 | unit/books.test.js: フィルタリング | e2e/books.spec.ts: 状態で絞り込み |
| AC-08 | unit/books.test.js: 評価と感想の設定（done） | e2e/books.spec.ts: 評価と感想の入力 |
| AC-09 | unit/books.test.js: ステータス更新時に評価削除 | e2e/books.spec.ts: 状態変更で評価が消える |
| AC-10 | unit/books.test.js: ステータス更新時に感想保持 | e2e/books.spec.ts: 状態変更で感想が保持 |
| AC-11 | ― | e2e/books.spec.ts: 写真撮影 |
| AC-12 | ― | e2e/books.spec.ts: 保存と復元 |
