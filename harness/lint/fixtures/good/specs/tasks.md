# カウンタ タスク

> ロジック→画面→保存の順に TDD で進める。
> 各タスクは1時間以内、1タスク1コミット。
> 最後に全 AC の E2E を通す。

- [x] T01: index.html に testid 付きの静的マークアップを置く (setup)
- [x] T02: counter.js の inc / dec（0 で止まる）を単体テストから作る (AC-01, AC-02)
- [x] T03: main.js でボタンと表示をつなぐ。0 のとき dec を disabled (AC-01, AC-02, AC-03)
- [ ] T04: parse と保存・復元を単体テストから作る (AC-04)
- [ ] T05: 全 AC の E2E を書いて通す (AC-01, AC-02, AC-03, AC-04)
