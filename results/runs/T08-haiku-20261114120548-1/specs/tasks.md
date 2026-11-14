# 読書記録 タスク分解

> index.html の完全なマークアップから始め、logic と ui で役割分離、main で結線。
> カメラ機能の早期検証を含め、全 AC を単体テスト→E2E で確認。
> 各タスクは 1 コミット。

- [x] T01: index.html 静的マークアップ (setup)
- [x] T02: manifest.json (setup)
- [x] T03: logic.js - 本の追加・編集・削除・絞り込み機能（テストから Red→Green） (AC-01, AC-02, AC-05, AC-06)
- [x] T04: ui.js - DOM 更新（一覧表示、フォーム表示・非表示）(AC-01, AC-02)
- [x] T05: main.js - 初期化・イベント設定・ストレージ連携 (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-09)
- [x] T06: フォーム状態に応じた評価・感想の表示・非表示 (AC-03, AC-04)
- [x] T07: カメラ機能と写真保存（SDK camera.takePicture 確認） (AC-07, AC-08)
- [x] T08: 削除確認ダイアログの実装 (AC-05)
- [x] T09: E2E テスト全 AC（追加→編集→削除→絞り込み→写真→リロード） (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09)
