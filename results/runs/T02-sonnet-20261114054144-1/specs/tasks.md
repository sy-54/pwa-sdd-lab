# ToDo タスク

> 土台（静的マークアップ）→ ロジック単体テスト → 画面結線 → 保存失敗時のエラー処理 → 全ACのE2E、の順で進める。
> 1タスク1時間以内・1コミット。各タスク内でテストと実装のRed→Greenを回す。
> `apps/todo/` 配下のみ変更し、`npm test` と `npm run e2e` が全て通れば完了。

- [x] T01: `apps/todo/index.html` と `manifest.json` を作成し、`app-root`/`new-todo`/`add`/`todo-item`/`todo-text`/`todo-toggle`/`todo-delete`/`todo-count` の `data-testid` を静的マークアップで全て配置する (setup)
- [x] T02: `apps/todo/logic.js` に `addTodo`（末尾追加・前後空白除去・空白のみは変化なし）を実装し `tests/unit/logic.test.js` で確認する (AC-01, AC-02)
- [x] T03: `logic.js` に `toggleTodo`（対象の `done` のみ反転）と `removeTodo`（対象を除いた配列を返す）を実装し単体テストを書く (AC-03, AC-04)
- [x] T04: `logic.js` に `sanitizeTodos`（配列以外や形不正な要素を除去・空配列化）と `countRemaining`（未完了数）を実装し単体テストを書く (AC-05, AC-06)
- [x] T05: `apps/todo/main.js` で `storage.get('todos', [])` → `sanitizeTodos` → 描画し、`add`/`todo-toggle`/`todo-delete` のイベントで `logic.js` の関数を呼び `storage.set` して再描画する (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06)
- [x] T06: `main.js` で `storage.set` 失敗時に画面を変更前のまま保ち `ui.toast` でエラーを通知する処理を追加する (setup)
- [x] T07: `tests/e2e/todo.spec.ts` に AC-01〜AC-06 のシナリオを書き、`npm run e2e` を通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06)
