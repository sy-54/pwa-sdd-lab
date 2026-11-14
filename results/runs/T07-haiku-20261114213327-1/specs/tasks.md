# 単語帳 タスク分解

> index.html に3画面の静的マークアップを置き、logic.js で純粋関数を実装。
> main.js で DOM・イベント・storage 呼び出しを統合する。
> テストは単体テスト（logic 関数）と E2E テスト（全 AC）で確認。

## タスク一覧

- [x] T01: index.html に一覧画面のマークアップ（入力・ボタン・カード一覧）を置く (setup)
- [x] T02: index.html に学習画面のマークアップ（表・裏・ボタン・進捗）を置く (setup)
- [x] T03: index.html に結果画面のマークアップを置く (setup)
- [x] T04: manifest.json を置く (setup)
- [x] T05: logic.js に addCard 関数を実装し、単体テストで AC-01 を確認 (AC-01)
- [x] T06: logic.js に deleteCard 関数を実装し、単体テストで AC-04 を確認 (AC-04)
- [x] T07: logic.js に processAnswer 関数を実装し、単体テストで AC-08, AC-09 を確認 (AC-08, AC-09)
- [x] T08: logic.js に getResult 関数を実装し、単体テストで AC-10, AC-11 を確認 (AC-10, AC-11)
- [x] T09: storage API を使ってカード復元・保存を実装 (setup)
- [x] T10: main.js で一覧画面初期化、カード追加・削除イベント実装 (AC-01, AC-04)
- [x] T11: 追加ボタンの有効・無効制御（表・裏入力値チェック）(AC-02, AC-03)
- [x] T12: 学習開始ボタンの有効・無効制御（カード数チェック）(AC-05)
- [x] T13: main.js で学習画面制御、めくる・判定ボタンイベント実装 (AC-06, AC-07, AC-08, AC-09)
- [x] T14: main.js で結果画面表示、一覧に戻るボタン実装 (AC-10, AC-11)
- [x] T15: 学習途中のアプリ再起動で一覧に戻る処理、再起動後カード復元 (AC-13, AC-12)
- [x] T16: 全 AC の E2E テスト（e2e/study.spec.ts）を書き、全て通す (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13)
