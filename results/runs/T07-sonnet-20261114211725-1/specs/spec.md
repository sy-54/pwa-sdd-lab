# 単語帳 外部仕様

> 一覧画面でカード（表・裏）を追加・削除し、学習画面で1枚ずつめくって「覚えた／まだ」を付ける。「まだ」は同じ回の最後尾に回り、覚えるまで繰り返す。
> 保存するのはカード一覧（表・裏・追加順）だけ。学習の進行状態は保存せず、閉じて開き直すと常に一覧に戻る。
> 未決事項なし。レビューしてほしい点：「1回で覚えた枚数」の数え方（Q3の繰り返し順と合わせて AC-08 で確認）。

## 画面と操作
- エントリ：`apps/flashcards/index.html`（`manifest.json` も置く）、ルート要素：`data-testid="app-root"`
- 一覧画面（既定で表示）
  - 入力 `card-front-input`、`card-back-input`
  - 追加ボタン `add-card`：常に有効
  - 学習開始ボタン `study-start`：カードが0枚のとき disabled
  - カード一覧：追加順（古い順）に `card-item` を並べる。各 `card-item` の中に `card-front`、`card-back`、`card-delete`
- 学習画面 `study-view`（学習中だけ表示。一覧画面は隠れる）
  - 表 `study-front`、裏 `study-back`（めくるまで非表示）
  - `flip`（裏を表示）、`know`（覚えた）、`again`（まだ）
  - 進み具合 `study-progress`：`覚えた枚数/全体の枚数`（例 `2/5`）
- 結果画面 `study-result`（学習が終わったときだけ表示。`study-view` は隠れる）
  - `result-known`（1回で覚えた枚数。数字のみ）
  - `study-finish`：一覧画面へ戻る

## 振る舞い
- 初期状態：カード0枚、一覧画面を表示。
- カード追加：`card-front-input`／`card-back-input` の前後の空白を除いた値を使う。両方が空でなければ、入力した表裏で `card-item` を一覧の最後尾に追加し、両入力欄を空にする。
- カード削除：`card-delete` を押すと確認なしでそのカードを即削除する。
- 学習開始：`card-item` が1件以上あるときのみ押せる。押すと、その時点の一覧を追加順のまま「学習キュー」としてコピーし、先頭のカードを表にして `study-view` を表示する（`study-back` は非表示）。
- めくる：`flip` を押すと、表示中のカードの `study-back` が見えるようになる。
- 覚えた（`know`）：表示中のカードを学習キューから完全に除く。そのカードが今回の学習で一度も「まだ」にされていなければ「1回で覚えた枚数」を1増やす。次のカードを表示し、`study-back` は非表示に戻す。
- まだ（`again`）：表示中のカードを「まだにした」と記録し、学習キューの最後尾へ回す。次のカードを表示し、`study-back` は非表示に戻す。
- `flip` せずに `know`／`again` を押すこともできる（裏を見たかどうかで押せる操作は変えない）。
- `study-progress` の「覚えた枚数」は、学習キューから完全に除かれたカードの数。「全体の枚数」は学習開始時のカード枚数（固定。繰り返しても変わらない）。
- 学習キューが空になったら `study-view` を隠し `study-result` を表示する。`result-known` に「1回で覚えた枚数」を表示する。
- `study-finish` を押すと `study-result` を隠し、一覧画面に戻る（カード一覧はそのまま）。
- 保存：カード一覧（表・裏・追加順）だけを保存する。学習の進行状態（学習キュー、覚えた枚数など）は保存しない。アプリを閉じて開き直す、またはページを再読み込みすると、常に一覧画面に戻り、学習中だった内容は失われる。

## エラー時の挙動
- 追加時に表または裏が空（空白のみを含む）：追加されない。入力欄の内容は保持し、エラーメッセージは出さない。
- 保存されているカード一覧の形式が不正（配列でない、要素に表・裏の文字列がない等）：空の一覧として扱う（保存は壊さず、次に正しく追加・削除すれば直る）。
- オフライン：アプリは外部通信を行わないため、オフラインでも挙動は変わらない。

## 受け入れ条件
### AC-01: 初期状態は空の一覧
- Given 保存データがない状態
- When アプリを開く
- Then `card-item` が0件、`study-start` に `disabled` 属性がある

### AC-02: カードを追加できる
- Given 一覧が空
- When `card-front-input` に `apple`、`card-back-input` に `りんご` を入力し `add-card` を押す
- Then `card-item` が1件になり、その `card-front` に `apple`、`card-back` に `りんご` が表示され、両入力欄は空になる

### AC-03: 片方が空だと追加されない
- Given `card-front-input` が空、`card-back-input` に `りんご` を入力
- When `add-card` を押す
- Then `card-item` は0件のまま

### AC-04: カードを削除できる
- Given `card-item` が1件
- When その `card-delete` を押す
- Then `card-item` が0件になる

### AC-05: 0枚のときは学習を始められない
- Given `card-item` が0件
- When 一覧画面を表示する
- Then `study-start` に `disabled` 属性がある

### AC-06: 学習でめくって裏を見る
- Given `card-item` が2件（`apple`/`りんご`、`dog`/`いぬ`）
- When `study-start` を押し、`flip` を押す
- Then `study-view` が表示され、`study-front` は `apple`、`study-back` は `りんご`

### AC-07: 覚えたら次のカードへ進む
- Given 学習中（2枚中、1枚目 `apple`/`りんご` を表示中）
- When `know` を押す
- Then `study-progress` が `1/2` になり、`study-front` が `dog` になり、`study-back` は非表示に戻る

### AC-08: まだにしたカードは最後尾に回り、1回で覚えた枚数に数えない
- Given `card-item` が2件（`a`/`1`、`b`/`2`）で学習開始
- When 1枚目（`a`）で `again`、次の `b` で `know`、最後に回ってきた `a` で `know` を押す
- Then `study-progress` は `2/2` になり `study-result` が表示され、`result-known` は `1`（`b` のみ1回で覚えた）

### AC-09: 結果から一覧に戻ってもカードは残る
- Given `study-result` が表示されている
- When `study-finish` を押す
- Then `study-view` と `study-result` は隠れ、一覧画面に戻り `card-item` の件数は変わらない

### AC-10: 再読み込みしてもカードが残る
- Given `card-item` を1件追加済み
- When ページを再読み込みする
- Then `card-item` が1件残っており、一覧画面が表示される（`study-view` は非表示）

## 決定事項
- D1: 表裏どちらかが空（空白のみ含む）なら `add-card` を押しても追加しない。ボタンは無効化せず、エラーメッセージも出さない（Q1）。
- D2: `card-item` が0件のとき `study-start` は `disabled` にする。メッセージは出さない（Q2）。
- D3: 「まだ」にしたカードは追加順を保ったまま、その回の最後尾に回して繰り返す（Q3）。
- D4: `card-delete` は確認なしで即削除する（Q4）。
- D5: 学習の進行状態は保存しない。閉じて開き直す（再読み込み含む）と常に一覧画面に戻る。保存するのはカード一覧（表・裏・追加順）だけ（Q5）。

## 未決事項
- なし
