# タイマー 設計

> 検証・整形は DOM に触れない純粋関数（`logic.js`）に分離し、画面制御（`main.js`）から呼ぶ。
> 状態は `main.js` 内のメモリ変数（残り秒数・フェーズ）のみで持ち、保存はしない。
> ロジックは単体テスト、カウントダウン・表示更新・ボタンの有効/無効は E2E で確認する。

## モジュール構成
- `apps/timer/index.html`：画面の骨組み（`app-root` と各 `data-testid` 要素）
- `apps/timer/manifest.json`：アプリ定義（id・name・icon・description）
- `apps/timer/logic.js`：`minutes` の検証、秒⇄`MM:SS`変換などの純粋関数
- `apps/timer/main.js`：DOM取得、イベント登録、`setInterval`によるカウントダウン、表示・有効無効の更新

## データモデル
- 永続保存はしない（D5）。`main.js` が保持するメモリ上の状態のみ：
  - `remainingSeconds`：number。残り秒数（`0`以上の整数）
  - `phase`：`'idle' | 'running' | 'paused' | 'done'`。表示・ボタン有効無効を決める
- `minutes` 入力値は DOM の `value`（文字列）をその都度 `logic.parseMinutes` で検証する。保存された値がないため「壊れた値」は発生しない

## 使用するSDK API
- `mountApp({ title })`：起動時にヘッダーを表示するため呼ぶ
- 他は不使用：状態を保存しない（D5）ため `storage` は使わない。終了通知は `done` 表示のみで満たすため `notify` は使わない。`camera`・`ui.confirm`/`ui.toast` もこのアプリの操作に不要

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `parseMinutes`が`"3"`→`3`、`minutesToSeconds(3)`→`180`、`formatTime(180)`→`"03:00"` | timer.spec.ts |
| AC-02 | logic.test.js: `formatTime(59)`→`"00:59"` | timer.spec.ts |
| AC-03 | ― | timer.spec.ts |
| AC-04 | ― | timer.spec.ts |
| AC-05 | logic.test.js: `minutesToSeconds(2)`→`120`、`formatTime(120)`→`"02:00"` | timer.spec.ts |
| AC-06 | logic.test.js: `formatTime(0)`→`"00:00"` | timer.spec.ts |
| AC-07 | logic.test.js: `parseMinutes("")`→`null`、`parseMinutes("0")`→`null`、`parseMinutes("1.5")`→`null`、`parseMinutes("-1")`→`null` | timer.spec.ts |
