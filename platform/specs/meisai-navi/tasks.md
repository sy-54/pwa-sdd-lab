# 明細節約ナビ タスク

> 土台 → ロジック（表示形式・CSV・分類・状態・費目・節約ポイント）→ 画面の結線 → 全 AC の E2E → 実機確認、の順に進める。
> 各タスクは1時間以内・1コミット。ロジックは単体テストから書く。環境に左右される Shift_JIS の読み込みは T03 で先に確かめる。
> 完了条件は `npm run check:platform`（build・単体・E2E）の全件通過と、実物の楽天CSVを使った iPhone 実機での確認。

- [x] T01: apps/meisai-navi の manifest.json・index.html（4画面の枠とUI契約の data-testid）・style.css を置き、build の manifest 検証を通す (setup)
- [x] T02: format.js の yen／share／monthLabel を単体テストから作る (AC-01, AC-02)
- [x] T03: csv.js の parseCsv／readStatement／decodeText を単体テストから作る。Shift_JIS のバイト列を読めることを確かめる (AC-01, AC-12, AC-13)
- [x] T04: classify.js の normalize／shopKey／autoClassify とキーワード表を単体テストから作る (AC-02)
- [x] T05: model.js の initialState／repairState／putFile／removeFile／setRule／resolveRows／summarize を単体テストから作る (AC-02, AC-03, AC-05, AC-06, AC-07, AC-08)
- [ ] T06: model.js の addCategory／renameCategory／deleteCategory を単体テストから作る (AC-10, AC-11, AC-15, AC-16)
- [ ] T07: tips.js の buildTips を単体テストから作る (AC-04)
- [ ] T08: main.js でデータ画面（読み込み・ファイル削除・すべて消す・費目の編集）と保存・復元をつなぐ (AC-01, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-15, AC-16)
- [ ] T09: main.js で内訳・節約・明細（期間の切り替え、検索、しぼり込み、店ごとの費目修正）をつなぐ (AC-02, AC-03, AC-04, AC-05, AC-14)
- [ ] T10: 全 AC の E2E を書いて通し、lint --phase e2e を OK にする (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14, AC-15, AC-16)
- [ ] T11: マージ後、iPhone のホーム画面から起動し、楽天e-NAVIの実物CSVを読み込んで確認する（人間の作業） (setup)
