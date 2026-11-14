# カウンタ タスク分解

> HTML に新しい UI要素（step select、goal input、goal-reached）を配置する。
> counter.js に検証・増減・目標判定の関数を追加して単体テストで確認する。
> main.js で各イベント処理と localStorage 連携を実装し、最後に E2E テストで全 AC を確認する。

- [x] T01: index.html に `step` select（値 1/5/10）と `goal` input、`goal-reached` 表示を追加 (setup)
- [x] T02: counter.js に `parseCount`、`parseStep`、`parseGoal`、`parseStore`、`saveStore` を実装、単体テスト作成 (AC-06, AC-12, AC-13, AC-14)
- [x] T03: counter.js に `increment`、`decrement`、`reset` を実装、単体テスト追加 (AC-02, AC-03, AC-04, AC-07, AC-08)
- [x] T04: counter.js に `isGoalReached` を実装、単体テスト追加 (AC-10, AC-11)
- [x] T05: counter.js に `migrateData` を実装、単体テスト追加 (AC-15)
- [x] T06: main.js で初期化と状態復元を実装（parseStore、migrateData 使用）、イベント処理を実装 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15)
- [x] T09: E2E テスト作成、全 AC を確認して実装完了 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15)
