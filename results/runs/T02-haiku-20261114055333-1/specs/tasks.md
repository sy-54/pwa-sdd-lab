# ToDo タスク

> 土台（UI 契約全体）→ ロジック（単体テスト Red→Green）→ 画面結線（イベントと DOM 更新）→ 保存処理 → E2E で全 AC 通す
> 1 タスクは 1 時間以内、1 コミット。テストと実装は同じタスクで回す
> 各タスク完了時に該当 AC が動作し、最終 T07 で全 AC の E2E 通過

- [x] T01: 静的マークアップ `apps/todo/index.html` と `manifest.json` に全 `data-testid` を配置（新規入力欄、追加ボタン、リスト領域、アイテムテンプレート、残り件数） (setup)
- [x] T02: `apps/todo/logic.js` で `addItem()`, `deleteItem()`, `toggleCompleted()` の純粋関数を実装し、`tests/unit/logic.test.js` でテスト (AC-01, AC-02, AC-03, AC-04, AC-07)
- [x] T03: `apps/todo/logic.js` に `countRemaining()` 関数を追加し、テスト (AC-05)
- [x] T04: `apps/todo/main.js` で SDK の `storage.get('items', [])` から初期化、壊れた保存データはリセット (AC-06)
- [x] T05: `main.js` で入力欄と追加ボタンのイベントリスナー実装、リストと残り件数を DOM に反映 (AC-01, AC-02, AC-03, AC-04, AC-08)
- [x] T06: 各操作（追加・削除・完了切り替え）後に `storage.set('items', ...)` で保存 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
- [x] T07: `tests/e2e/todo.spec.ts` に全 AC のテストを実装し、全て通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
