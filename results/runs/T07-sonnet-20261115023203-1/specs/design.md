# 単語帳 設計

> ロジック（カード操作・学習セッション）は `logic.js` に純粋関数として集約し、画面（DOM・イベント・storage）は `main.js` に分離する。
> 保存は `cards` キー1つに `{front, back}[]` を丸ごと入れる。学習の途中経過はメモリ内の状態のみで保存しない。
> 単体テストは `logic.js` の全関数、E2E は画面遷移・保存の再読み込みを確認する。

## モジュール構成
- `apps/flashcards/index.html`：一覧／学習／結果の3画面のマークアップ（表示切替は `hidden` 属性）
- `apps/flashcards/manifest.json`：アプリ定義
- `apps/flashcards/logic.js`：カード一覧の操作（追加・削除・保存値の検証）と学習セッションの状態遷移（開始・めくり・覚えた・まだ・進捗・結果）。DOM に触れない純粋関数のみ
- `apps/flashcards/main.js`：`mountApp`・`storage` の呼び出し、DOM 要素の取得・描画、イベント配線。`logic.js` の関数を呼ぶだけで判断ロジックを持たない

## データモデル
- キー `cards`：値は `{front: string, back: string}[]`。例：`[{"front":"apple","back":"りんご"}]`
  - 読み込んだ値が配列でない（壊れている）場合は `[]` として起動する（`logic.normalizeCards`）
- 学習の途中経過（出題列・進捗・既覚え状態）は `storage` に保存しない。`main.js` のメモリ変数（学習セッション）のみに保持し、再読み込みで消える
- 学習セッションの形（`logic.startSession` の戻り値）：
  - `{ total, knownCount, perfectCount, revealed, current, rest }`
  - `current`：`{ front, back, missed } | null`（`missed` は一度でも「まだ」を付けたか）
  - `rest`：まだ出題していない／回された `{front, back, missed}` の配列
  - `current === null` で学習終了（出題列が0件）

## 使用するSDK API
- `mountApp({ title: '単語帳' })`：起動時に1度
- `await storage.get('cards', [])`：起動時にカード一覧を読む
- `await storage.set('cards', cards)`：カードの追加・削除のたびに保存（学習セッションは保存しない）
- `ui.confirm`／`notify.send`／`camera.takePhoto`：なし（削除は確認なしの即時実行、通知・カメラを使う機能がないため）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `addCard` が表裏入力時に末尾へ追加する | flashcards.spec.ts |
| AC-02 | logic.test.js: `addCard` が表または裏が空のとき変化なしで返す | flashcards.spec.ts |
| AC-03 | logic.test.js: `startSession`／`flip` で1件目の表裏が取得できる | flashcards.spec.ts |
| AC-04 | logic.test.js: `again` でカードが `rest` 末尾へ回り次の `current` になる | flashcards.spec.ts |
| AC-05 | logic.test.js: `know` で `perfectCount`／`current===null` になり `resultKnown` が1 | flashcards.spec.ts |
| AC-06 | logic.test.js: `deleteCard` が指定インデックスを除いた配列を返す | flashcards.spec.ts |
| AC-07 | logic.test.js: `startSession([])` が `null` を返す | flashcards.spec.ts |
| AC-08 | logic.test.js: `normalizeCards` が正常な配列をそのまま返す | flashcards.spec.ts（再読み込み後の表示を確認） |
| AC-09 | logic.test.js: `revealed===false` のとき `know`／`again` が状態を変えずに返す | flashcards.spec.ts |
