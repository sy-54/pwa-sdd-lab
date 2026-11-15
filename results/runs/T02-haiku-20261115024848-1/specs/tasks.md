# ToDo タスク

> 静的マークアップと SDK で基本を作り、ロジック・描画・保存の順に実装。
> 各操作の挙動を単体テストで確認してから UI に結線。
> 最後に全 AC を E2E で検証。

- [x] T01: index.html に UI 契約要素を配置（app-root, new-todo, add, todo-item, todo-text, todo-toggle, todo-delete, todo-count） (setup)
- [x] T02: logic.js 実装と logic.test.js - addTodo で末尾に追加、空白は除外 (AC-01, AC-02, AC-03)
- [x] T03: logic.test.js - removeTodo で削除後にカウント再計算 (AC-06)
- [x] T04: logic.test.js - toggleTodo で完了状態切り替え、countIncomplete 計算確認 (AC-04)
- [x] T05: main.js - 初期化で storage.get で items 復元、render で画面更新 (AC-07)
- [x] T06: main.js - 追加ボタン・Enter キーのイベント処理、入力欄クリア (AC-01, AC-02, AC-03, AC-08)
- [x] T07: main.js - チェックボックス・削除ボタンのイベント処理 (AC-04, AC-06)
- [x] T08: main.js - 各操作後に storage.set で保存、render で todo-count 更新 (AC-04, AC-06, AC-07)
- [x] T09: CSS で完了済みのテキストに打ち消し線（class 付与で制御） (AC-05)
- [x] T10: add.spec.ts - AC-01, AC-02, AC-03, AC-08 の E2E (AC-01, AC-02, AC-03, AC-08)
- [x] T11: count.spec.ts - AC-04 の E2E、チェック後にカウント確認 (AC-04)
- [x] T12: display.spec.ts - AC-05 の E2E、打ち消し線確認 (AC-05)
- [x] T13: delete.spec.ts - AC-06 の E2E、削除と count 更新 (AC-06)
- [x] T14: persistence.spec.ts - AC-07 の E2E、再読み込み後の復元確認 (AC-07)
