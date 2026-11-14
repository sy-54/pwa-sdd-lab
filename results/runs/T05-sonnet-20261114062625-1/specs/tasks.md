# 支出メモ タスク

> 土台（画面骨格）→ ロジック（単体テスト）→ 画面結線（追加・削除・保存）→ E2E の順で進める。
> 1タスク1時間以内・1コミット。各タスクでテストと実装を一緒に仕上げる。
> T08 で全 AC の E2E が通れば完了。

- [x] T01: `apps/expense/index.html`・`manifest.json` を作り、UI契約の `data-testid` 全要素（`app-root`/`amount`/`category`/`add`/`total`/`expense-item` 雛形）を静的に配置する (setup)
- [x] T02: `logic.js` に `validateAmount`・`formatAmount` を実装し `logic.test.js` で正常値と不正値（0以下・小数・空欄・数字以外）を検証する (AC-01, AC-06)
- [x] T03: `logic.js` に `parseRecords`（保存データの形検証・壊れた値の除外）を実装し単体テストで配列以外・要素不正時に空配列になることを確認する (AC-07)
- [x] T04: `logic.js` に `calcMonthlyTotal`（現在年月の記録のみ合計）を実装し、月をまたぐ記録が除外されるケースを単体テストで確認する (AC-03, AC-08)
- [x] T05: `main.js` で起動時に `storage.get('records', [])` を `parseRecords` に通し、新しい順で一覧と `total` を描画する (AC-02, AC-07, AC-08)
- [x] T06: `main.js` に `add` の処理を実装。`validateAmount` で検証し、不正なら `ui.toast` で通知、正常なら先頭に記録を追加して `storage.set` し再描画する (AC-01, AC-06)
- [x] T07: `main.js` に `expense-delete` の処理を実装。`ui.confirm('この記録を削除しますか？')` で確認し、OK ならその記録を除いて保存・再描画、キャンセルなら何もしない (AC-04, AC-05)
- [x] T08: 全 AC（AC-01〜AC-08）の E2E を `expense.spec.ts` に書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08)
