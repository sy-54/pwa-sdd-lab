# 読書記録 タスク

> 静的マークアップから始め、ロジック層（単体テスト）→UI層の順で実装。
> 最後にE2Eテストで全ACを検証。
> 各タスク1時間以内、1コミット単位。

- [x] T01: 静的マークアップ配置：index.html にすべての要素と data-testid を配置 (setup)
- [x] T02: logic.js 実装（単体テスト付き）：add/update/delete/filter、validation 確認 (AC-01, AC-02, AC-06, AC-07, AC-08)
- [x] T03: main.js 実装：一覧表示、フォーム表示/非表示、イベント結線 (AC-01, AC-02, AC-09, AC-13, AC-14)
- [x] T04: 評価・感想の条件表示：status に応じて form-rating / form-note を表示/非表示 (AC-03, AC-11, AC-12)
- [x] T05: 削除確認ダイアログ：ui.confirm で確認後に削除実行 (AC-05, AC-06)
- [x] T06: カメラ統合：camera.takePhoto で撮影、表紙写真を表示 (AC-04)
- [x] T07: ストレージ保存：books と写真を storage に保存、起動時に復元 (AC-10)
- [x] T08: 全E2Eテスト：books.spec.ts で全AC通過確認 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14)
