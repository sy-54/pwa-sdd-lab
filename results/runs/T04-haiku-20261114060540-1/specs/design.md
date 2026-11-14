# 習慣トラッカー 設計

> 習慣データと UI を分離し、ロジック（追加・削除・連続日数計算）を単体テスト対象の純粋関数に、UI とイベントを main.js に配置。
> 保存データは単一キー `habits` に配列を持ち、各習慣は id・name・checked・streak・lastDate を持つ。
> 連続日数はアプリ起動時に日付判定してから UI に反映。

## モジュール構成
- `apps/habit/main.js`：SDK初期化、DOM レンダリング、イベントハンドラ、storage 操作
- `apps/habit/logic.js`：習慣の CRUD、連続日数の計算（日付判定を含む）、データ検証

## データモデル
- キー：`"habits"`、値：習慣の配列
- 具体例：
```json
[
  {
    "id": "h1",
    "name": "筋トレ",
    "checked": true,
    "streak": 1,
    "lastDate": "2026-11-14"
  }
]
```
- 壊れた値（空配列でない、要素が不正）の扱い：`storage.get('habits', [])`で既定値を空配列とし、初期状態で再スタート

## 使用するSDK API
- `mountApp`：起動時に1度、ヘッダー挿入
- `storage.get`：アプリ起動時に習慣一覧を読み込む
- `storage.set`：チェック操作、習慣追加・削除時にデータ保存
- `ui.confirm`：削除ボタン押下時に確認ダイアログ表示

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: 空欄入力で追加されない | habit.spec.ts |
| AC-02 | ― | habit.spec.ts: チェック操作と保存 |
| AC-03 | logic.test.js: 初回チェック時 streak=1 | habit.spec.ts |
| AC-04 | logic.test.js: 翌日判定で streak+=1 | habit.spec.ts |
| AC-05 | logic.test.js: 翌日未チェック時 streak=0 | habit.spec.ts |
| AC-06 | ― | habit.spec.ts: 確認ダイアログ＆削除 |
| AC-07 | ― | habit.spec.ts: 再起動後の復元 |
| AC-08 | logic.test.js: 空文字列でスキップ | habit.spec.ts |
