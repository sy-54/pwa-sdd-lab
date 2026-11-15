# 単語帳 設計

> 一覧画面・学習画面・結果画面の3つの状態を管理。
> ロジック（カード管理、学習進捗）は DOM に触れない純粋関数で、単体テストで確認。
> 保存は SDK の `storage.set` で `cards` キーのみ。

## モジュール構成
- `main.js`：アプリの起動、画面遷移、SDK 初期化・イベント登録
- `cardManager.js`：カードの追加・削除・バリデーション（純粋関数）
- `studyManager.js`：学習フロー（カードの順序、進捗管理）（純粋関数）

## データモデル
- キー：`cards`
- 値：`[{ front: "apple", back: "りんご" }, ...]`
- 具体例：`[{ front: "apple", back: "りんご" }, { front: "banana", back: "バナナ" }]`
- 壊れた値の扱い：配列でなければ、または要素に `front`・`back` がなければ空配列 `[]` で初期化

## 使用するSDK API
- `storage.get('cards', [])`：保存済みカード一覧を取得
- `storage.set('cards', value)`：カード一覧を保存
- `ui.toast(文言)`：操作完了のメッセージ表示（optional）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | cardManager.test.js: addCard() | spec.ts |
| AC-02 | cardManager.test.js: addCard() validates empty | spec.ts |
| AC-03 | cardManager.test.js: deleteCard() | spec.ts |
| AC-04 | ― | spec.ts |
| AC-05 | ― | spec.ts |
| AC-06 | studyManager.test.js: advanceStudy() mark-know | spec.ts |
| AC-07 | studyManager.test.js: advanceStudy() mark-again | spec.ts |
| AC-08 | ― | spec.ts |
| AC-09 | ― | spec.ts |
| AC-10 | ― | spec.ts |
