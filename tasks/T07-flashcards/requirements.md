# 単語帳 要求仕様

> 表と裏のあるカードを登録して、めくりながら覚えるアプリ。
> 学習では「覚えた／まだ」を付けて進み、まだのカードは覚えるまで繰り返す。
> 電車の中で、片手で数分だけ使う。

目的：英単語や用語を、すきま時間に繰り返して覚える。
利用者：本人（個人利用）。

## Must
- カード（表と裏）を追加、削除できる
- 学習を始めると、カードの表が1枚ずつ出る。めくると裏が見える
- カードごとに「覚えた」か「まだ」を付けて次へ進む。「まだ」のカードは、覚えるまで同じ学習の中で繰り返し出る
- 全部覚えたら結果（1回で覚えた枚数）が出て、一覧に戻れる
- アプリを閉じて開き直してもカードが残る

## Won't
- 複数の単語帳、画像や音声、学習履歴、間隔反復

## 制約
- platform の SDK を使う（`sdk/README.md`）。静的ファイルのみ

## UI契約
- エントリ：`apps/flashcards/index.html`（`apps/flashcards/manifest.json` も置く）、ルート要素：`data-testid="app-root"`
- 一覧：入力 `card-front-input`、`card-back-input`、追加 `add-card`、学習開始 `study-start`
- 各カード `card-item`：その中に `card-front`、`card-back`、`card-delete`
- 学習画面 `study-view`（学習中だけ表示）：表 `study-front`、裏 `study-back`（めくるまで非表示）、`flip`、`know`（覚えた）、`again`（まだ）
- 進み具合 `study-progress`：`覚えた枚数/全体の枚数`（例 `2/5`）
- 結果 `study-result`（学習が終わったときだけ表示）：`result-known`（1回で覚えた枚数。数字のみ）、`study-finish`（一覧へ戻る）
