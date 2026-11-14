# 写真メモ 要求仕様

> 写真を撮って、一言メモを付けて残しておくアプリ。
> 撮る・一覧で見る・メモを書く・消す、だけ。
> 駐車場の番号やホワイトボードなど、後で見返すための控え。

目的：覚えておきたいものを写真と一言で素早く控える。
利用者：本人（個人利用）。

## Must
- 写真を撮って保存できる
- 撮った写真を一覧で見られる
- 写真ごとに一言メモを付けられる
- 写真を削除できる
- アプリを閉じて開き直しても写真とメモが残る

## Should
- 写真が1枚もないときは、その旨が分かる

## Won't
- アルバム分け、写真の編集、共有、検索

## 制約
- platform の SDK を使う（`sdk/README.md`）。カメラと保存は SDK 経由。静的ファイルのみ

## UI契約
- エントリ：`apps/photo-memo/index.html`（`apps/photo-memo/manifest.json` も置く）
- ルート要素：`data-testid="app-root"`
- 撮影ボタン：`data-testid="shoot"`
- 各写真：`data-testid="memo-item"`。その中に `"memo-img"`（`img`）、`"memo-caption"`（`input type="text"`）、`"memo-delete"`（ボタン）
- 写真がないときの表示：`data-testid="memo-empty"`（写真があるときは非表示）

## 改訂履歴

### 分かった点
- 壊れた保存データ（配列でない、要素に blob/caption がない）は警告なしに空配列で初期化する必要がある（spec L54-55）
- ストレージ容量満杯時は保存失敗として toast で表示し、アイテムは一覧から除去しない（spec L56）
- メモの初期値は空白とする（D5、spec L115）
