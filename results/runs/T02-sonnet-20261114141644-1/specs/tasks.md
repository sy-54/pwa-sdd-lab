# ToDo タスク

> 土台（マークアップ）→ logic.js を単体テストで作る → main.js で結線 → 保存・復元 → 全ACのE2E、の順で進める。
> 1タスク1コミット、1時間以内。各タスクでRed→Greenを回す。
> T05まで完了し、全単体テストとE2Eが通れば完了。

- [x] T01: `apps/todo/manifest.json` と `index.html` に `app-root`/`new-todo`/`add`/`todo-count` の静的マークアップを置き、`main.js` を空で読み込む (setup)
- [x] T02: `apps/todo/logic.js` に `normalizeItems`／`addItem`／`toggleItem`／`deleteItem`／`countRemaining` を実装し、`tests/unit/logic.test.js` で確認する (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-09)
- [x] T03: `apps/todo/main.js` で `mountApp`・`storage.get` による初期描画と一覧の再描画（`todo-item`/`todo-text`/`todo-toggle`/`todo-delete`）・入力欄とEnter・追加ボタンの結線を行う (AC-01, AC-02, AC-03, AC-08)
- [x] T04: `main.js` の toggle・delete 操作で `storage.set('items', items)` を呼び、状態変更ごとに `todo-count` を再計算して表示する (AC-04, AC-05, AC-06, AC-07)
- [x] T05: `tests/e2e/todo.spec.ts` に全ACのシナリオ（追加・Enter・空入力・切替・削除・件数・再読み込み・取り消し線・壊れた保存データ）を書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09)
