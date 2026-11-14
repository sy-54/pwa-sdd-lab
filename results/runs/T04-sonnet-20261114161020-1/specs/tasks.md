# 習慣トラッカー タスク

> 土台（画面骨格）→ logic.js を単体テストで作る→ main.js で結線（保存・復元）→ 削除確認を追加 → 全ACのE2E。
> 1タスク1時間以内・1コミット。テスト作成と実装は同一タスク内でRed→Greenを回す。
> 全AC（AC-01〜AC-11）がどれかのタスクに現れることを完了条件とする。

- [x] T01: `apps/habit/manifest.json`・`index.html`（`app-root`/`new-habit`/`add-habit`の静的マークアップ）を作る (setup)
- [x] T02: `logic.js` に `canAddHabit`（空・重複判定）を実装し単体テストを書く (AC-01, AC-09, AC-10)
- [x] T03: `logic.js` に `calcStreak`（連続日数計算）を実装し単体テストを書く (AC-02, AC-03, AC-04, AC-05, AC-11)
- [x] T04: `logic.js` に `toggleDate`（チェック日付配列の更新）を実装し単体テストを書く (AC-02, AC-03)
- [x] T05: `logic.js` に `sanitizeHabits`（保存データの正規化）を実装し単体テストを書く (AC-08)
- [x] T06: `main.js` で `mountApp`・`storage.get('habits', [])` による起動時読込と一覧描画（`habit-item`/`habit-name`/`habit-check`/`habit-streak`/`habit-delete`）を実装する (AC-01, AC-02, AC-08)
- [x] T07: 追加ボタンの結線（`canAddHabit` 利用、入力欄クリア、`storage.set`）を実装する (AC-01, AC-09, AC-10)
- [x] T08: チェックボックスの結線（`toggleDate`・`calcStreak` 表示更新・`storage.set`）と未チェック時の目立つスタイルを実装する (AC-02, AC-03, AC-04, AC-05, AC-11)
- [x] T09: 削除ボタンの結線（`ui.confirm` 呼び出しとOK/キャンセル分岐・`storage.set`）を実装する (AC-06, AC-07)
- [x] T10: 全AC（AC-01〜AC-11）のE2Eを `tests/e2e/habit.spec.ts` に書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11)
