# 読書記録 実装タスク

> マークアップ → ロジック層（単体テスト）→ UI 層（イベント・SDK 統合）→ E2E。
> 13個の AC をすべてカバー。各ロジック関数（addBook, updateBook, deleteBook, filterBooks）は Red→Green で TDD。
> 全タスクで 1 時間以内・1 コミットの粒度。

- [x] T01: index.html に基本マークアップ配置：一覧・フォーム・フィルタ・トーストと data-testid (setup)
- [x] T02: logic.js に addBook()、title 空文字チェック機能含む、単体テスト (AC-02, AC-03)
- [x] T03: logic.js に updateBook()、rating=0 で評価なし対応、単体テスト (AC-05, AC-06, AC-07, AC-12)
- [x] T04: logic.js に deleteBook()、指定 id 削除、単体テスト (AC-08)
- [x] T05: logic.js に filterBooks()、status による絞り込み、単体テスト (AC-09, AC-10)
- [x] T06: main.js 初期化＋イベント接続：新規追加ボタン・編集ボタン・フォーム表示非表示・フィルタ UI (AC-01, AC-04)
- [x] T07: main.js 保存ハンドラ：バリデーション（title 空チェック）→ logic 呼び出し → storage 保存 → toast/redirect (AC-02, AC-03, AC-05, AC-06, AC-07, AC-12, AC-11)
- [x] T08: main.js 削除ハンドラ：ui.confirm ダイアログ → deleteBook() → storage → リダイレクト (AC-08)
- [x] T09: main.js フィルタハンドラ：filterBooks() 呼び出し → 一覧再描画・件数更新 (AC-09, AC-10)
- [x] T10: main.js 撮影ハンドラ：camera.takePhoto() → Blob を storage:cover に保存 → UI 更新・表示 (AC-13)
- [x] T11: E2E テスト作成：全 AC のシナリオ実装・実行・通過確認 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13)
