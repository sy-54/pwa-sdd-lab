# 読書記録 タスク

> 土台（静的マークアップ）→ logic.js（単体テスト）→ main.js の結線（表示→フォーム→保存→削除/撮影）→ E2E の順に進める。
> 1タスク1コミット。Red→Green は同じタスク内で回す。
> 全タスク完了時に全ACのE2Eが通ることを完了の条件とする。

- [x] T01: apps/books/index.html・manifest.json を作成し、一覧とフォームの全data-testidを静的に配置する (setup)
- [x] T02: logic.js に normalizeBooks・validateTitle・filterBooks・ratingStars を実装し単体テストを書く (AC-05, AC-06)
- [x] T03: logic.js に addBook・updateBook・removeBook を実装し単体テストを書く (AC-01, AC-02, AC-04, AC-07)
- [x] T04: main.js で起動時読み込み・一覧表示・filter・book-countを結線する (AC-01, AC-02, AC-06)
- [x] T05: main.js でbook-new/book-editのフォーム開閉とform-status変更時のhidden制御を結線する (AC-03)
- [x] T06: main.js でform-saveの保存処理（タイトル空欄のトースト、評価感想の保存/削除、storage.set）を結線する (AC-04, AC-05, AC-08)
- [x] T07: main.js でform-deleteのui.confirm確認とform-coverのcamera.takePhoto（例外時トースト）を結線する (AC-07)
- [x] T08: 全ACのE2Eを書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
