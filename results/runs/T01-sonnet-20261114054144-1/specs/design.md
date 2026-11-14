# タイマー 設計

> 状態遷移と時間計算は `logic.js` の純粋関数に分け、DOM操作・タイマー駆動・通知呼び出しは `main.js` に閉じる。
> 状態は保存しない（D4）。`main.js` 内のメモリ変数 `state` だけが実行中の状態を持つ。
> `logic.js` は単体テストで全状態遷移を確認し、`main.js` の実時間経過・通知・DOM反映はE2Eで確認する。

## モジュール構成
- `apps/timer/manifest.json`：アプリ情報（`id: "timer"` など）
- `apps/timer/index.html`：DOM構造（`minutes`・`time`・`start`・`pause`・`reset`・`done`）
- `apps/timer/logic.js`：状態遷移と時間フォーマットの純粋関数（DOM・SDKに触れない）
- `apps/timer/main.js`：`logic.js` の呼び出し、DOM描画、`setInterval` での1秒ごとの `tick`、`notify.send` 呼び出し

### logic.js の関数
- `parseMinutes(raw)`：文字列を1〜99の整数に変換。範囲外・小数・空欄は `null`
- `formatTime(totalSeconds)`：秒数を `MM:SS` 文字列に変換
- `createInitialState(minutes = 3)`：`{ status: 'idle', minutes, remainingSeconds: minutes * 60 }` を返す
- `tryStart(state, raw)`：`status` が `running`/`done` なら変化なし。`paused` なら `raw` を無視して `status` を `running` に（再開）。`idle` なら `parseMinutes(raw)` が `null` なら変化なし、有効なら `minutes`・`remainingSeconds` を更新して `status` を `running` に
- `pause(state)`：`status` が `running` のときだけ `paused` にする。他は変化なし
- `reset(state)`：`status` に関わらず `minutes` は保持し `remainingSeconds` を `minutes * 60` に戻し `status` を `idle` に
- `tick(state)`：`status` が `running` でなければ変化なし。`running` なら `remainingSeconds` を1減らし、0以下になったら `status` を `done`・`remainingSeconds` を `0` にする

## データモデル
- 保存なし（D4）。`main.js` が持つ実行時の状態は `state = { status, minutes, remainingSeconds }` の1種類のみ
  - 例：`{ status: 'running', minutes: 3, remainingSeconds: 178 }`
- `status` は `'idle' | 'running' | 'paused' | 'done'` のいずれか。壊れた値を読む経路はない（保存しないため）
- `minutes` 入力欄の生文字列は `parseMinutes` を通してから `state.minutes` に入れる。不正値は `null` として扱い `state` に反映しない

## 使用するSDK API
- `mountApp({ title: 'タイマー' })`：起動時に1度呼び、ヘッダーを表示
- `notify.send('タイマー', '残り時間がなくなりました')`：`tick` の結果 `status` が `done` になった瞬間に1回呼ぶ（main.js）
- `storage`：使わない。状態を保存しない仕様のため（D4）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: `createInitialState` の初期値 | timer.spec.ts |
| AC-02 | logic.test.js: `tryStart`→`tick`×2で`remainingSeconds`が2減る | timer.spec.ts |
| AC-03 | logic.test.js: `tryStart`に不正な`raw`を渡すと`state`が不変 | timer.spec.ts |
| AC-04 | logic.test.js: `running`に`pause`を適用すると`paused`になり`tick`しても不変 | timer.spec.ts |
| AC-05 | logic.test.js: `paused`に`tryStart`を適用すると`running`に戻り`remainingSeconds`はそのまま | timer.spec.ts |
| AC-06 | logic.test.js: 任意の状態に`reset`で`idle`・`remainingSeconds`が`minutes*60`に戻る | timer.spec.ts |
| AC-07 | logic.test.js: `remainingSeconds`が0になるまで`tick`すると`status`が`done`・`remainingSeconds`が0 | timer.spec.ts（通知はテスト環境ではトーストで代替） |
| AC-08 | ― | timer.spec.ts（再読み込みで初期状態に戻ることを確認。保存しないため） |
