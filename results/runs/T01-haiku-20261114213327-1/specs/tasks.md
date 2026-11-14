# タイマー タスク

> UI マークアップと SDK 統合から始め、timer.js のロジックを単体テストから実装し、main.js で画面と結線してから E2E で確認する。
> 1タスクは1コミット。土台 → ロジック → 画面結線 → E2E テスト。
> 全 AC が E2E テストで通ることで完了。

- [x] T01: 静的マークアップと manifest.json を置く (setup)
- [x] T02: timer.js のロジック（開始条件・秒数カウント・状態遷移・終了判定）と timer.test.js で単体テスト (AC-01, AC-02, AC-04, AC-05, AC-06)
- [x] T03: main.js でイベントハンドラ・画面更新・disabled 設定・SDK notify 実装 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06)
- [x] T04: E2E テスト全 AC を書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06)
