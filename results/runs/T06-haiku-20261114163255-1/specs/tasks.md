# カウンタ タスク

> 画面の土台 → ロジック（単体テスト）→ 画面結線（localStorage連携含む）→ E2Eの順に進める。
> 1タスク1時間以内・1コミット。Red→Greenは同一タスク内で回す。
> 全ACがE2Eで通れば完了。

- [x] T01: `apps/counter/index.html` に画面構造（`app-root`/`count`/`inc`/`dec`/`reset`）を置き、`main.js` を読み込む (setup)
- [x] T02: `apps/counter/counter.js` に純粋関数 `increment`/`decrement`/`reset`/`parseCount` を実装し `tests/unit/counter.test.js` で検証する (AC-01, AC-02, AC-03, AC-04, AC-06)
- [x] T03: `apps/counter/main.js` でDOM取得・ボタンのクリックイベントと `counter.js` 呼び出しをつなぎ、`count` 表示を更新する (AC-02, AC-03, AC-04)
- [x] T04: `main.js` に `localStorage`（キー `counter:count`）の読み込み・即時保存・不正値の0上書きを実装する (AC-01, AC-05, AC-06)
- [x] T05: 全ACの `tests/e2e/counter.spec.ts` を書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06)
- [x] T06: `apps/counter/index.html` に `step`（select）/`goal`（input）/`goal-reached`（表示）の要素を追加 (setup)
- [x] T07: `counter.js` に `incrementWithStep`/`decrementWithStep`/`isGoalReached`/`parseStep`/`parseGoal` を実装し `counter.test.js` で検証 (AC-07, AC-09, AC-10, AC-11)
- [x] T08: `main.js` で `step` select と `goal` input のイベント処理をつなぎ、値が変わると状態を更新する (AC-07, AC-08, AC-12, AC-13)
- [x] T09: `main.js` に `localStorage`（キー `counter:step`/`counter:goal`）の読み込み・即時保存・不正値の処理を実装 (AC-07, AC-08)
- [x] T10: 追加の AC（AC-07～AC-13）を `tests/e2e/counter.spec.ts` に追加して全て通す (AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13)
