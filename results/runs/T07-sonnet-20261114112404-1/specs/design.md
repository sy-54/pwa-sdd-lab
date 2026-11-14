# 単語帳 設計

> ロジック（カード操作・学習キューの進行）は DOM に触れない純粋関数 `logic.js` に分離し、`main.js` は描画・イベント・`storage` 呼び出しだけを担う。
> 保存キーは `cards` 1本（配列）のみ。学習中の出題キューや判定結果はメモリ上の状態のみで保存しない。
> ラウンドロビンは「先頭を取り出し、`know` なら捨てる／`again` なら末尾に積み直す」という単純なキュー操作で実現する。

## モジュール構成
- `apps/flashcards/index.html`：画面のDOM雛形、SDKとCSSの読み込み
- `apps/flashcards/manifest.json`：アプリ定義（id, name, icon, description）
- `apps/flashcards/main.js`：描画・イベント処理・`storage` 呼び出し（画面層）
- `apps/flashcards/logic.js`：カード操作・学習進行の純粋関数（ロジック層）

## データモデル
- キー `cards`：値は `{front: string, back: string}` の配列。登録順を保持する
  - 例：`[{"front":"apple","back":"りんご"}, {"front":"dog","back":"犬"}]`
  - 壊れた値（配列でない、要素が `front`／`back` を文字列として持たない）は `normalizeCards()` で空配列 `[]` に変換して扱う。次の追加・削除時に正しい形で上書き保存される
- 学習セッションの状態（保存しない。`main.js` がメモリに保持）
  - `logic.js` の `startStudy(cards)` が返す `{ queue, total, knownCount, firstTryOk }`
  - `queue`：`{id, front, back}` の配列（`id` は元配列の添字）。先頭が出題中のカード
  - `total`：学習開始時の総枚数（固定）、`knownCount`：`know` 済み枚数
  - `firstTryOk`：一度も `again` を押していないカードの `id` の集合（終了時の `size` が結果の「1回で覚えた枚数」）

## 使用するSDK API
- `mountApp({ title: '単語帳' })`：起動時に1度呼びヘッダーを表示
- `await storage.get('cards', [])` / `await storage.set('cards', cards)`：カードの読込・保存（追加・削除のたびに呼ぶ）
- `ui.toast(文言)`：空欄のまま追加しようとしたときの通知（AC-11）
- `ui.confirm`：使わない（D4：削除は確認なしの即時実行）
- `notify.send`／`camera.takePhoto`：使わない（要求にない機能）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | flashcards.test.js: `canStartStudy([])` が `false` | flashcards.spec.ts |
| AC-02 | flashcards.test.js: `addCard` が末尾に追加し入力を返す | flashcards.spec.ts |
| AC-03 | flashcards.test.js: `removeCard` が指定枚を除いた配列を返す | flashcards.spec.ts |
| AC-04 | flashcards.test.js: `startStudy` の `queue` が登録順 | flashcards.spec.ts |
| AC-05 | ― | flashcards.spec.ts |
| AC-06 | flashcards.test.js: `again`→`know`→`know` の順で `currentCard` がA再出題 | flashcards.spec.ts |
| AC-07 | flashcards.test.js: `formatProgress` が `know` 後「1/3」を返す | flashcards.spec.ts |
| AC-08 | flashcards.test.js: `again` 後 `know` のカードは `firstTryOk` から除外され結果枚数が一致 | flashcards.spec.ts |
| AC-09 | ― | flashcards.spec.ts |
| AC-10 | flashcards.test.js: `normalizeCards` が保存済み配列をそのまま返す | flashcards.spec.ts |
| AC-11 | flashcards.test.js: `addCard` が前後空白のみの入力を拒否する | flashcards.spec.ts |
