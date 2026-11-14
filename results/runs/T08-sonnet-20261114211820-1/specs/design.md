# 読書記録 設計

> ロジック（本の追加・更新・削除・絞り込み・表示用整形）は `apps/books/logic.js` に純粋関数として分離し、`main.js` は DOM とSDK呼び出しだけを担う。
> データは `storage` の単一キー `books` に本の配列をまるごと保存する。評価・感想は状態が `done` でないとき、保存直前にロジック側で削除する。
> AC-03・AC-08・写真関連は実機確認が難しいため、E2Eで hidden 属性・再読み込み・filechooser を使って確認する。

## モジュール構成
- `apps/books/index.html`：画面の骨格（`app-root` 配下に一覧とフォームを静的に用意し、`hidden` で切り替え）
- `apps/books/manifest.json`：アプリ定義
- `apps/books/main.js`：`storage`/`ui`/`camera` の呼び出し、イベント結線、DOM描画。`logic.js` の関数を呼ぶだけ
- `apps/books/logic.js`：DOMに触れない純粋関数群（下記）

### logic.js の関数
- `normalizeBooks(raw)`：`storage.get` の戻り値を検証し、配列でなければ `[]` を返す
- `addBook(books, input)`：先頭に新規本を追加した配列を返す（`id` は `crypto.randomUUID()` で `main.js` が生成して渡す）
- `updateBook(books, id, input)`：該当本を同じ位置で更新した配列を返す。`input.status !== 'done'` のとき `rating`/`note` を除いて保存
- `removeBook(books, id)`：該当本を除いた配列を返す
- `filterBooks(books, filter)`：`filter`（`all`/`want`/`reading`/`done`）で絞り込んだ配列を返す
- `validateTitle(title)`：前後空白を除いて空なら `false`
- `ratingStars(rating)`：評価数に応じた `'★'` の繰り返し文字列を返す（`rating` が無ければ `''`）

## データモデル
- キー `books`：値は配列。各要素 `{ id: string, title: string, status: 'want'|'reading'|'done', rating?: 1-5の数値, note?: string, cover?: Blob }`
- 例：`[{ id: 'a1', title: '本A', status: 'done', rating: 3, note: '良い', cover: Blob }]`
- `status !== 'done'` の要素は `rating`/`note` キー自体を持たない（undefinedではなくキーを削除）
- `storage.get('books', [])` の戻り値が配列でない場合、`normalizeBooks` が `[]` に補正する（登録済みデータは失われる。例外は出さない）

## 使用するSDK API
- `mountApp`：起動時のヘッダー表示
- `storage.get` / `storage.set`：`books` の読み書き
- `ui.toast`：タイトル空欄エラー、`camera.takePhoto` 失敗時のエラー表示
- `ui.confirm`：削除確認
- `camera.takePhoto`：表紙撮影
- `notify`：使わない（通知の要求なし）

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | logic.test.js: addBook が先頭に追加する | books.spec.ts |
| AC-02 | logic.test.js: updateBook が位置を保持する | books.spec.ts |
| AC-03 | ― | books.spec.ts（`form-status` 変更直後の `hidden` 属性を確認） |
| AC-04 | logic.test.js: updateBook が done 以外で rating/note を削除する | books.spec.ts |
| AC-05 | logic.test.js: validateTitle が空白のみを拒否する | books.spec.ts |
| AC-06 | logic.test.js: filterBooks が状態で絞り込む | books.spec.ts |
| AC-07 | logic.test.js: removeBook が該当本を除く | books.spec.ts（`ui.confirm` のOK/キャンセル） |
| AC-08 | ― | books.spec.ts（再読み込みで復元を確認） |
