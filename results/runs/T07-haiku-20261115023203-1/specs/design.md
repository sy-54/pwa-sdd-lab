# 単語帳 設計

> ロジック（カード管理、学習の進行）を純粋関数として `logic.js` に分離し、main.js で DOM 操作とイベント処理を行う。
> データは JSON 配列として `storage` に保存。学習途中の進捗は保存しない（メモリのみ）。
> 単体テストはロジック関数、E2E はUI全体の流れで確認。

## モジュール構成
- `main.js`：起動、DOM操作、イベントハンドラ、UI切り替え（一覧←→学習←→結果）、storage 呼び出し
- `logic.js`：カード追加・削除・妥当性チェック、学習キューの管理と進行ロジック（DOM なし）

## データモデル
- キー：`cards`
- 値（配列）：`[{ front: "apple", back: "りんご" }, ...]`
- 壊れた値（null、非配列、要素が不正）：空の配列 `[]` として扱う（一覧から開始）

## 使用するSDK API
- `mountApp()` - 起動時に1度（ヘッダーとスタイル挿入）
- `storage.get('cards', [])` - 一覧表示・学習開始時に読む
- `storage.set('cards', cards)` - カード追加・削除時に保存

## ACとテストの対応

| AC | 単体テスト | E2E |
|---|---|---|
| AC-01 | logic.js: addCard() 有効入力 | cards.spec.ts: カード追加 |
| AC-02 | logic.js: addCard() 空入力 | cards.spec.ts: 空入力で追加しない |
| AC-03 | logic.js: deleteCard() | cards.spec.ts: カード削除 |
| AC-04 | ― | cards.spec.ts: 学習開始 |
| AC-05 | ― | cards.spec.ts: 学習開始（0件） |
| AC-06 | ― | study.spec.ts: めくる |
| AC-07 | logic.js: 学習進行・覚えた | study.spec.ts: 覚えた |
| AC-08 | logic.js: 学習進行・まだ | study.spec.ts: まだで繰り返す |
| AC-09 | logic.js: 学習完了判定 | study.spec.ts: 完了 |
| AC-10 | ― | study.spec.ts: 結果から戻る |
| AC-11 | ― | cards.spec.ts: 再読み込み後も残る |
