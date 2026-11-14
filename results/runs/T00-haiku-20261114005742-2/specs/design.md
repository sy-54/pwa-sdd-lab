# カウンタ 設計

> ロジック（増減・保存・復元）を counter.js の純粋関数として、画面操作は index.html で分離。
> localStorage の counter-value キーに数値を JSON 文字列で保存。不正値は 0 にリセット。
> 単体テストでロジック、E2E でUI と保存の復元を確認。

## モジュール構成
- `apps/counter/counter.js`：増減・リセット・保存・復元のロジック（純粋関数）
- `apps/counter/index.html`：DOM 要素・ボタンイベント・ローカルストレージ呼び出し

## データモデル
- **キー**：`counter-value`（localStorage）
- **値**：JSON 文字列の整数（例：`"5"`、`"0"`）
- **初期値**：キーが存在しないまたは不正形式のとき、0 として扱う
- **不正値の扱い**：非整数、NaN、負数が保存されている場合は 0 にリセット

## 使用するSDK API
- なし。localStorage のみ使用。

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | counter.test.js: 初期状態 | e2e.spec.ts: ページ表示時 0 表示 |
| AC-02 | counter.test.js: inc 関数 | e2e.spec.ts: inc ボタン押下 |
| AC-03 | counter.test.js: dec 関数 | e2e.spec.ts: dec ボタン押下 |
| AC-04 | counter.test.js: dec の下限 | e2e.spec.ts: dec ボタン 0 で動作しない |
| AC-05 | counter.test.js: reset 関数 | e2e.spec.ts: reset ボタン押下 |
| AC-06 | counter.test.js: 保存処理 | e2e.spec.ts: ページ再読み込み時 復元 |
| AC-07 | counter.test.js: 復元時の不正値処理 | e2e.spec.ts: 壊れた値は 0 表示 |
