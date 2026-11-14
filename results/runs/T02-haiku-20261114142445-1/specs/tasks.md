# ToDo タスク

> HTML マークアップと data-testid をすべて配置する。
> logic.js を単体テストから実装し、main.js で UI と結線する。
> ストレージ操作とエラー処理を実装後、E2E テスト全通過を確認する。

- [x] T01: `apps/todo/index.html`、`manifest.json`、基本 CSS を置く。data-testid をすべて配置 (setup)
- [x] T02: `logic.js` の `addItem`、`toggleComplete`、`deleteItem`、`resetItems` を実装。logic.test.js で単体テスト (AC-01, AC-04, AC-05, AC-06, AC-07, AC-08, AC-10)
- [x] T03: `main.js` で初期化と `storage.get('items', [])` を実装。起動時にアイテム一覧を読み込んで表示 (AC-09)
- [x] T04: `main.js` でイベントリスナー実装。追加ボタン、Enter キー、チェックボックス、削除ボタン、及び `todo-count` 更新 (AC-01, AC-02, AC-03, AC-05, AC-06, AC-07)
- [x] T05: `main.js` で `storage.set()` 呼び出しとエラーハンドリング。`ui.toast()` で通知 (AC-09)
- [x] T06: 全 AC の E2E テストを書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
