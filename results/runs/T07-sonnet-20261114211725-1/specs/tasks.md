# 単語帳 タスク

> 土台（3画面の静的マークアップと全 `data-testid`）→ `logic.js` を単体テストから作る → `main.js` で画面をつなぐ → 最後に全 AC の E2E。
> 1タスク＝1時間以内・1コミット。各ロジックタスクは Red→Green を同じタスクの中で回す。
> 全 AC（AC-01〜AC-10）がどれかのタスクに現れる。

- [x] T01: `apps/flashcards/manifest.json` と `index.html` に一覧／学習／結果の3画面と全 `data-testid` を配置する（学習・結果画面は `hidden`） (setup)
- [x] T02: `logic.js` に `normalizeCards` を実装（既定値・配列でない・要素不正は `[]`） (AC-01)
- [x] T03: `logic.js` に `addCard` を実装（前後空白除去、両方非空のときだけ最後尾に追加） (AC-02, AC-03)
- [x] T04: `logic.js` に `removeCard` を実装（指定位置を除いた新配列） (AC-04)
- [x] T05: `logic.js` に `canStartStudy` と `startStudy`／`currentCard` を実装（追加順で `queue` 生成、先頭を返す） (AC-05, AC-06)
- [x] T06: `logic.js` に `knowCurrent` を実装（`queue` から1枚除き `knownCount`／`onceKnownCount` を更新） (AC-07)
- [x] T07: `logic.js` に `againCurrent` を実装（最後尾へ回し `everAgain` を立てる） (AC-08)
- [x] T08: `main.js` で起動時に `storage.get('cards', [])`→`normalizeCards` で読み込み、一覧表示と `study-start` の disabled 制御を結線 (AC-01, AC-05, AC-10)
- [x] T09: `main.js` に追加フォームを結線（`addCard` 呼び出し→`storage.set`→入力欄クリア） (AC-02, AC-03)
- [x] T10: `main.js` に削除ボタンを結線（`removeCard`→`storage.set`→再描画） (AC-04)
- [x] T11: `main.js` に学習開始・`flip`・`study-progress` 表示を結線（一覧を隠し `study-view` を表示） (AC-05, AC-06)
- [x] T12: `main.js` に `know`／`again` を結線（`knowCurrent`／`againCurrent`→次カード表示、裏は非表示に戻す） (AC-07, AC-08)
- [x] T13: `main.js` にキュー空時の結果表示（`study-result`・`result-known`）と `study-finish` を結線（一覧に戻る） (AC-08, AC-09)
- [x] T14: 全 AC（AC-01〜AC-10）の E2E を `flashcards.spec.ts` に書いて通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10)
