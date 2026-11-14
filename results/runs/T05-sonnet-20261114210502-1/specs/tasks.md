# 支出メモ タスク

> 土台（マークアップ）→ ロジック（単体テスト）→ 画面結線 → 削除・保存 → E2E の順に進める。
> 1タスク1コミット、1時間以内。ロジックは Red→Green を1タスク内で回す。
> 全AC（AC-01〜AC-10）がE2Eで通った時点で完了。

- [x] T01: `apps/expense/manifest.json` と `index.html` を作り、入力行（`amount`/`category`/`add`）・一覧コンテナ・`total`・分類ごと4つの `category-total`（`data-category` 付き）を静的に配置する (setup)
- [x] T02: `logic.js` に `validateAmount`（空/`0`/負/非数字/小数を不正と判定）と `formatAmount`（3桁カンマ整形）を実装し `logic.test.js` で検証する (AC-03, AC-06)
- [x] T03: `logic.js` に保存データ正規化（配列でなければ`[]`、壊れた要素を除外）と `filterThisMonth`（ローカル年月で絞り込み・新しい順）を実装し `logic.test.js` で検証する (AC-07, AC-09)
- [x] T04: `logic.js` に `sumTotal` と `sumByCategory`（4分類すべて0を含めて返す）を実装し `logic.test.js` で検証する (AC-02, AC-10)
- [x] T05: `main.js` で `mountApp`・`storage.get('records', [])` を呼び、正規化＋今月分フィルタ結果を一覧・`total`・`category-total` に描画する (AC-07, AC-09, AC-10)
- [x] T06: `main.js` の `add` クリックで `validateAmount` 失敗時は `ui.toast` のみ、成功時は新規記録を先頭に追加して `storage.set` し再描画・入力欄リセットする (AC-01, AC-02, AC-03, AC-06)
- [x] T07: `main.js` の `expense-delete` クリックで `ui.confirm` 後、OKなら保存データから対象記録を除去して `storage.set`・再描画する (AC-04, AC-05)
- [x] T08: 全ACのE2Eを `tests/e2e/expense.spec.ts` に書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
