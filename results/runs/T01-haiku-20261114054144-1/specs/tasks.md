# タイマー タスク

> UI テンプレートから始まり、ロジック → 画面結線 → 通知 → E2E の順に実装。
> 1 タスク 1 時間・1 コミット。すべての AC が対応するタスクに現れる。
> 完了：lint 合格と E2E テスト全通過。

- [x] T01: index.html と manifest.json に UI 枠と data-testid を置く (setup)
- [x] T02: logic.js - 状態初期化と時間計算（remainingSeconds 更新） (AC-02, AC-08)
- [x] T03: logic.js - 一時停止・再開の状態遷移（isPaused フラグ） (AC-03, AC-04)
- [x] T04: logic.js - リセット処理（初期状態復帰） (AC-05)
- [x] T05: logic.js - 終了判定と isDone フラグ設定 (AC-06)
- [x] T06: main.js - イベントハンドラと画面表示の結線 (AC-01, AC-02, AC-03, AC-04, AC-05)
- [x] T07: main.js - ボタンの有効・無効切り替え (AC-01, AC-03, AC-04, AC-05)
- [x] T08: main.js - 通知送信処理（SDK notify.send）と done 要素表示 (AC-07)
- [x] T09: 全 AC の E2E テスト（AC-01～AC-09）と lint 合格 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09)
