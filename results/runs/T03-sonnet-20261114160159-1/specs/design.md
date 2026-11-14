# 写真メモ 設計

> ロジック（items の追加・更新・削除・復元）は DOM に触れない純粋関数 `logic.js` に分離し、`main.js` が SDK 呼び出しと描画を担う。
> 保存は `storage` の `items` キーに `{ image: Blob, caption: string }[]` を丸ごと保存する。壊れた値は空配列として扱う。
> 画面系（撮影・削除確認・保存失敗時の表示）は E2E、`items` の加工ロジックは単体テストで確認する。

## モジュール構成
- `apps/photo-memo/index.html`：ルート（`app-root`）と `shoot`／一覧／`memo-empty` の骨組み
- `apps/photo-memo/manifest.json`：アプリ定義
- `apps/photo-memo/logic.js`：`addItem`／`setCaption`／`removeItem`／`normalizeItems` の純粋関数（DOM 非依存）
- `apps/photo-memo/main.js`：`mountApp` 呼び出し、`storage`／`camera`／`ui` の呼び出し、`logic.js` を使った状態更新、DOM 描画・イベント登録

## データモデル
- キー `items`：配列。要素は `{ image: Blob, caption: string }`
  - 例：`[{ image: Blob, caption: '駐車場3F' }, { image: Blob, caption: '' }]`
  - 先頭が最新（新着順）
- 読み込み時に `normalizeItems(value)` を通す：配列でない、または要素が `image`／`caption` の形でなければ `[]` を返す

## 使用するSDK API
- `mountApp({ title })`：起動時のヘッダー描画
- `await storage.get('items', [])`：起動時の読み込み
- `await storage.set('items', items)`：追加・編集・削除のたびに保存
- `await camera.takePhoto()`：撮影（既定 `maxSize`）
- `await ui.confirm(文言, { ok, cancel })`：削除確認
- `ui.toast(文言)`：撮影エラー・保存失敗の通知

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: addItem が先頭に追加 | photo-memo.spec.ts |
| AC-02 | logic.test.js: 連続 addItem で新着順になる | photo-memo.spec.ts |
| AC-03 | logic.test.js: setCaption が該当 item を更新 | photo-memo.spec.ts |
| AC-04 | logic.test.js: setCaption に空文字を渡しても item は残る | photo-memo.spec.ts |
| AC-05 | logic.test.js: removeItem が該当 item を除く | photo-memo.spec.ts |
| AC-06 | ― | photo-memo.spec.ts |
| AC-07 | ― | photo-memo.spec.ts |
| AC-08 | logic.test.js: normalizeItems([]) が空配列 | photo-memo.spec.ts |
| AC-09 | logic.test.js: normalizeItems が保存済み配列をそのまま復元 | photo-memo.spec.ts |
| AC-10 | ― | photo-memo.spec.ts |
