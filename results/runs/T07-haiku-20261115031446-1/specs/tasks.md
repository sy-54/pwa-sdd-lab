# 単語帳 タスク

> 土台（マークアップ）→ cardManager（テスト・実装）→ studyManager（テスト・実装）→ UI結線と保存 → E2E
> 各タスク1時間以内、Red→Green を1サイクルで完結
> 最後に全 AC の E2E テストを実装して通す

- [x] T01: index.html と manifest.json を置く。一覧・学習・結果の3画面すべてのマークアップと全 data-testid を配置 (setup)
- [x] T02: cardManager.test.js で addCard()、deleteCard()、バリデーションの単体テストを書く (AC-01, AC-02, AC-03)
- [x] T03: cardManager.js を実装。addCard()、deleteCard()、バリデーション関数 (AC-01, AC-02, AC-03)
- [x] T04: studyManager.test.js で advanceStudy()「覚えた」「まだ」、getProgress() の単体テストを書く (AC-06, AC-07)
- [x] T05: studyManager.js を実装。advanceStudy()、getProgress()、学習キュー管理 (AC-06, AC-07)
- [x] T06: main.js を実装。初期表示、イベント登録、画面遷移。storage.get/set で cards を管理 (AC-04, AC-05, AC-08, AC-09, AC-10)
- [x] T07: 全 AC の E2E テストを tests/e2e/spec.spec.ts に実装。AC-01～AC-10 が通ること (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
