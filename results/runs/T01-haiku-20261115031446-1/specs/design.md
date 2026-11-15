# タイマー 設計

> ロジック（カウント計算）と画面（DOM・イベント）の責務分離。メモリ状態で管理し、保存不要。
> 秒単位の更新を requestAnimationFrame で実装。終了時は notify.send() で通知。
> 12 AC 全て対応。

## モジュール構成
- `index.html`：UI 要素（入力、ボタン、表示）の定義
- `main.js`：DOM・イベント処理、状態管理、秒更新の制御
- `logic.js`：タイマー計算を純粋関数に分離（残り時間計算、ボタン有効・無効判定）
- `manifest.json`：アプリメタデータ

## データモデル
メモリ内に状態を保持（保存不要）。

```js
{
  settingMinutes: 3,           // ユーザーが入力した分数（例 3）
  remainingSeconds: 180,       // 残り時間（秒）。カウント中に減少
  state: 'stopped',            // 'stopped'|'running'|'paused'|'done'
  lastUpdateTime: 1700000000,  // 秒更新時の時刻（Date.now()）
}
```

壊れた値の扱い：保存がないため不要。メモリリセット時は全初期化。

## 使用するSDK API
- `notify.send(タイトル, 本文)`：時間になったときの通知（AC-08）

## ACとテストの対応

| AC | 単体テスト | E2E |
|---|---|---|
| AC-01 初期状態 | ― | 初期表示確認 |
| AC-02 分を入力して開始 | ― | 入力→開始→表示確認 |
| AC-03 カウントダウン進行 | `logic.js: remainingSeconds 減少` | 秒経過確認 |
| AC-04 一時停止 | `logic.js: pause 時に状態変更` | pause ボタン挙動 |
| AC-05 再開 | `logic.js: restart 時に続きから` | pause 後の start |
| AC-06 リセット | `logic.js: reset 時に初期分数に戻る` | reset ボタン挙動 |
| AC-07 リセット後、分の入力が有効 | ― | reset 後、入力フィールド有効確認 |
| AC-08 終了時に done 表示 | ― | 0秒到達時の done 表示・notify 呼び出し |
| AC-09 done は消えない | ― | 時間経過後も done が表示されたまま |
| AC-10 done はリセットで消える | ― | reset 後に done 消滅 |
| AC-11 分が空のときは start 無効 | `logic.js: isStartable(minutes) = false` | 無効状態確認 |
| AC-12 分が 0 のときは start 無効 | `logic.js: isStartable(minutes) = false` | 無効状態確認 |

## 実装の方針
- requestAnimationFrame で秒単位に丸めた時刻更新ループを実装（AC-03 対応）
- ボタン有効・無効制御は、状態と分の値に基づいて DOM 属性 `disabled` を切り替え（AC-11, AC-12）
- 通知は `notify.send()` で、アプリ表示中の通知を呼び出す（AC-08、SDK 仕様に従う）
