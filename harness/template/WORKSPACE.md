# 作業環境の規約

このディレクトリで、`specs/requirements.md` に書かれたミニアプリを軽量SDDで作る。手順は `sdd/SKILL.md` と `sdd/phases/` にある。

## 配置
- `specs/`：requirements.md / spec.md / design.md / tasks.md（自動実行時は questions.md / qa.md も）
- `apps/<id>/`：アプリ本体。エントリは `apps/<id>/index.html`。**ビルドなしの静的ファイル**（HTML / CSS / ES Modules の `.js`）
- `tests/unit/*.test.js`：単体テスト（Vitest、Node 環境。DOM はない）
- `tests/e2e/*.spec.ts`：E2E（Playwright WebKit）。`page.goto('/apps/<id>/')` で開く
- `sdk/`：共通SDK（ある場合）。使い方は `sdk/README.md`

## コマンド
- 単体テスト：`npm test`
- E2E：`npm run e2e`（サーバーは自動で起動する）
- lint：`npm run lint:sdd -- --phase spec`（phase は spec / design / tasks / e2e / feedback）

## 制約
- 依存パッケージを追加しない（`npm install` 禁止）。フレームワーク、バンドラ、CDN、外部通信を使わない
- `package.json`、設定ファイル、`sdd/`、`tools/`、`sdk/`、`serve.mjs` を変更しない
- 作業はこのディレクトリの中だけで行う
- 文書とコミットメッセージは日本語
