# 買い物リスト タスク

> 土台（マークアップ）→ ロジック（単体テスト）→ 画面結線 → 保存・エラー処理 → E2E の順に進める。
> 1タスク1時間以内・1コミット。テストと実装は同じタスクでRed→Greenを回す。
> 全AC（AC-01〜09）がE2Eで通ることを最終確認する。

- [x] T01: `apps/shopping/manifest.json` と `index.html` に `app-root`・入力欄・追加ボタン・一覧の雛形・残り件数の静的マークアップを置く (setup)
- [x] T02: `logic.js` に `sanitizeItems`／`validateQty` を実装し単体テストで確認する (AC-02, AC-04, AC-09)
- [x] T03: `logic.js` に `createItem` を実装し単体テストで確認する (AC-01, AC-03, AC-07)
- [x] T04: `logic.js` に `toggleItem`／`deleteItem`／`countRemaining` を実装し単体テストで確認する (AC-05, AC-06)
- [x] T05: `main.js` で `mountApp`・`storage.get('items', [])` 読込・`sanitizeItems` 適用・一覧描画・`remaining-count` 表示を結線する (AC-09)
- [x] T06: `main.js` に追加処理（Enterキー含む）を結線し、成功時は `storage.set` して描画、不正時は `ui.toast` を呼ぶ (AC-01, AC-02, AC-03, AC-04, AC-07)
- [x] T07: `main.js` にチェック切替・削除の結線と `storage.set` を追加する (AC-05, AC-06, AC-08)
- [x] T08: 全AC（AC-01〜09）のE2Eを `tests/e2e/shopping.spec.ts` に書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09)
