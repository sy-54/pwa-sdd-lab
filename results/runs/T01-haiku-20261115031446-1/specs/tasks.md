# タイマー タスク

> 土台→ロジック→画面結線→通知→E2E の順。12 AC 全て対応。
> 各タスクは 1 コミット、単体テストと実装を同じタスク内で回す。
> index.html、manifest.json から始め、logic.js で純粋関数、main.js で状態管理・DOM 更新。

- [x] T01: 土台を置く - index.html、manifest.json に全 data-testid 要素を配置 (setup)
- [x] T02: logic.js でタイマー計算ロジック実装 - remainingSeconds、isStartable、reset、pause、restart を単体テストから (AC-03, AC-04, AC-05, AC-06, AC-11, AC-12)
- [x] T03: main.js で画面結線 - 初期状態、イベントハンドラ、DOM 更新、requestAnimationFrame で秒更新 (AC-01, AC-02, AC-04, AC-05, AC-06, AC-07)
- [x] T04: done 表示と notify API 統合 - 終了時に done 表示、notify.send() を呼び出し (AC-08, AC-09, AC-10)
- [x] T05: 全 AC の E2E テスト実装・通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12)
