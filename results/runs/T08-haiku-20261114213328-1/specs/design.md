# 読書記録 設計

> 本の一覧と編集フォームを状態で管理。ロジック層（books 操作）と UI 層（DOM・イベント・保存）を分離。
> 本と写真は SDK storage に保存し、読込時に形をチェック。
> 各 AC は単体テストでロジック、E2E で UI 確認。

## モジュール構成
- `main.js`：DOM 管理、イベントハンドラ、SDK 連携（storage、camera、ui）
- `logic.js`：本の追加・更新・削除・フィルタリング。DOM に触れない純粋関数

## データモデル
保存キー `books`（配列）：
```js
[
  {
    id: "1234567890-abc",         // タイムスタンプ + ランダム
    title: "吾輩は猫である",
    status: "want" | "reading" | "done",
    rating: 1-5 | undefined,      // 「読んだ」のみ有効
    note: "面白かった" | undefined, // 「読んだ」のみ有効
    cover: Blob | undefined       // 保存キー books_cover_<id> に別途保存
  }
]
```
壊れた値（型が合わない、必須フィールド欠落）は無視し、読み込み時にフィルタ。開き直し後は正常なもののみ表示。

## 使用するSDK API
- `storage.get(key, 既定値)`：起動時に本を読み込み
- `storage.set(key, value)`：本追加・更新・削除のたび保存。写真は Blob 対応
- `ui.toast(文言)`：タイトル空、撮影失敗
- `await ui.confirm(文言, { ok, cancel })`：削除確認ダイアログ
- `await camera.takePhoto({ maxSize: 1024 })`：表紙撮影

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: 新規追加 | books.spec.ts: 追加・一覧表示 |
| AC-02 | logic.test.js: 状態変更 | books.spec.ts: 状態変更表示 |
| AC-03 | logic.test.js: 評価・感想 | books.spec.ts: 読んだ表示・入力 |
| AC-04 | ― | books.spec.ts: 撮影・表示 |
| AC-05 | ― | books.spec.ts: 削除ダイアログ表示 |
| AC-06 | logic.test.js: 削除 | books.spec.ts: 削除実行 |
| AC-07 | logic.test.js: フィルタ | books.spec.ts: フィルタ絞込 |
| AC-08 | logic.test.js: バリデーション | books.spec.ts: トースト表示 |
| AC-09 | ― | books.spec.ts: キャンセル動作 |
| AC-10 | ― | books.spec.ts: 再起動復元 |
| AC-11 | ― | books.spec.ts: 読みたい・読んでいる非表示 |
| AC-12 | ― | books.spec.ts: 読んだ表示 |
| AC-13 | ― | books.spec.ts: デフォルト「読みたい」 |
| AC-14 | ― | books.spec.ts: フィルタ初期値「全て」 |
