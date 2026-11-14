# 写真メモ タスク

> 土台（マークアップ）→ ロジック（単体テスト）→ 画面結線（撮影・編集・削除・復元）→ 全ACのE2E、の順に進める。
> 1タスク1コミット、1時間以内。各タスク内でRed→Greenを回す。
> 全AC（AC-01〜AC-08）が何らかのタスクに現れ、最後のE2Eタスクで全て通ることが完了条件。

- [x] T01: `apps/photo-memo/manifest.json` と `index.html` に `app-root`/`shoot`/`memo-empty`/一覧コンテナの骨組みを置く (setup)
- [x] T02: `logic.js` に `sanitizeItems`/`addItem` を実装し `tests/unit/logic.test.js` で検証する (AC-01, AC-02, AC-06, AC-07)
- [x] T03: `logic.js` に `updateCaption`/`removeItem` を実装し単体テストで検証する (AC-03, AC-04, AC-05)
- [x] T04: `main.js` で起動時読み込み・一覧描画・`memo-empty` 切替を実装する (AC-06, AC-07)
- [x] T05: `main.js` で撮影ボタンの `camera.takePhoto()` 連携と保存を実装する (AC-01, AC-02, AC-08)
- [x] T06: `main.js` で `memo-caption` 入力と `memo-delete`（`ui.confirm` 連携）を実装する (AC-03, AC-04, AC-05)
- [x] T07: `tests/e2e/photo-memo.spec.ts` に全AC（AC-01〜AC-08）のE2Eを書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
