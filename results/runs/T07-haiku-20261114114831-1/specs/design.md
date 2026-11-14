# 単語帳 設計

> UI は主に一覧画面と学習画面の2つ。ロジック（カード管理・学習進行）を純粋関数に分け、E2E テストで画面を確認する。
> カード一覧は SDK storage に永続化。学習中のデータは保存しない。
> カード追加・削除・学習進行は単体テストで、画面状態遷移は E2E で検証。

## モジュール構成
- `index.html`：エントリーポイント。app-root 要素を定義
- `main.js`：SDK 連携、UI 管理、イベントハンドラ。ボタン・入力欄と画面要素の制御
- `logic.js`：カード管理（追加・削除）、学習進行（記録、末尾移動、完了判定）。DOM に触らない純粋関数

## データモデル
- **キー：`'cards'`**
  - 値：`[{front: string, back: string}, ...]` の配列
  - 具体例：`[{front: "Apple", back: "リンゴ"}, {front: "Dog", back: "犬"}]`
  - 壊れた値の扱い：配列でない、または要素に front / back がない場合は空配列 `[]` で開始
- **学習中のデータ**：保存しない。進行中のカード順序・「覚えた」判定は変数のみ。アプリ再開で初期化

## 使用するSDK API
- `mountApp({ title })`：起動時に1度呼ぶ
- `storage.get(key, 既定値)`：カード一覧を読み込む
- `storage.set(key, value)`：カード一覧を保存

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | ― | flashcards.spec.ts |
| AC-02 | logic.test.js | flashcards.spec.ts |
| AC-03 | logic.test.js | flashcards.spec.ts |
| AC-04 | logic.test.js | flashcards.spec.ts |
| AC-05 | ― | flashcards.spec.ts |
| AC-06 | ― | flashcards.spec.ts |
| AC-07 | ― | flashcards.spec.ts |
| AC-08 | logic.test.js | flashcards.spec.ts |
| AC-09 | logic.test.js | flashcards.spec.ts |
| AC-10 | logic.test.js | flashcards.spec.ts |
| AC-11 | ― | flashcards.spec.ts |
| AC-12 | ― | flashcards.spec.ts |
| AC-13 | ― | flashcards.spec.ts |
