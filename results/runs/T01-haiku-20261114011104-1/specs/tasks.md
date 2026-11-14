# タイマー タスク

> 土台のHTMLから始めて、ロジック層（単体テスト）→UI層の順に進める。
> 各タスクは1コミット・1時間以内の粒度。
> 全ACをカバーして最後にE2Eで検証。

- [x] T01: HTML マークアップを作成（apps/timer/index.html に分フィールド、時間表示、ボタン、done表示を配置） (setup)
- [x] T02: logic.js でバリデーション・状態計算ロジックを単体テストから実装（initTimer, validateMinutes, countDown, pause, resume, reset） (AC-01, AC-03, AC-04, AC-05, AC-07)
- [x] T03: main.js で UI 結線とカウントダウンループを実装（イベントハンドラ登録、setInterval制御、画面更新） (AC-02, AC-06)
- [x] T04: storage への保存・読み込みを実装（timer状態をstorage.get/setで永続化） (AC-03, AC-04, AC-05)
- [x] T05: 全 AC の E2E を書いて通す（tests/e2e/timer.spec.ts で7つのACを検証） (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07)
