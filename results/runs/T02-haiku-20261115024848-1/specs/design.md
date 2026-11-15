# ToDo 設計

> ロジック（状態変更）を純粋関数に分離し、DOM 操作と分ける。
> storage で永続化し、起動時に復元。
> 各操作のたびに storage に保存する。

## モジュール構成

- `main.js`：DOM 操作、イベント処理、storage の呼び出し、画面更新
- `logic.js`：ロジック関数（タスク追加、削除、完了切り替え、残り件数計算）

## データモデル

storage キー `items` に配列を保存。形：
```
[
  { id: "uuid-1", text: "買い物", completed: false },
  { id: "uuid-2", text: "洗濯", completed: true }
]
```

- `id`：各タスクの一意識別子（UUID）
- `text`：タスク内容（空白のみの場合は追加しない）
- `completed`：完了状態

壊れた値を読んだ場合（型不正、id/text 欠落など）：初期値 `[]` で上書き。

## 使用するSDK API

- `storage.get(key, 既定値)`：起動時にタスクを復元する
- `storage.set(key, value)`：タスクの追加・削除・完了状態変更のたびに保存

## ACとテストの対応

| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: 追加後に入力値がクリア | add.spec.ts: 入力欄を確認 |
| AC-02 | logic.test.js: 空白のみは items に追加されない | add.spec.ts: 空入力で追加ボタン |
| AC-03 | logic.test.js: 新規タスクはリスト末尾に追加 | add.spec.ts: 順序を確認 |
| AC-04 | logic.test.js: 完了切り替え後に計算される | count.spec.ts: チェック後カウント確認 |
| AC-05 | ― | display.spec.ts: 打ち消し線の有無 |
| AC-06 | logic.test.js: 削除後にカウント再計算 | delete.spec.ts: 削除と count 更新 |
| AC-07 | ― | persistence.spec.ts: 再読み込み後の状態 |
| AC-08 | ― | add.spec.ts: Enter キー押下で追加 |
