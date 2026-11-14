# タイマー タスク

> ロジックを先に単体テスト、UI は後から結線する。
> 最後に通知と E2E で全 AC を確認。
> 各タスクは 1 時間以内、1 コミットの単位。

- [x] T01: manifest.json、index.html、main.js スケルトン、logic.js 準備 (setup)
- [x] T02: logic.js の秒↔MM:SS 変換、初期値、リセット計算を単体テスト (AC-01, AC-02, AC-07)
- [x] T03: main.js の UI 初期化、minutes 入力で time 表示更新、disabled 管理 (AC-01, AC-02, AC-04, AC-08)
- [x] T04: タイマー実行ロジック、開始・一時停止・再開ボタン処理 (AC-03, AC-05, AC-06)
- [x] T05: リセット後の分値保持、done 表示・消滅管理 (AC-07, AC-08, AC-09, AC-11)
- [x] T06: タイムアップで notify.send() 通知実装 (AC-10)
- [x] T07: 全 AC の E2E テスト (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12)
