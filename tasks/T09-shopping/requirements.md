# 買い物リスト 要求仕様

> 買うものを書いておき、買ったらチェックするリスト。
> 商品名と数量を登録し、残り（未購入）の件数が分かる。
> スーパーの中で、片手で使う。

目的：買い忘れ・買いすぎを防ぐ。
利用者：本人（個人利用）。

## Must
- 商品名と数量を入力して登録できる
- 買った／未購入を切り替えられる
- 削除できる
- 未購入の件数が分かる
- アプリを閉じて開き直しても内容が残る

## Should
- 数量を入力しないときは 1 個として扱う

## Won't
- カテゴリ分け、価格、複数リスト、他の人との共有、並べ替えの手動操作

## 制約
- platform の SDK を使う（`sdk/README.md`）。静的ファイルのみ

## UI契約
- エントリ：`apps/shopping/index.html`（`apps/shopping/manifest.json` も置く）
- 商品名：`data-testid="new-item-name"`、数量：`data-testid="new-item-qty"`（`input`。空欄可）、追加：`data-testid="add"`。入力欄で Enter を押しても追加される
- ルート要素：`data-testid="app-root"`
- 各項目：`data-testid="shopping-item"`。その中に `"item-name"`（商品名）、`"item-qty"`（数量。数字のみ）、`"item-toggle"`（`input type="checkbox"`。買った）、`"item-delete"`（ボタン）
- 未購入の件数：`data-testid="remaining-count"`（テキストは数字のみ）
