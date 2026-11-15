# 単語帳 タスク

> 土台（静的マークアップ）→ ロジック単体テスト（カード操作→学習セッション）→ 画面結線（一覧→学習）→ 全ACのE2E、の順に進める。
> 1タスク1時間以内・1コミット。各タスクでRed→Greenを回す。
> 全AC（AC-01〜AC-09）がどれかのタスクに現れ、最後にE2Eで全AC通過を確認する。

- [x] T01: `apps/flashcards/index.html`・`manifest.json`を作成し、一覧／学習／結果の3画面のdata-testidを全て配置（`hidden`で学習・結果を非表示）。`logic.js`・`main.js`は空で用意 (setup)
- [x] T02: `logic.js`に`normalizeCards`・`addCard`・`deleteCard`を実装し`logic.test.js`で単体テスト（空配列正規化、表裏空なら不追加、指定インデックス削除） (AC-02, AC-06, AC-08)
- [x] T03: `logic.js`に`addCard`の正常追加を確認する単体テストを追加 (AC-01)
- [x] T04: `logic.js`に`startSession`（0件で`null`）を実装し単体テスト (AC-07)
- [x] T05: `logic.js`に`flip`・`know`（未めくり時は無効）を実装し単体テスト (AC-09)
- [x] T06: `logic.js`に`know`での進捗・結果反映（`knownCount`／`current===null`時の`perfectCount`）を実装し単体テスト (AC-05)
- [x] T07: `logic.js`に`again`（`rest`末尾へ回し`missed`付与、次の`current`取得）を実装し単体テスト (AC-04)
- [x] T08: `logic.js`に`flip`後に表裏が取得できることを確認する単体テストを追加 (AC-03)
- [x] T09: `main.js`で`mountApp`・`storage.get('cards')`読込・一覧描画・`add-card`/`card-delete`配線、変更ごとに`storage.set` (AC-01, AC-02, AC-06, AC-08)
- [x] T10: `main.js`で`study-start`〜`flip`〜`know`/`again`〜`study-progress`〜`study-result`〜`study-finish`の画面結線（`hidden`切替） (AC-03, AC-04, AC-05, AC-07, AC-09)
- [x] T11: 全 AC の E2E を`tests/e2e/flashcards.spec.ts`に書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09)
