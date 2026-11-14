# カウンタ 設計

> ロジック（counter.js）と画面（main.js）を分ける。
> 保存は localStorage の1キーに整数を文字列で入れる。
> ロジックは単体テスト、画面はE2Eで確認する。

## モジュール構成
- `apps/counter/counter.js`：純粋関数 `inc(n)` `dec(n)` `parse(raw)`。DOM に触れない
- `apps/counter/main.js`：DOM の描画とイベント、読み書き
- `apps/counter/index.html`：UI契約の testid を持つ静的マークアップ

## データモデル
- キー `counter:value`、値は `"0"` 以上の整数文字列。`parse` が不正値を 0 に直す

## 使用するSDK API
- なし（localStorage を直接使う）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | counter.test.js: inc | counter.spec.ts |
| AC-02 | counter.test.js: dec は 0 で止まる | counter.spec.ts |
| AC-03 | ― | counter.spec.ts |
| AC-04 | counter.test.js: parse | counter.spec.ts |
