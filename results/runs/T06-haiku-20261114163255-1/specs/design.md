# カウンタ 設計

> ロジック（増減・リセット・値の検証）を DOM に触れない純粋関数モジュールに分離し、画面側はイベント処理と表示更新・保存呼び出しのみを担う。
> localStorage には文字列キーに値を文字列として保存し、不正値は初期値として上書きする。
> ロジックは単体テスト、画面挙動とlocalStorage連携はE2Eで確認する。

## モジュール構成
- `apps/counter/index.html`：画面構造（`app-root` / `count` / `inc` / `dec` / `reset` / `step` / `goal` / `goal-reached`）とスクリプト読み込み。
- `apps/counter/counter.js`：純粋関数（`increment`、`decrement`、`reset`、`parseCount`、`incrementWithStep`、`decrementWithStep`、`isGoalReached`、`parseStep`、`parseGoal`）。DOM・localStorageに触れない。
- `apps/counter/main.js`：DOM取得、ボタン・select・input のイベント登録、`counter.js` の呼び出し、localStorage への読み書きと画面表示の更新。

## データモデル
- キー `counter:count`：0以上の整数を表す文字列（例：`"3"`）。壊れた値は `parseCount` で0として扱い即時上書き。
- キー `counter:step`：`"1"` / `"5"` / `"10"` のいずれか。初期値 `"1"`。壊れた値は `parseStep` で `"1"` として上書き。
- キー `counter:goal`：0以上の整数を表す文字列、またはキーが存在しない（未設定）。壊れた値は `parseGoal` で削除。

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
| AC-07 | `counter.test.js`: `parseStep` で初期値 `"1"` を返す | `counter.spec.ts`: 初期表示で `step` が `1` を選択 |
| AC-08 | ― | `counter.spec.ts`: `step` を `5` に選択・リロードで `5` が選択されたまま |
| AC-09 | `counter.test.js`: `incrementWithStep(0, 5)` が `5` を返す | ― |
| AC-10 | `counter.test.js`: `decrementWithStep(3, 5)` が `0` を返す（5未満なので0） | ― |
| AC-11 | `counter.test.js`: `isGoalReached(10, 10)` が `true`、`isGoalReached(5, 10)` が `false` | ― |
| AC-12 | ― | `counter.spec.ts`: `goal` に `10` を入力し `count` が `5` のとき `goal-reached` が非表示 |
| AC-13 | ― | `counter.spec.ts`: `goal` に `10` を入力後 `reset` で `count` が `0` になるが `goal` は `10` のまま |
