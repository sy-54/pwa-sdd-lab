# タイマー 要求仕様

> 分を指定して測るカウントダウンタイマー。
> 開始・一時停止・リセットができ、時間になったら知らせる。
> 料理中に片手で使う。

目的：カップ麺や煮込みの時間を、画面を見続けなくても測れるようにする。
利用者：本人（個人利用）。

## Must
- 分を指定してカウントダウンできる
- 開始、一時停止、再開、リセットができる
- 時間になったら知らせる

## Should
- 残り時間が大きく見える

## Won't
- 複数のタイマー、ラップ、アラーム音の選択

## 制約
- platform の SDK を使う（`sdk/README.md`）。静的ファイルのみ

## UI契約
- エントリ：`apps/timer/index.html`（`apps/timer/manifest.json` も置く）
- ルート要素：`data-testid="app-root"`
- 分の入力：`data-testid="minutes"`（`input type="number"`）
- 残り時間：`data-testid="time"`（テキストは `MM:SS` 形式のみ。例 `03:00`）
- ボタン：`data-testid="start"`（開始・再開）、`"pause"`、`"reset"`
- 終了の表示：`data-testid="done"`（時間になったときだけ表示される）

## 改訂履歴

### 変わった点
- 「時間になったら知らせる」の実装方法を、SDK の `notify.send()` に明記した（spec で D6 相当の決定事項として記録）

### 分かった点
- `input type="number"` の最小値・最大値・ステップ指定で、負の数や小数の入力を防ぐことが可能
- `requestAnimationFrame` を使用した秒単位の丸め更新は、安定した動作が期待できる

### 次に活かす点
- 通知の実装方法（notify 手段）を最初から requirements に明記するべき
- Should（残り時間が大きく見える）は実装時の優先度が低くなるため、実装の可否や構成を先に spec 段階で判断すべき
