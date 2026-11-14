# カウンタ 設計

> ロジック（状態・計算）を DOM から分離し、純粋関数で単体テストできるようにする。
> ローカルストレージにカウント値を保存し、不正値は 0 に初期化する。
> 単体テストでロジックを確認し、E2E でユーザー操作とストレージを統合テストする。

## モジュール構成
- `apps/counter/index.html`：DOM 構造、イベントハンドリング、画面更新
- `apps/counter/counter.js`：カウント状態の管理（増加、減少、リセット）
- `apps/counter/storage.js`：ローカルストレージの保存・読み込み・初期化

## データモデル
- **キー**：`counter-value`
- **値**：整数（例：`0`、`5`、`100`）
- **壊れた値の扱い**：NaN、負数、null、undefined、非整数は 0 に初期化

## 使用するSDK API
- なし。ローカルストレージのみ使用（`localStorage.getItem`、`localStorage.setItem`）。

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | counter.test.js: 初期値は 0 | counter.spec.ts |
| AC-02 | counter.test.js: 増加 | counter.spec.ts |
| AC-03 | counter.test.js: 減少 | counter.spec.ts |
| AC-04 | counter.test.js: 0 以下にならない | counter.spec.ts |
| AC-05 | counter.test.js: リセット | counter.spec.ts |
| AC-06 | ― | counter.spec.ts |
| AC-07 | storage.test.js: 不正値初期化 | counter.spec.ts |
