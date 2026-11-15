# ToDo タスク

> 土台（静的マークアップ）→ logic.js を単体テストから作る → main.js で結線 → 保存・復元 → 最後に全ACのE2E。
> 1タスクは1時間以内・1コミット。各タスクでRed→Greenを回す。
> 全AC（AC-01〜AC-06）がどこかのタスクに現れることを完了の条件とする。

- [x] T01: `apps/todo/manifest.json` と `apps/todo/index.html` に app-root・new-todo・add・todo-item（todo-text/todo-toggle/todo-delete）・todo-count の静的マークアップを置く (setup)
- [x] T02: `apps/todo/logic.js` に `normalizeItems` を実装し `tests/unit/logic.test.js` で壊れた値→空配列、正しい形→そのまま復元を確認する (AC-06)
- [x] T03: `logic.js` に `addItem` を実装し、空白のみ入力で変化なし／有効な文字列は末尾に追加・整形されることを単体テストで確認する (AC-01, AC-02)
- [x] T04: `logic.js` に `toggleItem` を実装し、対象の `done` のみ反転し順序が変わらないことを単体テストで確認する (AC-03)
- [x] T05: `logic.js` に `removeItem` と `countRemaining` を実装し、対象除外・未完了件数の計算を単体テストで確認する (AC-04, AC-05)
- [x] T06: `apps/todo/main.js` で `mountApp`・`storage.get('items', [])` → `normalizeItems` の初期読み込みと一覧の再描画を実装する (AC-06)
- [x] T07: `main.js` で追加（ボタン／Enter）・切替・削除のDOMイベントを `logic.js` に結線し、操作ごとに `storage.set` で保存し直す (AC-01, AC-02, AC-03, AC-04, AC-05)
- [x] T08: `tests/e2e/todo.spec.ts` に全AC（AC-01〜AC-06）のE2Eを書き、再読み込みでの復元まで通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06)
