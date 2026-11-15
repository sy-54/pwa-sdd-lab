# 読書記録 設計

> アプリ状態（一覧 vs フォーム）と フィルタ値を保持。ロジックは純粋関数として DOM 操作と分離し、すべてのデータを `books` キーで一元保存。
> モジュール: main.js（UI・状態）/ logic.js（ロジック）。SDK: storage / ui.toast / ui.confirm / camera。
> テスト環境での写真撮影は filechooser で代替。

## モジュール構成

| ファイル | 責務 |
|---|---|
| `main.js` | アプリ初期化、フォーム表示/非表示、イベントリスナ、SDK 呼び出し、DOM 更新 |
| `logic.js` | 本の追加・編集・削除・フィルタ（純粋関数。DOM 参照なし） |

## データモデル

保存キー：`books`。型：配列。破損値は空配列 `[]` で再開。

```
[
  {
    id: "uuid-xxx",
    title: "本のタイトル",
    status: "want" | "reading" | "done",
    rating: 0-5,
    note: "感想...",
    cover: Blob | null
  }
]
```

- `id`: ユニークな文字列（生成は `Date.now().toString(36)` など）
- `title`: 必須。空または空白のみ不可
- `status`: 「読みたい」= `want`、「読んでいる」= `reading`、「読んだ」= `done`
- `rating`: 0（未評価）～5。`status="done"` のときのみ入力可能
- `note`: 感想。`status="done"` のときのみ入力可能
- `cover`: 写真。`storage.set` するとき JSON にできないため、Blob は分けて保存キー `books:cover:${id}` で保存

## 使用するSDK API

| API | 用途 |
|---|---|
| `await storage.get('books', [])` | 起動時に本一覧読み込み |
| `await storage.set('books', items)` | 本追加・編集・削除後に保存 |
| `await storage.set('books:cover:' + id, blob)` | 写真を個別キーで保存 |
| `await storage.get('books:cover:' + id)` | 写真を読み込み |
| `ui.toast(msg)` | エラー表示（題名が空のとき） |
| `await ui.confirm(msg, { ok, cancel })` | 削除時の確認ダイアログ |
| `await camera.takePhoto({ maxSize: 320 })` | 表紙撮影（キャンセルは null） |

## ACとテストの対応

| AC | 単体テスト | E2E |
|---|---|---|
| AC-01: 新規追加フォームを開く | ― | ✓ |
| AC-02: 題名が空の場合、保存できない | `addBook()` で空チェック | ✓ |
| AC-03: 正常に本を登録 | `addBook()` | ✓ |
| AC-04: 本を編集 | ― | ✓ |
| AC-05: 本の状態を変更 | `updateBook()` | ✓ |
| AC-06: 読んだ本に評価を登録 | `updateBook()` | ✓ |
| AC-07: 読んだ本の評価は任意 | `updateBook()` で rating=0 | ✓ |
| AC-08: 本を削除 | `deleteBook()` | ✓ |
| AC-09: フィルタで絞り込み | `filterBooks()` | ✓ |
| AC-10: フィルタを「すべて」にリセット | `filterBooks()` | ✓ |
| AC-11: データが永続化される | ― | ✓ |
| AC-12: 読んだ本から他の状態に戻せる | `updateBook()` | ✓ |
| AC-13: 写真を撮影して保存 | ― | ✓ |

テスト環境での確認方法：
- 写真（AC-13）：E2E で `page.waitForEvent('filechooser')` + `setFiles()` で実ファイル代替
- カメラ使えない環境：撮影ボタン非表示（テスト環境は常にカメラなしと想定）
- 永続化（AC-11）：`page.reload()` 後にデータ確認
- トースト（AC-02）：`page.locator('[data-testid="sdk-toast"]')` で検証
