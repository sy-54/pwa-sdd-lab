# タイマー 実装設計

> 時間計算と状態遷移を純粋関数で実装。
> 画面操作・通知・イベントは DOM・SDK を呼ぶ main.js に集約。
> 時間表示は毎秒更新。

## モジュール構成

| ファイル | 責務 |
|---|---|
| `logic.js` | 経過時間から残り時間計算、状態遷移ロジック（純粋関数） |
| `main.js` | DOM操作、イベントハンドラ、SDK呼び出し（ui.toast は SDK の自動トースト）、notify.send 実行 |
| `index.html` | UI テンプレート |
| `manifest.json` | アプリメタデータ |

## データモデル

保存なし（D5 に従い、再読み込みで初期状態に戻す）。

アプリ状態（メモリ内）：
```js
{
  remainingSeconds: 180,  // 残り秒数
  isRunning: false,       // カウントダウン中か
  isPaused: false,        // 一時停止中か
  isDone: false           // 終了か
}
```

## 使用するSDK API

| 関数 | 用途 |
|---|---|
| `notify.send(title, body)` | 時間到達時に通知送信（AC-07）。失敗時は SDK が自動トースト |

SDK の ui.toast・storage は未使用（保存なし、トースト代替なし）。

## ACとテストの対応

| AC | 単体テスト | E2E |
|---|---|---|
| AC-01: 初期表示 | ― | ✓ 初期状態確認 |
| AC-02: 開始から経過表示 | ✓ remainingSeconds 計算 | ✓ 2秒経過で 02:58 |
| AC-03: 一時停止と再開 | ✓ isPaused 状態遷移 | ✓ pause 押下で停止確認 |
| AC-04: 再開 | ✓ 一時停止→実行状態 | ✓ start 押下で再開確認 |
| AC-05: リセット | ✓ 初期状態復帰 | ✓ reset 押下で03:00に戻る |
| AC-06: 0秒到達の終了表示 | ✓ isDone フラグ設定 | ✓ done 要素表示確認 |
| AC-07: 通知送信 | ― | ✓ notify.send 呼び出し確認、トースト表示 |
| AC-08: 0分での開始禁止 | ✓ 入力値チェック | ✓ 開始されないことを確認 |
| AC-09: 終了後のリセット | ✓ isDone 状態のリセット | ✓ reset で初期状態に戻る |

**テスト環境での確認方法**：
- 通知（AC-07）：E2E テストで SDK の自動トースト表示を確認
- 時間経過：E2E で `page.clock.tick()` 使用
- ボタン有効・無効：DOM の `disabled` 属性で確認
- DOM 表示：`data-testid` で要素の `hidden` 属性確認
