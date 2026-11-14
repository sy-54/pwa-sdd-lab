# ToDo 要求仕様

> やることを書き留めて、済んだら消し込むリスト。
> 追加・完了・削除ができ、残りの件数が分かる。
> 思いついた瞬間にすぐ書けることが大事。

目的：その日のやることを忘れないようにする。
利用者：本人（個人利用）。

## Must
- やることを追加できる
- 完了／未完了を切り替えられる
- 削除できる
- 残っている件数が分かる
- アプリを閉じて開き直しても内容が残る

## Should
- 完了したものは見た目で区別できる

## Won't
- 期限、並べ替え、カテゴリ、複数リスト

## 制約
- platform の SDK を使う（`sdk/README.md`）。静的ファイルのみ

## UI契約
- エントリ：`apps/todo/index.html`（`apps/todo/manifest.json` も置く）
- ルート要素：`data-testid="app-root"`
- 入力欄：`data-testid="new-todo"`、追加ボタン：`data-testid="add"`
- 各項目：`data-testid="todo-item"`。その中に `"todo-text"`（内容）、`"todo-toggle"`（`input type="checkbox"`）、`"todo-delete"`（ボタン）
- 残り件数：`data-testid="todo-count"`（テキストは数字のみ）

## 改訂履歴
- 変わった点：削除時の確認ダイアログは出さず、確認なしで即削除する仕様に決定（D3）。質問時の推奨（確認あり）とは異なる選択をした。
- 分かった点：`storage.set` 失敗時の挙動（画面を変更前のまま保ち `ui.toast` で通知）は要求に明記がなかったため、実装時に spec.md で定義した。
- 次に活かす点：保存失敗時のエラー表示方針（トースト通知か、画面ロールバックか）は次回の requirements に最初から書いておく。
