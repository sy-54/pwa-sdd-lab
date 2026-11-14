# 写真メモ 設計

> モジュールを「ロジック」と「画面」に分ける。ロジック（画像処理、ID生成）は単体テスト、画面（DOM・イベント・保存呼び出し）は E2E で検証。
> 写真をペアキー方式（photos: ID→Blob、captions: ID→テキスト）で保存し、メモ編集は自動保存。
> SDK の camera と storage を使い、削除・エラー処理は confirm と notify で実装。

## モジュール構成

| ファイル | 責務 |
|---|---|
| `main.js` | 起動・画面レンダリング・イベント・SDK呼び出し |
| `logic.js` | ID 生成・写真リスト取得・メモ追加・削除判定・入力値検証 |

**ロジック関数**：単体テストで確認。戻り値は新しいメモ配列や ID 文字列など。
**画面処理**：E2E で確認。DOM 更新・保存呼び出し・ユーザー入力反応。

## データモデル

**キー名**（storage に保存）

| キー | 値の形 | 例 |
|---|---|---|
| `photos` | `{ [ID]: Blob, ... }` | `{ "p1": Blob, "p2": Blob }` |
| `captions` | `{ [ID]: string, ... }` | `{ "p1": "駐車場3階", "p2": "" }` |
| `photoOrder` | `string[]` | `["p2", "p1"]`（新しい順） |

**ID 生成**：`Date.now().toString(36)` で一意（秒レベル）。複数枚同時撮影時は接尾辞で区別。

**壊れた値の扱い**：
- 読み込み時に `photos`/`captions` が未定義か非オブジェクトなら `{}`、`photoOrder` が非配列なら `[]` として初期化
- 不正な ID が `photoOrder` に含まれていたら削除

## 使用するSDK API

| API | 用途 |
|---|---|
| `camera.takePhoto({ maxSize: 1280 })` | 写真撮影（Blob で取得） |
| `storage.get(key, 既定値)` | 起動時にデータ読み込み |
| `storage.set(key, value)` | メモ更新・削除時に保存 |
| `ui.confirm(文言, { ok, cancel })` | 削除確認ダイアログ |
| `notify.send(タイトル, 本文)` | 撮影失敗・保存失敗通知 |
| `ui.toast(文言)` | 撮影失敗時のトースト表示 |

（`storage.remove` は不要。キーは常に存在し、値を削除するときは `photos`/`captions` のオブジェクトから該当 ID を削除）

## ACとテストの対応

| AC | 単体テスト | E2E | 備考 |
|---|---|---|---|
| AC-01: 初期状態で空表示 | ― | memo-empty 表示確認 | 画面処理のため |
| AC-02: 撮影後に一覧に追加 | ― | 撮影→memo-item 生成確認 | camera SDK に依存 |
| AC-03: 新しい順に表示 | `photoOrder` の順序確認 | 連続撮影後の並び確認 | 順序判定は単体、UI は E2E |
| AC-04: メモ自動保存 | ― | 入力→storage 確認 | DOM 入力と保存呼び出し |
| AC-05: 削除確認ダイアログ | ― | delete 押下後 confirm 表示 | ui.confirm に依存 |
| AC-06: 削除実行 | `ID削除関数の動作` | 確認 OK 後に削除 | ロジックと画面を確認 |
| AC-07: 削除キャンセル | ― | 確認 Cancel 後も item 存在 | E2E のみ |
| AC-08: 最後の削除で空表示 | ― | 1 個削除後に memo-empty 表示 | 画面処理のため |
| AC-09: 再起動後も残存 | ― | 재起후 data 確認 | storage の復元 |
| AC-10: 撮影キャンセル | ― | cancel 時リスト不変 | camera API の戻り値 null 処理 |

**テスト環境での確認方法**：
- `AC-02`（撮影）：Playwright の filechooser で画像ファイルを指定
- `AC-04`（自動保存）：E2E で input に入力後、storage から値を fetch して確認
- `AC-09`（再起動）：E2E で page.reload() 実行後、画面に写真が表示されているか確認
- エラーハンドリング（撮影失敗・保存失敗）：E2E で notify/toast の文言を確認（または mock）
