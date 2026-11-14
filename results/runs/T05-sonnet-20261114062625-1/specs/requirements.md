# 支出メモ 要求仕様

> 使ったお金をその場で記録し、今月いくら使ったかを見るアプリ。
> 金額と分類を入れて追加するだけ。
> レジの前で、数秒で入力できること。

目的：今月の出費をざっくり把握して、使いすぎに気づけるようにする。
利用者：本人（個人利用）。

## Must
- 金額と分類（食費・日用品・交通・その他）を入力して記録できる
- 記録の一覧を見られる
- 今月の合計が分かる
- 記録を削除できる
- アプリを閉じて開き直しても記録が残る

## Should
- 分類ごとの今月の合計

## Won't
- 収入、予算、グラフ、記録の編集、他の通貨

## 制約
- platform の SDK を使う（`sdk/README.md`）。静的ファイルのみ

## UI契約
- エントリ：`apps/expense/index.html`（`apps/expense/manifest.json` も置く）
- ルート要素：`data-testid="app-root"`
- 金額：`data-testid="amount"`（`input`）、分類：`data-testid="category"`（`select`。値は `food` / `daily` / `transport` / `other`）、追加：`data-testid="add"`
- 各記録：`data-testid="expense-item"`。その中に `"expense-amount"`、`"expense-category"`（分類の表示名）、`"expense-delete"`（ボタン）
- 今月の合計：`data-testid="total"`
- 金額の表示（`expense-amount` と `total`）は、数字と3桁区切りのカンマのみ（例 `1,200`）

## 改訂履歴
- 変わった点：不正な金額の入力時は何もしないのではなく、`ui.toast` でエラーを知らせる仕様にした（D1）。Should の「分類ごとの今月の合計」は今回は実装しない（D3）
- 分かった点：「記録の一覧」と「今月の合計」で対象期間が異なる（一覧は全期間、合計は今月のみ）ことが要求文からは明示されておらず、設計時に推論が必要だった（D6）
- 次に活かす点：一覧の対象期間（全期間か今月だけか）や削除確認の文言は、次回は requirements.md に最初から明記する
