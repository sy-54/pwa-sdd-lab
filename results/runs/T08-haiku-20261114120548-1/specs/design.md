# 読書記録 設計

> モジュールは logic（本の操作）、ui（DOM 更新）に分離。ロジックは純粋関数で単体テスト可能。
> 保存は SDK storage に JSON 配列。Blob も一緒に保存。壊れたデータは空配列で復旧。
> 全 AC は単体テストで振る舞い確認、E2E で画面操作の完全な流れを検証。

## モジュール構成
- `logic.js`：本の追加・編集・削除・絞り込みの純粋関数。状態変更とフィルタリングロジック
- `ui.js`：一覧表示・フォーム表示・フォーム非表示・内容更新。DOM 操作と画面状態の管理
- `main.js`：初期化、イベントリスナー設定、ストレージとロジック・UI の協調

## データモデル
- **保存場所**：`storage.get('books')`、`storage.set('books', value)`
- **値の形**：
  ```javascript
  [
    { id: string, title: string, status: "want"|"reading"|"done", rating: 1-5|null, note: string, cover: Blob|null },
    ...
  ]
  ```
- **具体例**：
  ```javascript
  [
    { id: "id-1", title: "JavaScript入門", status: "done", rating: 4, note: "分かりやすかった", cover: <Blob> },
    { id: "id-2", title: "技術書", status: "want", rating: null, note: "", cover: null }
  ]
  ```
- **壊れた値の扱い**：parse 失敗または形式不正の場合は `[]` で開始。以降の操作で正常なデータが蓄積される

## 使用するSDK API
- `storage.get(key)`：ストレージからデータを読み込み。null なら存在しない
- `storage.set(key, value)`：データを保存。Blob も含めて一緒に保存される
- `camera.takePicture()`：カメラ起動して撮影。Blob を返す。キャンセルは null

## ACとテストの対応
| AC | 単体テスト | E2E |
|---|---|---|
| AC-01 | logic.test.js: 本追加で先頭に挿入 | books.spec.ts: 追加→一覧表示 |
| AC-02 | logic.test.js: 状態変更は既存本を更新 | books.spec.ts: 編集→状態変更 |
| AC-03 | logic.test.js: "読んだ" 状態で評価・感想を保存 | books.spec.ts: 状態変更→評価・感想入力 |
| AC-04 | logic.test.js: "want"/"reading" 時評価不可 | books.spec.ts: 読みたい状態時フォーム確認 |
| AC-05 | logic.test.js: 削除で配列から除去 | books.spec.ts: 削除ボタン→ダイアログ→確認 |
| AC-06 | logic.test.js: filter 関数で状態絞り込み | books.spec.ts: セレクト変更→表示件数更新 |
| AC-07 | ― | books.spec.ts: 撮影ボタン→写真表示 |
| AC-08 | ― | books.spec.ts: 撮り直し→新画像で上書き |
| AC-09 | ― | books.spec.ts: 追加→リロード→データ残存 |
