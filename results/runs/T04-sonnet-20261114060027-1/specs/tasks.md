# 習慣トラッカー タスク

> 土台（マークアップ）→ ロジック（単体テスト）→ 画面結線 → 保存/削除 → 全ACのE2Eの順に進める。
> 1タスク＝1時間以内・1コミット。ロジック系タスクはテストと実装を同じタスク内でRed→Greenする。
> 全タスク完了かつ `npm test` と `npm run e2e` が通ることを完了条件とする。

- [x] T01: `apps/habit/manifest.json` と `apps/habit/index.html` を作る。`app-root`・`new-habit`・`add-habit` と、`habit-item` 1件分（`habit-name`/`habit-check`/`habit-streak`/`habit-delete`）の静的マークアップを置く (setup)
- [x] T02: `apps/habit/logic.js` に `canAddHabit`・`addHabit` を実装（空白のみ・重複名は不可、末尾に streak=0 で追加）。`tests/unit/logic.test.js` で確認 (AC-01, AC-02, AC-03)
- [x] T03: `logic.js` に `checkHabit`・`uncheckHabit` を実装（前日ならstreak+1、空きがあれば1、uncheckはprevStreak/prevLastDateへ戻す）。単体テストに追加 (AC-04, AC-05, AC-06)
- [x] T04: `logic.js` に `isChecked`（lastDate===今日）を実装し、streakは未チェックの間不変であることを単体テストで確認 (AC-07, AC-11)
- [x] T05: `apps/habit/main.js` で `mountApp` と一覧描画・追加フォームを結線。チェックボックス操作で `logic.js` を呼び再描画し `done` class を切り替える (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-11)
- [x] T06: `main.js` に `storage.get`/`storage.set` での読込・保存（配列でない場合は空配列）と、`habit-delete` → `ui.confirm` → 削除・保存を追加 (AC-07, AC-08, AC-09, AC-10)
- [x] T07: `tests/e2e/habit.spec.ts` に AC-01〜AC-11 のE2Eを書き、`npm run e2e` を通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11)
