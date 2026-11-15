# 買い物リスト タスク

> UI と ロジック層を分離し、テスト駆動で実装
> 単体テストでロジック検証、E2E で画面動作を確認
> 追加・更新・削除のたびに保存

- [x] T01: index.html に静的マークアップを配置（全 data-testid を含む） (setup)
- [x] T02: logic.js に addItem・removeItem・togglePurchased・getRemainingCount を実装、単体テストから Red-Green を回す (AC-01, AC-02, AC-03, AC-04, AC-06, AC-07, AC-08, AC-09, AC-10)
- [x] T03: main.js で初期化・DOM 結線・イベントハンドリングを実装（入力欄・追加ボタン・チェック・削除・保存） (AC-01, AC-02, AC-05, AC-06, AC-07, AC-08)
- [x] T04: 全 AC の E2E テストを shopping.spec.ts に書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11)
