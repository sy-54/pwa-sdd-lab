# カウンタ タスク

> HTML マークアップ → ロジック（単体テスト） → ストレージ（単体テスト） → 画面結線 → E2E テスト
> 各タスクは 1 コミット。ロジックは Red→Green を回す。
> すべての AC が単体テスト（AC-01〜05, 07）または E2E テスト（AC-06）で検証される。

- [x] T01: apps/counter/index.html に基本マークアップと CSS を配置（count 表示、3 つのボタン）(setup)
- [x] T02: counter.js で初期値・増加・減少・ 0 以下の防止ロジックを単体テストから実装（tests/unit/counter.test.js） (AC-01, AC-02, AC-03, AC-04)
- [x] T03: counter.js にリセット機能を追加し単体テストを追加（tests/unit/counter.test.js） (AC-05)
- [x] T04: storage.js で保存・読み込み・不正値初期化を実装し単体テストから確認（tests/unit/storage.test.js） (AC-07)
- [x] T05: index.html で counter.js と storage.js を結線し、初期化・ボタン・表示更新を実装 (setup)
- [x] T06: E2E テストで全 AC を書いて通す（tests/e2e/counter.spec.ts） (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07)
