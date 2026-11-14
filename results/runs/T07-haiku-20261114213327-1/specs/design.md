# 単語帳 設計

> ロジックと UI を分離。ロジックは card（配列）と study（学習状態）を操作する純粋関数。保存は storage で、途中経過は保存しない。
> カード追加・削除・学習フロー・結果計算を logic.js で実装。main.js は DOM・イベント・保存呼び出し。
> テスト環境で確認できないのは OS 通知だけだが、本アプリは通知を使わない。

## モジュール構成
- `index.html`：ページ構成（一覧・学習・結果の3画面）
- `main.js`：画面制御（DOM・イベント・storage の呼び出し）
- `logic.js`：純粋関数（カード操作・学習ロジック）

## データモデル
- `cards`：`[{ front: "apple", back: "りんご" }, ...]` → storage キー `cards`（JSON 配列）。壊れた値は空配列に初期化。
- `study`：`{ remaining: [ { index, known: false }, ... ], completed: 0, total: 3 }`。remaining は未完了カード、known は初見で「まだ」を押したか。途中経過は保存しない（アプリ再起動で一覧に戻る）。

## 使用するSDK API
- `storage.get(key, 既定値)`：起動時にカード一覧を復元
- `storage.set(key, value)`：カード追加・削除時に保存
- `ui.confirm(文言, オプション)`：削除確認（spec では「確認なし」で決定済み）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.addCard: 新規カード追加 | e2e/study.spec.ts: 一覧に表示 |
| AC-02 | ― | e2e/study.spec.ts: 表が空でボタン無効 |
| AC-03 | ― | e2e/study.spec.ts: 裏が空でボタン無効 |
| AC-04 | logic.deleteCard: カード削除 | e2e/study.spec.ts: 一覧から消える |
| AC-05 | ― | e2e/study.spec.ts: カード0枚でボタン無効 |
| AC-06 | ― | e2e/study.spec.ts: 学習画面遷移、表を表示 |
| AC-07 | ― | e2e/study.spec.ts: めくるボタンで裏表示 |
| AC-08 | logic.processAnswer: 「覚えた」で進捗+1 | e2e/study.spec.ts: 表が切り替わる |
| AC-09 | logic.processAnswer: 「まだ」で再表示 | e2e/study.spec.ts: 同じ表が再表示 |
| AC-10 | logic.getResult: 全完了で結果画面 | e2e/study.spec.ts: 結果画面表示 |
| AC-11 | logic.getResult: 1回で覚えた数を計算 | e2e/study.spec.ts: 結果に「2」表示 |
| AC-12 | ― | e2e/study.spec.ts: 再起動後カード残存 |
| AC-13 | ― | e2e/study.spec.ts: 再起動後一覧に遷移 |
