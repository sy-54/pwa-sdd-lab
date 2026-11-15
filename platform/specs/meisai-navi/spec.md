# 明細節約ナビ 外部仕様

> 4画面（内訳・節約・明細・データ）を下のタブで切り替える。データ画面でCSVを読み込み、内訳で費目の割合、節約で提案を見る。
> 明細・費目・店ごとの費目修正を `storage` に保存する。外部通信はしない。
> 未決事項が2つある（費目名の不正入力、費目数の上限）。仮の挙動と、費目を削除したときの明細の行き先（D5）を見てほしい。

## 画面と操作
- 置くファイル：`apps/meisai-navi/index.html`（`apps/meisai-navi/manifest.json` も置く）。ルート要素：`data-testid="app-root"`
- タブ：`data-testid="tab-home"`（内訳）、`"tab-tips"`（節約）、`"tab-list"`（明細）、`"tab-data"`（データ）。選択中は `aria-current="page"`
- 期間の切り替え（データ以外の3画面の上部）：`data-testid="month-chip"`（`data-month` は `all` または `YYYY-MM`）。選択中は `aria-pressed="true"`
- 内訳
  - 合計：`data-testid="total"`、件数：`data-testid="count"`
  - 費目の行：`data-testid="category-row"`（`data-cat` に費目ID）。その中に `"category-amount"`、`"category-share"`。押すと、その費目でしぼった明細へ移る
  - 月ごとの合計の棒（2か月以上あるとき）、よく使った店の上位5件（`data-testid="shop-row"`）
- 節約
  - 節約額の目安の合計：`data-testid="tip-total"`。節約ポイント：`data-testid="tip"`（`data-kind` に種類）。目安額があるものは中に `"tip-saving"`
- 明細
  - 店名で探す：`data-testid="tx-search"`（`input`）、費目でしぼる：`data-testid="tx-filter"`（`select`。値は空または費目ID）
  - 明細の行：`data-testid="tx-row"`。その中に `"tx-name"`、`"tx-amount"`、`"tx-category"`
  - 行を押すと費目の選択肢 `data-testid="category-option"`（`data-cat`）が出る。選ぶと閉じる
- データ
  - CSV選択：`data-testid="csv-file"`（`input type="file"`、複数可）、読み込み結果の文言：`data-testid="import-message"`
  - 読み込み済みファイル：`data-testid="file-row"`。その中に `"file-delete"`。すべて消す：`data-testid="clear-all"`
  - 費目の編集：新しい費目名 `data-testid="category-name"`（`input`）、追加 `data-testid="category-add"`。費目ごとに `data-testid="category-edit"`（`input`、変更を確定すると改名）と、削除 `data-testid="category-delete"`（`other` にはない）
- 明細が0件のとき、内訳・節約・明細には案内 `data-testid="empty-guide"` と、データ画面へ移るボタン `data-testid="go-import"` だけを出す
- 金額の表示（`total`、`category-amount`、`tx-amount`）は、数字と3桁区切りのカンマのみ（例 `1,200`）。割合は小数1桁と `%`（例 `24.2%`）

## 振る舞い
- 初期状態：明細0件、期間は `all`、画面は内訳。費目は次の9つ（ID／名前）
  `food` 食料品／`dining` 外食・カフェ／`shop` 買い物／`subs` サブスク／`util` 通信・光熱／`move` 交通・車／`fun` 趣味・旅行／`life` 医療・保険・教育／`other` その他
- CSV：見出し行は「利用日」を含む最初の行。列は見出しの部分一致で探す（利用日、利用店名、利用金額、手数料、支払方法）。利用日が日付でない行（分割の内訳行など）は飛ばす。文字コードは UTF-8 を試し、読めなければ Shift_JIS
- 同じファイル名を読み込むと、古い方を置き換える。複数選択では、読めたファイルだけ取り込む
- 月は利用日の年月。`month-chip` は `all`、続けて新しい月の順。選んでいた月が削除でなくなったら `all` に戻す
- 自動分類：店名を正規化（半角カナ→全角、英字は大文字、小書きのカナは大書き、空白と記号を除く）し、キーワード表でいちばん長く一致した費目にする。一致しなければ `other`
- 店ごとの費目修正：正規化した店名が同じ明細すべてに効く。自動分類より優先する。自動分類と同じ費目を選ぶと修正は消える
- 費目の行は金額の大きい順。0円の費目は出さない。割合は表示中の期間の合計に対する比。返金（負の金額）は合計から引く
- 明細は利用日の新しい順。150件を超える分は「さらに表示」で出す
- 節約ポイント（`data-kind`／出す条件／目安額。「月あたり」は期間が `all` なら月数で割る）
  - `fee`：手数料が0より大きいか、支払方法に「リボ」「分割」を含む明細がある／手数料の月あたり合計
  - `subs`：サブスクの明細がある／サービスが3件以上のとき、安い方から3分の1（切り上げ）の件数分
  - `conv`：コンビニが月あたり3,000円以上／その3割
  - `deli`：デリバリーの明細がある／その5割
  - `dining`：デリバリーを除く外食・カフェが月あたり15,000円以上、または合計の15%以上／その2割
  - `tel`：通信費が月あたり6,000円以上／その3割
  - `ec`：ネット通販が月あたり6回以上／その15%
  - `small`：コンビニ以外の1,000円未満が月あたり12回以上／その2割
  - `rise`：前月より3,000円以上かつ20%以上増えた費目がある（増加額が最大の1つ）／なし
  - `dup`：同じ日・同じ店・同じ金額（1,000円以上）が2件以上／なし
  - 並びは `fee`、続けて目安額の大きい順。`tip-total` は目安額の合計。各ポイントに置いた仮定を文章で示す
- 費目の追加：ID は自動で振る。追加した費目は自動分類の対象にならず、店ごとの修正でだけ使われる
- 費目の削除：`other` 以外は削除できる。その費目への店ごとの修正は消え、店は自動分類に戻る。自動分類の結果が削除済みの費目なら `other` にする
- すべて消す：明細と店ごとの修正を消し、費目を初期の9つに戻す（削除した初期の費目を戻す手段はこれだけ）
- 保存：`storage` のキー `state` に、ファイル（名前と明細）、費目、店ごとの修正をまとめて入れる。変更のたびに保存し、開き直すと復元する。期間・画面・検索語は保存しない

## エラー時の挙動
- CSVに「利用日」「利用店名」「利用金額」の列がない、または明細が1行も読めない：`import-message` に「<ファイル名>：<理由>」を出し、そのファイルは取り込まない。保存済みのデータは変えない
- 保存データが壊れている（形が違う）：明細0件・初期の費目として開く
- 保存に失敗：`ui.toast` で「保存できませんでした」と出す。画面の表示はそのまま
- すべて消す、費目の削除：`ui.confirm` で確認し、OK のときだけ消す。ファイルの個別削除は確認しない

## 受け入れ条件
### AC-01: CSVを読み込むと合計が出る
- Given 明細0件。CSV（10/1 セブン-イレブン 1,234、10/2 ガスト 980、10/3 NETFLIX.COM 1,590）
- When `csv-file` にそのCSVを設定する
- Then `import-message` に「1ファイル・3件を読み込みました。」、`tab-home` を押すと `total` に 3,804、`count` に 3
### AC-02: 費目ごとの金額と割合
- Given AC-01 のCSVを読み込んだ状態
- When `tab-home` を押す
- Then `category-row` は `subs`、`food`、`dining` の順。`food` の `category-amount` に 1,234、`category-share` に 32.4%
### AC-03: 月で切り替える
- Given 9月に1件 500、10月に1件 800 のCSVを読み込んだ状態
- When `data-month="2026-09"` の `month-chip` を押す
- Then `total` に 500
### AC-04: 手数料の節約ポイント
- Given 支払方法「分割6回払い」、手数料 1,296 の明細を含むCSVを読み込んだ状態
- When `tab-tips` を押す
- Then `data-kind="fee"` の `tip` が先頭にあり、その `tip-saving` に 1,296 を含む
### AC-05: 店ごとに費目を修正する
- Given 「個人商店カワムラ」の明細が2件（どちらも `other`）ある状態
- When 明細で1件目の `tx-row` を押し、`data-cat="food"` の `category-option` を押す
- Then 2件とも `tx-category` に 食料品
### AC-06: 開き直しても残る
- Given AC-05 の操作をした状態
- When ページを再読み込みして `tab-list` を押す
- Then 「個人商店カワムラ」の2件とも `tx-category` に 食料品
### AC-07: 同じファイル名は置き換える
- Given AC-01 のCSVを読み込んだ状態
- When 同じファイル名のCSVをもう一度 `csv-file` に設定する
- Then `tab-home` の `total` に 3,804、データ画面の `file-row` は1つ
### AC-08: ファイルを削除する
- Given AC-01 のCSVを読み込んだ状態
- When `file-delete` を押し、`tab-home` を押す
- Then `empty-guide` が見え、`total` はない
### AC-09: すべて消す
- Given AC-01 のCSVを読み込んだ状態
- When `clear-all` を押し、`sdk-confirm-cancel` を押す
- Then `file-row` は1つのまま。もう一度 `clear-all` を押して `sdk-confirm-ok` を押すと `file-row` は0
### AC-10: 費目を追加して使う
- Given AC-01 のCSVを読み込んだ状態
- When `category-name` に「ペット」と入れて `category-add` を押し、明細で「ガスト」の `tx-row` を押す
- Then `category-option` に「ペット」があり、押すとその行の `tx-category` に ペット
### AC-11: 費目を改名する
- Given AC-01 のCSVを読み込んだ状態
- When 食料品の `category-edit` を「食費」に変えて確定し、`tab-list` を押す
- Then 「セブン-イレブン」の `tx-category` に 食費
### AC-12: 読めないCSV
- Given AC-01 のCSVを読み込んだ状態。見出しが「日付,内容,金額」の `bad.csv`
- When `csv-file` に `bad.csv` を設定する
- Then `import-message` に「bad.csv」と「利用日」を含む文言。`file-row` は1つのまま
### AC-13: Shift_JIS のCSV
- Given 明細0件。AC-01 と同じ内容を Shift_JIS で保存したCSV
- When `csv-file` にそのCSVを設定し、`tab-list` を押す
- Then 1件目の `tx-name` に「NETFLIX.COM」、3件目の `tx-name` に「セブン-イレブン」
### AC-14: 明細で探す・しぼる
- Given AC-01 のCSVを読み込んだ状態
- When 明細の `tx-search` に「ガスト」と入れる
- Then `tx-row` は1つ。`tx-search` を空にして `tx-filter` で `subs` を選ぶと `tx-row` は1つで `tx-name` に「NETFLIX.COM」
### AC-15: 費目名が空・重複
- Given 初期の費目
- When `category-name` を空のまま `category-add` を押す。続けて「食料品」と入れて `category-add` を押す
- Then どちらも `sdk-toast` が出て、`category-edit` の数は9のまま
### AC-16: 費目を削除する
- Given AC-01 のCSVを読み込んだ状態
- When データ画面で食料品の `category-delete` を押し、`sdk-confirm-ok` を押して、`tab-list` を押す
- Then 「セブン-イレブン」の `tx-category` に その他。データ画面の `category-edit` の数は8

## 決定事項
- D1: 同じファイル名のCSVを読み込んだら置き換える（Q1）
- D2: 費目は初期の9つに加え、自分で追加・改名できる（Q2）
- D3: 節約ポイントには、仮定を明記した目安額とその合計を出す（Q3）
- D4: 明細0件のときはサンプルを出さず、読み込みの案内だけを出す（Q4）
- D5: 費目は削除もできる。削除した費目の明細は自動分類に戻し、行き先がなければ「その他」にする。「その他」は削除できない（Q5）

## 未決事項
- 費目名の不正入力：仮に、空（空白だけを含む）と既存の名前との重複は追加・改名せず `ui.toast` で知らせる。20文字を超える分は切り捨てる
- 費目数の上限：仮に全部で12。超えて追加しようとしたら `ui.toast` で知らせる。色を見分けられる数に抑えるため
