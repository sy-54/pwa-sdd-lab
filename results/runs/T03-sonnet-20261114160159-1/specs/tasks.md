# 写真メモ タスク

> 土台（マークアップ）→ logic.js の純粋関数（単体テスト）→ main.js の結線（撮影・編集・削除・エラー処理）→ 全ACのE2Eの順に進める。
> 1タスクは1時間以内・1コミット。各タスク内でテストと実装のRed→Greenを回す。
> 全タスク完了後、`npm test` と `npm run e2e` が通ればこの機能は完了。

- [x] T01: index.html と manifest.json を置き、app-root/shoot/memo-item/memo-img/memo-caption/memo-delete/memo-empty の静的マークアップを用意する (setup)
- [x] T02: logic.js に normalizeItems を実装しテストを書く（不正値は空配列に正規化） (AC-08, AC-09)
- [x] T03: logic.js に addItem を実装しテストを書く（先頭追加・新着順） (AC-01, AC-02)
- [x] T04: logic.js に setCaption を実装しテストを書く（空文字も許容） (AC-03, AC-04)
- [x] T05: logic.js に removeItem を実装しテストを書く（該当itemを除く） (AC-05)
- [x] T06: main.js で起動時に storage.get→normalizeItems→一覧描画を結線する (AC-08, AC-09)
- [x] T07: main.js で shoot ボタンを結線する（成功時addItem、キャンセル時無変化、画像以外はトースト） (AC-01, AC-02, AC-07, AC-10)
- [x] T08: main.js で memo-caption の change を結線する（setCaption→保存、保存失敗時は表示を戻す） (AC-03, AC-04)
- [x] T09: main.js で memo-delete を結線する（ui.confirmのOK/キャンセル、保存失敗時は表示を戻す） (AC-05, AC-06)
- [x] T10: 全ACのE2Eを書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
