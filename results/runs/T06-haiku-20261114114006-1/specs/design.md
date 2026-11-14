# カウンタ 設計

> ロジック（増減・リセット・値の検証・ステップ処理・目標判定）を DOM に触れない純粋関数モジュールに分離し、画面側はイベント処理と表示更新・保存呼び出しのみを担う。
> localStorage には `counter:data` キーに JSON（count、step、goal）を保存。旧バージョンの単一 count 値から移行時は自動的にステップ=1、目標=未設定で初期化。
> ロジックは単体テスト、画面挙動と保存連携はE2Eで確認する。

## モジュール構成
- `apps/counter/index.html`：画面構造（`app-root` / `count` / `inc` / `dec` / `reset` / `step` / `goal` / `goal-reached`）とスクリプト読み込み。
- `apps/counter/counter.js`：純粋関数（`increment`、`decrement`、`reset`、`isGoalReached`、`parseCount`、`parseStep`、`parseGoal`、`migrateData`）。DOM・localStorageに触れない。
- `apps/counter/main.js`：DOM取得、ボタン・入力のイベント登録、`counter.js` の呼び出し、localStorage への読み書きと画面表示の更新。

## データモデル
- キー：`counter:data`
- 値：JSON 文字列（例：`{"count":3,"step":5,"goal":10}`）。count は0以上の整数、step は1/5/10、goal は1以上の整数または null（未設定）。
- 旧バージョン互換性：localStorage にキー `counter:count` の単一数値が存在する場合は `migrateData` で読み込み、新フォーマット（count+step=1+goal=null）に変換して `counter:data` に上書き保存し、旧キーは削除する。
- 壊れた値の扱い：count は0未満または非整数は0、step は1/5/10以外は1、goal は1未満または非整数は null として扱い、保存データも即時上書きする。

## 使用するSDK API
- なし（この環境に該当SDKディレクトリが存在しないため）。

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | `counter.test.js`: 新規時 count=0 に初期化 | `counter.spec.ts`: 保存データなしで開くと `count` が `0` |
| AC-02 | `counter.test.js`: `increment` が step 加算を返す | `counter.spec.ts`: `inc` クリックで `count` が増加 |
| AC-03 | `counter.test.js`: `decrement(0, step)` が `0` を返す | `counter.spec.ts`: `count=0` で `dec` クリックしても `0` のまま |
| AC-04 | `counter.test.js`: `reset` が `0` を返す | `counter.spec.ts`: `count=3` で `reset` クリックして `count` が `0` |
| AC-05 | ― | `counter.spec.ts`: `inc`×2後にリロードして値が復元される |
| AC-06 | `counter.test.js`: `parseCount` が不正値を0に解釈 | `counter.spec.ts`: 不正な保存値から開くと `count=0` に初期化 |
| AC-07 | `counter.test.js`: `increment(0, 5)` が5を返す | `counter.spec.ts`: `step=5` で `inc`×2クリックして `count=10` |
| AC-08 | `counter.test.js`: `decrement(20, 10)` が10を返す | `counter.spec.ts`: `step=10` で `count=20` から `dec` クリックして `count=10` |
| AC-09 | ― | `counter.spec.ts`: `goal` 入力欄に `5` を入力すると表示される |
| AC-10 | `counter.test.js`: `isGoalReached(6, 5)` が true | `counter.spec.ts`: `count>=goal` で `goal-reached` が表示 |
| AC-11 | `counter.test.js`: `isGoalReached(2, 5)` が false | `counter.spec.ts`: `count<goal` で `goal-reached` は未表示 |
| AC-12 | `counter.test.js`: `parseGoal(0)` が null | `counter.spec.ts`: `goal` を `0` に変更すると `goal-reached` が消える |
| AC-13 | `counter.test.js`: `parseGoal('')` が null | `counter.spec.ts`: `goal` を空欄にすると `goal-reached` が消える |
| AC-14 | ― | `counter.spec.ts`: `count` / `step` / `goal` 全て保存・復元される |
| AC-15 | `counter.test.js`: `migrateData` が旧形式を新形式に変換 | `counter.spec.ts`: count のみの旧データから開くと step=1, goal未設定で表示 |
