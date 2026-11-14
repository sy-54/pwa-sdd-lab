# カウンタ 設計

> ロジック（増減・リセット・値の検証）を DOM に触れない純粋関数モジュールに分離し、画面側はイベント処理と表示更新・保存呼び出しのみを担う。
> localStorage には文字列キーに整数値を文字列として保存し、不正値は0として扱い即時上書きする。
> ロジックは単体テスト、画面挙動とlocalStorage連携はE2Eで確認する。

## モジュール構成
- `apps/counter/index.html`：画面構造（`app-root` / `count` / `inc` / `dec` / `reset`）とスクリプト読み込み。
- `apps/counter/counter.js`：純粋関数（`increment`、`decrement`、`reset`、`parseCount`）。DOM・localStorageに触れない。
- `apps/counter/main.js`：DOM取得、ボタンのクリックイベント登録、`counter.js` の呼び出し、localStorage への読み書きと画面表示の更新。

## データモデル
- キー：`counter:count`
- 値：0以上の整数を表す文字列（例：`"3"`）
- 壊れた値の扱い：キーが存在しない、`parseCount` で0以上の整数として解釈できない（例：`"abc"`、`"-1"`、`"1.5"`、空文字）場合は `0` として扱い、`localStorage` にも `"0"` を即時上書きする。

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
