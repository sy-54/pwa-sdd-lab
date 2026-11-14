# 習慣トラッカー 設計

> ロジック（`apps/habit/logic.js`）と画面（`apps/habit/main.js`）を分離する。チェック済みかどうかは `lastDate` から都度算出し、別のフラグとして保存しない。
> 保存キーは `habits` 1つに習慣配列をまとめ、チェック操作の直前値を各要素に持たせてチェック解除時の取り消しに使う。
> 単体テストは日付計算・ストリーク計算・追加条件を確認し、E2Eは画面操作と保存からの復元を確認する。

## モジュール構成
- `apps/habit/manifest.json`：アプリの識別情報（id・name・icon・description）
- `apps/habit/logic.js`：日付計算・ストリーク計算・追加/削除/チェックの純粋関数。DOM に触れない
- `apps/habit/main.js`：DOM 構築・イベント処理・`storage`/`ui.confirm` の呼び出し。判定は `logic.js` に委譲する

## データモデル
- キー `habits`：`Habit[]`。例：`[{ name: "読書", streak: 3, lastDate: "2026-11-13", prevStreak: 2, prevLastDate: "2026-11-12" }]`
- `lastDate`：最後にチェックした日（`YYYY-MM-DD`、ローカル日付の文字列）。未チェックなら `null`
- `prevStreak` / `prevLastDate`：直前のチェック操作をする前の値。チェックを外したときにこの値へ戻す（1回分の取り消し）
- 画面上の「今日チェック済みか」は保存せず、`lastDate === 今日の日付文字列` で都度算出する。日付をまたいでも矛盾しない
- 保存データが配列でない場合：空配列として起動する。要素単位の形式チェックは行わない

## 使用するSDK API
- `mountApp`：起動時のヘッダー表示
- `storage.get` / `storage.set`：`habits` の読み書き
- `ui.confirm`：削除前の確認
- `ui.toast`・`notify.*`・`camera.*`：使わない（通知・カメラ・トーストは本アプリに不要）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `addHabit` で末尾に追加され初期値が streak=0 | habit.spec.ts |
| AC-02 | logic.test.js: 空白のみの名前は `canAddHabit` が false | habit.spec.ts |
| AC-03 | logic.test.js: 既存名と同じ名前は `canAddHabit` が false | habit.spec.ts |
| AC-04 | logic.test.js: 前日が lastDate のとき `checkHabit` で streak+1 | habit.spec.ts |
| AC-05 | logic.test.js: 2日以上前が lastDate のとき `checkHabit` で streak=1 | habit.spec.ts |
| AC-06 | logic.test.js: `checkHabit` 後に `uncheckHabit` で streak/lastDate が元の値に戻る | habit.spec.ts |
| AC-07 | logic.test.js: 今日でない lastDate では `isChecked` が false かつ streak は不変 | habit.spec.ts |
| AC-08 | ― | habit.spec.ts |
| AC-09 | ― | habit.spec.ts |
| AC-10 | ― | habit.spec.ts |
| AC-11 | logic.test.js: 今日の lastDate では `isChecked` が true | habit.spec.ts |
