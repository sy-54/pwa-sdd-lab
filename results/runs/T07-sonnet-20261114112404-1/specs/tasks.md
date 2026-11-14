# 単語帳 タスク

> 土台（マークアップ一式）→ ロジック（単体テスト）→ 画面結線（一覧→学習→結果）→ E2E の順で進める。
> 1タスク1コミット、1時間以内。各タスクでRed→Greenを同じコミットに収める。
> 全タスク完了時に全ACがE2Eで通ることを完了条件とする。

- [x] T01: `apps/flashcards/manifest.json`・`index.html` を作り、一覧・学習・結果の全 data-testid（app-root, card-front-input, card-back-input, add-card, card-item, card-front, card-back, card-delete, study-start, study-view, study-front, study-back, flip, know, again, study-progress, study-result, result-known, study-finish）を静的マークアップとして配置、`main.js` は `mountApp` 呼び出しのみの空実装にする (setup)
- [x] T02: `apps/flashcards/logic.js` に `normalizeCards`・`addCard`・`removeCard` を実装し `tests/unit/flashcards.test.js` で検証（壊れた保存値→空配列、前後空白のみの入力は拒否、末尾追加、指定枚削除） (AC-02, AC-03, AC-10, AC-11)
- [x] T03: `logic.js` に `canStartStudy`・`startStudy`（登録順キュー生成）を実装し単体テストを書く (AC-01, AC-04)
- [x] T04: `logic.js` に `knowCard`・`againCard`（ラウンドロビン進行）・`formatProgress` を実装し、「まだ」後の再出題順と進み具合の単体テストを書く (AC-06, AC-07)
- [x] T05: `logic.js` に `firstTryOk` 集合管理と結果枚数算出（`know` 済み全枚時の集計）を実装し単体テストを書く (AC-08)
- [x] T06: `main.js` に一覧画面を結線：`storage.get('cards', [])` 読込・`add-card` クリックで `addCard` 呼び出し→`storage.set`→再描画、空欄時は `ui.toast` 表示、`card-delete` で `removeCard`→`storage.set`→再描画 (AC-02, AC-03, AC-10, AC-11)
- [x] T07: `main.js` に学習画面を結線：カード0枚で `study-start` を disabled、押下で `startStudy` を呼びメモリ上の状態を保持して `study-view` を表示、`flip` で `study-back` 表示切替 (AC-01, AC-04, AC-05)
- [x] T08: `main.js` に判定ボタンを結線：`know`/`again` で `knowCard`/`againCard` を呼び次カードを表示し `study-progress` を更新、全カード `know` 済みで `study-result` を表示し `result-known` を算出結果に更新 (AC-06, AC-07, AC-08)
- [x] T09: `main.js` に `study-finish` を結線し `study-result` を隠して一覧画面を再表示（カードデータは不変） (AC-09)
- [x] T10: 全 AC の E2E（`tests/e2e/flashcards.spec.ts`）を書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11)
