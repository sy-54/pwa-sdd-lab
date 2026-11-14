# 単語帳 設計

> ロジック（カード一覧の追加・削除・検証、学習キューの進行）は `logic.js` に純粋関数として分離し、単体テストする。
> 保存キーは `cards` 1つ（表・裏・追加順の配列）。学習の進行状態は保存せず、`main.js` のメモリ内だけに持つ。
> 画面（DOM・イベント・`storage` 呼び出し）は `main.js` に集約し、E2E で確認する。

## モジュール構成
- `apps/flashcards/index.html`：一覧／学習／結果の3画面のマークアップと `data-testid`
- `apps/flashcards/main.js`：画面の出し分け、イベント処理、`storage` の読み書き、`logic.js` の呼び出し
- `apps/flashcards/logic.js`：DOM に触れない純粋関数（カード一覧の検証・追加・削除、学習キューの進行）

## データモデル
- キー `cards`：`[{ front: string, back: string }, ...]`（追加順）。例：`[{"front":"apple","back":"りんご"}]`
- 壊れた値（配列でない、要素が null、`front`／`back` が文字列でない等）は `logic.js` の `normalizeCards` で `[]` に変換する。保存自体は書き換えない
- 学習状態（未保存、`main.js` のメモリのみ）：`{ queue: [{front, back, everAgain}], total, knownCount, onceKnownCount }`
  - `queue`：学習中の残りカード（先頭が表示中）。`everAgain` はその回で一度「まだ」にしたか
  - `total`：学習開始時の枚数（固定）。`knownCount`：`queue` から完全に除いた枚数。`onceKnownCount`：一度も「まだ」にせず覚えた枚数

## 使用するSDK API
- `mountApp({ title })`：起動時に1回
- `await storage.get('cards', [])`：起動時にカード一覧を読む
- `await storage.set('cards', cards)`：追加・削除のたびに保存する
- `ui.confirm`／`notify`／`camera`：なし（削除は確認なし、通知・カメラは使わない）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `normalizeCards` が既定値・空データで `[]` を返す | flashcards.spec.ts |
| AC-02 | logic.test.js: `addCard` が前後空白を除いて最後尾に追加し、新しい配列を返す | flashcards.spec.ts |
| AC-03 | logic.test.js: `addCard` が表・裏どちらか空（空白のみ含む）で元の配列を返す | flashcards.spec.ts |
| AC-04 | logic.test.js: `removeCard` が指定位置のカードを除いた配列を返す | flashcards.spec.ts |
| AC-05 | logic.test.js: `canStartStudy([])` が `false` | flashcards.spec.ts |
| AC-06 | logic.test.js: `startStudy` がカード順を保って `queue` を作る、`currentCard` が先頭を返す | flashcards.spec.ts |
| AC-07 | logic.test.js: `knowCurrent` が `knownCount` を増やし `queue` を1枚進める | flashcards.spec.ts |
| AC-08 | logic.test.js: `againCurrent` で最後尾に回し `everAgain` を立てる／その後の `knowCurrent` が `onceKnownCount` を増やさない | flashcards.spec.ts |
| AC-09 | ― | flashcards.spec.ts |
| AC-10 | ― | flashcards.spec.ts |
