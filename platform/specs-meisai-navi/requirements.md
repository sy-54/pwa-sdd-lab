# 明細節約ナビ 要求仕様

> 楽天カードの利用明細CSVを読み込み、支出を費目に分けて割合を見せ、節約ポイントを提案するミニアプリ。
> 本人が月に一度、iPhone でCSVを読み込んで使う。
> 明細は端末の外に出さない。

目的：カードの支出がどの費目に偏っているかを把握し、減らしやすいところに気づけるようにする。
利用者：本人（個人利用）。

## Must
- 楽天e-NAVIの利用明細CSV（複数ファイル可）を読み込める
- 店名から費目を自動で分類し、費目ごとの金額と割合が分かる
- 表示する期間を、全期間と月ごとで切り替えられる
- 節約ポイント（リボ・分割手数料、サブスク、コンビニ、デリバリー、外食、通信費など）が分かる
- 明細の一覧を見られ、店ごとに費目を修正できる（同じ店名の明細すべてに効く）
- 費目を自分で追加・改名・削除できる
- アプリを閉じて開き直しても、読み込んだ明細、費目、費目の修正が残る
- 読み込んだファイルを個別に削除でき、すべて消すこともできる

## Should
- 月ごとの合計の推移、よく使った店の上位
- 明細を店名で探す、費目でしぼる

## Won't
- 他社カード・銀行の明細、収入、予算、明細の手入力、CSVや画像の書き出し、外部サービスとの連携

## 制約
- platform の SDK を使う（`sdk/README.md`）。静的ファイルのみ。外部通信をしない
- 楽天e-NAVIのCSVは UTF-8（BOM あり）と Shift_JIS のどちらでも読めること

## UI契約
- エントリ：`apps/meisai-navi/index.html`（`apps/meisai-navi/manifest.json` も置く）
- ルート要素：`data-testid="app-root"`
- CSV選択：`data-testid="csv-file"`（`input type="file"`）、読み込み結果の文言：`data-testid="import-message"`
- 期間の切り替え：`data-testid="month-chip"`（`data-month` は `all` または `YYYY-MM`）
- 合計：`data-testid="total"`。費目の行：`data-testid="category-row"`（`data-cat` に費目ID）。その中に `"category-amount"`、`"category-share"`
- 節約ポイント：`data-testid="tip"`。節約額の目安の合計：`data-testid="tip-total"`
- 費目の編集：新しい費目名 `data-testid="category-name"`（`input`）、追加 `data-testid="category-add"`、削除 `data-testid="category-delete"`
- 明細の行：`data-testid="tx-row"`。その中に `"tx-name"`、`"tx-amount"`、`"tx-category"`
- 金額の表示（`total`、`category-amount`、`tx-amount`）は、数字と3桁区切りのカンマのみ（例 `1,200`）。割合は小数1桁と `%`（例 `24.2%`）

## 改訂履歴
- 変わった点：費目を固定にせず、追加・改名・削除できるようにした（D2、D5）。「その他」は削除できない
- 変わった点：同じファイル名のCSVは置き換える（D1）。節約ポイントに仮定つきの目安額を出す（D3）。明細0件のときはサンプルを出さず案内だけにする（D4）
- 変わった点：費目名は空・重複を受け付けず20文字まで、費目は全部で12まで（spec の未決事項を仮の挙動のまま実装）
- 分かった点：追加した費目は自動分類されない。初期の費目を削除すると「すべて消す」以外では戻せない
- 分かった点：作業環境で WebKit を入手できず、E2E は iPhone 14 設定の Chromium で通した。WebKit での通過と、実物の楽天CSV・実機でのファイル選択は未確認
- 分かった点：文書は lint が UI契約のファイルを探せるよう `platform/specs-meisai-navi/` に置いた（specs ディレクトリの1つ上が基準になるため）
- 次に活かす点：分類を扱うアプリは、区分が固定か編集できるかを Must に書く。外部のファイルを読むアプリは、実物の見出し行を requirements に添える
