# 読書記録 要求仕様

> 読みたい本・読んでいる本・読んだ本を1か所で管理するアプリ。
> 本を登録し、状態を変え、読み終えたら評価と感想を残す。表紙の写真も付けられる。
> 本屋で「これ読んだっけ？」をすぐ確かめたい。

目的：読んだ本と読みたい本を忘れないようにし、感想を後で見返せるようにする。
利用者：本人（個人利用）。

## Must
- 本（題名と状態）を登録、編集、削除できる。状態は 読みたい／読んでいる／読んだ
- 読んだ本には評価（1〜5）と感想を残せる
- 表紙の写真を付けられる（任意）
- 状態で絞り込める。表示中の件数が分かる
- アプリを閉じて開き直しても残る

## Won't
- 著者や ISBN の管理、検索、並べ替え、共有

## 制約
- platform の SDK を使う（`sdk/README.md`）。カメラと保存は SDK 経由。静的ファイルのみ

## UI契約
- エントリ：`apps/books/index.html`（`manifest.json` も置く）、ルート要素：`data-testid="app-root"`
- 一覧：追加 `book-new`、絞り込み `filter`（`select`。値 `all` / `want` / `reading` / `done`）、件数 `book-count`（表示中の件数。数字のみ）
- 各本 `book-item`：`book-title`、`book-status`（読みたい／読んでいる／読んだ）、`book-edit`、評価があれば `book-rating`（★を評価の数だけ。例 `★★★`）、写真があれば `book-cover`（`img`）
- フォーム `book-form`（追加・編集のときだけ表示）：`form-title`、`form-status`（`select`。値 `want` / `reading` / `done`）、`form-rating`（`select`。値は空 / `1`〜`5`）、`form-note`（`textarea`）、`form-cover`（撮影ボタン）、`form-save`、`form-cancel`、`form-delete`（編集のときだけ表示）
