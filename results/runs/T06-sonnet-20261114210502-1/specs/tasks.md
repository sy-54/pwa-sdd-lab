# カウンタ タスク

> 土台（step/goal/goal-reachedのマークアップ）→ ロジック（counter.jsの関数を単体テストから拡張）→ 画面の結線（main.jsの3キー保存）→ 既存データ互換の確認 → 全ACのE2Eの順に進める。
> 1タスク=1時間以内・1コミット。既存のAC-01〜AC-06とそのテストは変更せず残す。
> 全タスク終了時、`npm test` と `npm run e2e` が全AC（AC-01〜AC-13）で通る。

- [x] T01: `apps/counter/index.html` に `data-testid="step"`（select、option 1/5/10）、`data-testid="goal"`（input type="number"）、`data-testid="goal-reached"` を追加する (setup)
- [x] T02: `tests/unit/counter.test.js` に `increment`/`decrement` の第2引数（step）対応のテストを追加し、`apps/counter/counter.js` の `increment(count, step)`/`decrement(count, step)` を実装してテストを通す (AC-02, AC-03, AC-07, AC-08)
- [x] T03: `tests/unit/counter.test.js` に `parseStep` のテスト（`"1"`/`"5"`/`"10"` はそのまま、それ以外・null は `"1"`）を追加し、`counter.js` に実装してテストを通す (AC-13)
- [x] T04: `tests/unit/counter.test.js` に `parseGoal` のテスト（1以上の整数文字列は数値、空欄・`"0"`・負数・小数・非数値・null は空文字）を追加し、`counter.js` に実装してテストを通す (AC-11, AC-13)
- [x] T05: `tests/unit/counter.test.js` に `isGoalReached(count, goal)` のテスト（`goal` が空文字なら常に `false`、`count >= goal` で `true`）を追加し、`counter.js` に実装してテストを通す (AC-09, AC-10)
- [x] T06: `apps/counter/main.js` で `counter:step`/`counter:goal` を読み込み、`step`/`goal` の要素に反映し、`inc`/`dec` が選択中のstepを使うよう結線する (AC-02, AC-03, AC-07, AC-08, AC-12)
- [x] T07: `main.js` で `step` の変更・`goal` の入力イベントごとに `parseStep`/`parseGoal` で検証し、`counter:step`/`counter:goal` へ即時保存し、`goal-reached` の表示を `isGoalReached` で切り替える (AC-09, AC-10, AC-11, AC-12)
- [x] T08: `counter:count` のみ保存された既存データ（`counter:step`/`counter:goal` キーなし）で開いたときに `count=7`・`step=1`・`goal`空欄になることを手動確認する (AC-13)
- [x] T09: 全ACのE2Eを `tests/e2e/counter.spec.ts` に追記し（AC-07〜AC-13）、`npm run e2e` を全AC通過させる (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13)
