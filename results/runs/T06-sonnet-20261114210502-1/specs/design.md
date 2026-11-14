# カウンタ 設計

> ロジック（増減・リセット・値の検証・ステップ/目標の判定）を DOM に触れない純粋関数モジュールに分離し、画面側はイベント処理と表示更新・保存呼び出しのみを担う。
> localStorage には `count`/`step`/`goal` を別々の文字列キーで保存する。不正値や未保存キーはそれぞれの初期値として扱い即時上書きする（既存の `count` キーのみの保存データとも互換）。
> ロジックは単体テスト、画面挙動とlocalStorage連携はE2Eで確認する。

## モジュール構成
- `apps/counter/index.html`：画面構造（`app-root` / `count` / `inc` / `dec` / `reset` / `step` / `goal` / `goal-reached`）とスクリプト読み込み。
- `apps/counter/counter.js`：純粋関数（`increment`、`decrement`、`reset`、`parseCount`、`parseStep`、`parseGoal`、`isGoalReached`）。`increment`/`decrement` は `step` を第2引数で受ける。DOM・localStorageに触れない。
- `apps/counter/main.js`：DOM取得、ボタンクリック・`step`変更・`goal`入力のイベント登録、`counter.js` の呼び出し、localStorage への読み書きと画面表示（`goal-reached` の表示切替含む）の更新。

## データモデル
- キー：`counter:count`（既存）、`counter:step`（新規）、`counter:goal`（新規）
- `counter:count`：0以上の整数を表す文字列（例：`"3"`）。壊れた値・キーなしは `parseCount` で `0` として扱い、`"0"` を即時上書きする（既存仕様のまま）。
- `counter:step`：`"1"`/`"5"`/`"10"` のいずれかの文字列。キーなし・それ以外の値は `parseStep` で `"1"` として扱い、`"1"` を即時上書きする。
- `counter:goal`：1以上の整数を表す文字列、または「目標なし」を表す空文字列。キーなし・空文字・`"0"`・負数・小数・数値以外は `parseGoal` で「目標なし」（空文字）として扱い、空文字を即時上書きする。
- 既存データ互換：更新前の保存データは `counter:count` のみ持つ。`counter:step`/`counter:goal` はキーなし＝不正値と同じ扱いになるため、追加のマイグレーション処理は不要（AC-13）。

## 使用するSDK API
- なし（この環境に該当SDKディレクトリが存在しないため）。

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | `counter.test.js`: 値なし/不正値を `parseCount` で0に解釈する | `counter.spec.ts`: 初期表示で `count` が `0` |
| AC-02 | `counter.test.js`: `increment(count, step)` が `count+step` を返す | `counter.spec.ts`: `inc` クリックで `count` が `1` |
| AC-03 | `counter.test.js`: `decrement(0, step)` が `0` を返す | `counter.spec.ts`: `dec` クリックで `count` が `0` のまま |
| AC-04 | `counter.test.js`: `reset` が `0` を返す | `counter.spec.ts`: `inc`×3後に `reset` で `count` が `0` |
| AC-05 | ― | `counter.spec.ts`: `inc`×2後にリロードして `count` が `2` |
| AC-06 | `counter.test.js`: `parseCount` が不正文字列を `0` に解釈する | `counter.spec.ts`: 不正値をセットして開くと `count` が `0` かつ保存値が `"0"` |
| AC-07 | `counter.test.js`: `increment(0, 10)` が `10` を返す | `counter.spec.ts`: `step` を `10` にして `inc` で `count` が `10` |
| AC-08 | `counter.test.js`: `decrement(3, 10)` が `0` を返す | `counter.spec.ts`: `step` を `10` にして `dec` で `count` が `0` |
| AC-09 | `counter.test.js`: `isGoalReached(5, 5)` が `true` | `counter.spec.ts`: `goal=5`,`step=5` で `inc` 後に `goal-reached` が表示される |
| AC-10 | `counter.test.js`: `isGoalReached(0, 10)` が `false` | `counter.spec.ts`: `goal=10` のまま表示して `goal-reached` が非表示 |
| AC-11 | `counter.test.js`: `parseGoal("0")` が空文字（目標なし）を返す | `counter.spec.ts`: `goal` に `0` を入力しても `goal-reached` が非表示 |
| AC-12 | ― | `counter.spec.ts`: `step=5`,`goal=20` にしてリロードし両方復元される |
| AC-13 | `counter.test.js`: `parseStep`/`parseGoal` がキーなし（`null`）を初期値に解釈する | `counter.spec.ts`: `counter:count` のみ保存した状態で開き `count=7`,`step=1`,`goal` 空欄 |
