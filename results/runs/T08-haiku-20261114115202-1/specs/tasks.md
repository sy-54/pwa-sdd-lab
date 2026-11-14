# 読書記録 タスク

> 静的マークアップ → ロジック → UI・ストレージ結線 → 機能統合 → E2E
> 各タスク 1 時間以内、1 コミット。ロジックは単体テストから作る
> 全 AC が E2E で通ること

- [x] T01: index.html に全 UI 要素を data-testid 付きで配置 (setup)
- [x] T02: books.js で本の CRUD・フィルタ・評価ルールを実装。単体テストから (AC-02, AC-03, AC-04, AC-06, AC-07, AC-08, AC-09, AC-10)
- [x] T03: main.js で起動時ストレージ読み込み、フォーム表示・イベント結線、保存 (AC-01, AC-02, AC-03, AC-04, AC-06, AC-12)
- [x] T04: form-cover ボタンで camera.takePhoto、Blob を cover に保存 (AC-11)
- [x] T05: form-delete ボタンで ui.confirm を呼び出し、削除実行 (AC-05, AC-06)
- [x] T06: エラー処理：起動時の不正データ対応、保存・カメラ失敗時のトースト (setup)
- [x] T07: 全 AC の E2E を書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12)
