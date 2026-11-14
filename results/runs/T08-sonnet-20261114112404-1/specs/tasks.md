# 読書記録 タスク

> 土台（静的マークアップ）→ logic.js の単体テスト → 画面結線 → 保存・削除・撮影 → 最後にE2E、の順で進める。
> 1タスク1時間以内・1コミット。各タスク内でテストと実装のRed→Greenを回す。
> 全AC（AC-01〜AC-14）がいずれかのタスクに現れ、最終タスクのE2Eで全件通過すれば完了。

- [x] T01: `apps/books/manifest.json`・`index.html`・空の `main.js`／`logic.js` を作り、一覧とフォームの静的マークアップ（spec記載の全 `data-testid`）を置く (setup)
- [x] T02: `logic.js` に `normalizeBooks`・`isValidTitle` を単体テストから作る (AC-11, AC-14)
- [x] T03: `logic.js` に `addBook`・`applyEdit` を単体テストから作る (AC-01, AC-02, AC-03, AC-05, AC-06, AC-07)
- [x] T04: `logic.js` に `filterBooks` を単体テストから作る (AC-08)
- [x] T05: `main.js` で `storage.get('books')` を読み `normalizeBooks` を通し一覧を描画、`filter` 変更と `book-count` を結線する (AC-08)
- [x] T06: `main.js` で `book-new`／`book-edit` によるフォーム開閉と、`form-status` に応じた `form-rating`／`form-note` の `hidden` 切替を実装する (AC-04)
- [x] T07: `main.js` の `form-save` 処理（`isValidTitle` 判定と `ui.toast`、`addBook`／`applyEdit` を使った `storage.set`）を実装する (AC-01, AC-02, AC-03, AC-05, AC-06, AC-07, AC-11)
- [x] T08: `main.js` の `form-delete` を `ui.confirm` で結線し、OKのときだけ配列から除いて保存する (AC-09, AC-10)
- [x] T09: `main.js` で `camera.takePhoto` による表紙撮影・`book-cover` 表示を結線する (AC-13)
- [x] T10: 再読み込みでの永続化と壊れた保存データ時の空一覧表示を確認・調整する (AC-12, AC-14)
- [x] T11: 全AC（AC-01〜AC-14）のE2E（`tests/e2e/books.spec.ts`）を書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14)
