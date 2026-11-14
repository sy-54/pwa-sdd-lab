# カウンタ 設計

> ロジック（増減・リセット・値の検証）を DOM に触れない純粋関数モジュールに分離し、画面側はイベント処理と表示更新・保存呼び出しのみを担う。
> localStorage には文字列キーに値を文字列として保存し、不正値は既定値として扱う。既定値のとき `count`/`step` は即時上書きするが、`goal` は入力欄に書き戻さない。
> ロジックは単体テスト、画面挙動とlocalStorage連携はE2Eで確認する。

## モジュール構成
- `apps/counter/index.html`：画面構造（`app-root` / `count` / `inc` / `dec` / `reset` / `step` / `goal` / `goal-reached`）とスクリプト読み込み。
- `apps/counter/counter.js`：純粋関数（`increment`、`decrement`、`reset`、`parseCount`、`parseStep`、`parseGoal`、`isGoalReached`）。DOM・localStorageに触れない。`increment`/`decrement` は第2引数 `step`（既定1）を加減する。
- `apps/counter/main.js`：DOM取得、`inc`/`dec`/`reset` クリックと `step`/`goal` の `change` イベント登録、`counter.js` の呼び出し、localStorage への読み書きと `count`/`goal-reached` 表示の更新。

## データモデル
- キー：`counter:count`
- 値：0以上の整数を表す文字列（例：`"3"`）
- 壊れた値の扱い：キーが存在しない、`parseCount` で0以上の整数として解釈できない（例：`"abc"`、`"-1"`、`"1.5"`、空文字）場合は `0` として扱い、`localStorage` にも `"0"` を即時上書きする。
- キー：`counter:step`
- 値：`"1"` / `"5"` / `"10"` のいずれか
- 壊れた値の扱い：キーが存在しない、`parseStep` でこの3値のいずれにも解釈できない場合は `"1"` として扱い、`localStorage` にも `"1"` を即時上書きする（更新前からの利用者もこの経路で `1` になる）。
- キー：`counter:goal`
- 値：`goal` 入力欄の文字列をそのまま保存（例：`"5"`、空文字）
- 壊れた値の扱い：キーが存在しない、`parseGoal` で1以上の整数として解釈できない（空欄・0以下・小数・数値でない）場合は読み込み時に `goal` 入力欄を空欄表示する。`localStorage` は上書きしない（`change` 時のみ保存）。

## 使用するSDK API
- なし（この環境に該当SDKディレクトリが存在しないため）。

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | `counter.test.js`: 値なし/不正値を `parseCount` で0に解釈する | `counter.spec.ts`: 初期表示で `count` が `0` |
| AC-02 | `counter.test.js`: `increment` が+1を返す | `counter.spec.ts`: `inc` クリックで `count` が `1` |
| AC-03 | `counter.test.js`: `decrement(0)` が `0` を返す | `counter.spec.ts`: `dec` クリックで `count` が `0` のまま |
| AC-04 | `counter.test.js`: `reset` が `0` を返す | `counter.spec.ts`: `inc`×3後に `reset` で `count` が `0` |
| AC-05 | ― | `counter.spec.ts`: `inc`×2後にリロードして `count` が `2` |
| AC-06 | `counter.test.js`: `parseCount` が不正文字列を `0` に解釈する | `counter.spec.ts`: 不正値をセットして開くと `count` が `0` かつ保存値が `"0"` |
| AC-07 | `counter.test.js`: `increment(0, 5)` が `5` を返す | `counter.spec.ts`: `step` を `5` にして `inc` で `count` が `5` |
| AC-08 | `counter.test.js`: `decrement(3, 5)` が `0` を返す | `counter.spec.ts`: `count=3`・`step=5` で `dec` して `count` が `0` |
| AC-09 | `counter.test.js`: `isGoalReached(5, 5)` が `true` | `counter.spec.ts`: `goal=5` で `inc` して `count=5` になると `goal-reached` 表示 |
| AC-10 | `counter.test.js`: `isGoalReached(3, null)` が `false` | `counter.spec.ts`: `goal` 未入力なら `goal-reached` 非表示 |
| AC-11 | `counter.test.js`: `isGoalReached(4, 5)` が `false` | `counter.spec.ts`: `dec` で `count` が `goal` 未満に戻ると `goal-reached` 非表示 |
| AC-12 | `counter.test.js`: `parseStep`/`parseGoal` が有効値をそのまま解釈する | `counter.spec.ts`: `step=10`・`goal=20` 設定後リロードで両方残る |
| AC-13 | `counter.test.js`: `parseStep`（`step`キーなし）が `1` を返す、`parseGoal`（`goal`キーなし）が `null` を返す | `counter.spec.ts`: `count`のみ保存の旧データで開くと `count=7`・`step=1`・`goal`空欄 |
