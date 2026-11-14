# 写真メモ 設計

> 撮影・編集・削除をシンプルな DOM 操作で実装。メモデータの形を定めて保存と復元を一貫させる。
> ロジック（並び替え、削除）は純粋関数に分け、画面操作（DOM、イベント、SDK）は main.js で処理。
> 壊れたデータは空配列で初期化し、以降は正常なデータとして扱う。

## モジュール構成

- `main.js`：DOM 操作、イベントハンドラー、SDK 呼び出し、storage と画面の同期
- `logic.js`：メモの追加・削除・並び替え（純粋関数、ロジック専用）

## データモデル

- **キー**：`'memos'`
- **値**：`[{ blob, caption }, ...]`
- **具体例**：`[{ blob: <Blob>, caption: "駐車場 B5" }, { blob: <Blob>, caption: "" }]`
- **壊れた値の扱い**：配列でない、または要素に `blob` や `caption` がない場合は空配列 `[]` として扱う。以降は正常なデータとして保存。

## 使用するSDK API

- `mountApp({ title: "写真メモ" })`：ヘッダー表示
- `storage.get('memos', [])`：起動時に保存データを読み込む
- `storage.set('memos', [...])` ：メモを追加・削除・編集した後に保存
- `camera.takePhoto({ maxSize: 1280 })`：撮影ボタン押下時にカメラを開く
- `ui.confirm(...)`：削除時の確認ダイアログ
- `ui.toast(...)`：保存失敗時にエラーを表示

## ACとテストの対応

| AC | 単体 | E2E |
|---|---|---|
| AC-01 | ― | spec.spec.ts：撮影ボタンが表示される |
| AC-02 | ― | spec.spec.ts：写真がないときは空状態を表示 |
| AC-03 | ― | spec.spec.ts：写真を撮影して保存 |
| AC-04 | logic.test.js：新しい順 | spec.spec.ts：新しく撮った写真が先頭に表示される |
| AC-05 | ― | spec.spec.ts：メモを編集して保存 |
| AC-06 | logic.test.js：保存と復元 | spec.spec.ts：アプリを閉じて開き直すと写真とメモが残る |
| AC-07 | ― | spec.spec.ts：削除時に確認ダイアログが出る |
| AC-08 | logic.test.js：削除 | spec.spec.ts：削除確認で「削除」を選ぶとメモが消える |
| AC-09 | ― | spec.spec.ts：削除確認で「キャンセル」を選ぶとメモが残る |
| AC-10 | logic.test.js：複数メモの順序 | spec.spec.ts：複数のメモが新しい順で表示される |
