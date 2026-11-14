# PWAランチャー 設計

> `platform/` を素の ES Modules で書き、ビルドスクリプトが検証と `dist/`（公開物）の生成だけを行う。フレームワークなし。
> データは IndexedDB の1ストアに「アプリID/キー」で保存する。SDK の各機能は、判断ロジック（純粋関数）とブラウザ API の呼び出しを分ける。
> 純粋関数は Vitest、画面とブラウザ API は Playwright（WebKit）の E2E で確認する。

## モジュール構成
```
platform/
  index.html, launcher/launcher.js   一覧の描画、設定パネル、エクスポート／インポートの操作
  launcher/backup.js                 純粋：バックアップ JSON の組み立て・検証・Blob⇔dataURL 変換
  manifest.webmanifest, icons/       ホーム画面用（180px / 512px）
  sw.js                              Service Worker。precache.js（生成物）を importScripts する
  sdk/sdk.js                         入口。mountApp と storage / ui / notify / camera を再エクスポート
  sdk/storage.js                     createStorage(appId, backend)。backend は IndexedDB とメモリ（テスト用）
  sdk/ui.js, sdk/sdk.css             toast / confirm、ヘッダー、共通スタイル（CSS 変数、ダーク対応）
  sdk/notify.js                      純粋：channel(permission, supported) → 'os' | 'ask' | 'toast'。send は SW 経由で表示
  sdk/camera.js                      純粋：fitSize(w, h, max)。takePhoto は input[type=file] ＋ canvas 縮小
  sdk/README.md                      ミニアプリ作者（人間・AI）向けの API 一覧と使用例
  apps/demo/                         manifest.json, index.html, main.js
  scripts/manifest.ts                純粋：validateManifest(json, folder, files) → エラー文の配列
  scripts/build.ts                   全 manifest を検証 → dist/ へコピー → apps.json と precache.js を生成
  tests/unit/, tests/e2e/, playwright.config.ts
.github/workflows/deploy.yml         push → build（検証）→ 単体 → E2E → dist/ を Pages へ公開
```
- `npm run check:platform` が build・単体・E2E を順に実行する。CI も同じコマンドを使う
- E2E は `dist/` を配信して行う（公開物そのものを検査する）。サーバーは `harness/template/serve.mjs` を共用する
- 評価課題のワークスペースには `sdk/` だけをコピーする。SW やランチャーがなくても `mountApp` は失敗しない

## データモデル
- IndexedDB：DB 名 `pwa-sdd`、ストア `kv`。キーは `"<appId>/<key>"`（例 `demo/memo`）、値は構造化複製。Blob は `{ __blob, type, data: ArrayBuffer }` に変換して保存し、読むときに戻す（WebKit は環境により Blob を直接保存できない）
  - `keys()` と全件取得は、接頭辞 `"<appId>/"` の範囲検索で行う
  - appId は `location.pathname` の `/apps/<id>/` から取る。取れないとき（ランチャー）は `mountApp` 以外の storage 利用を例外にする
- バックアップ JSON：`{ "format": "pwa-backup", "version": 1, "exportedAt": "ISO日時", "apps": { "demo": { "memo": "牛乳", "photo": { "$blob": "data:image/jpeg;base64,…" } } } }`
  - Blob は値のどの深さにあっても `{ "$blob": dataURL }` に変換する。`format` / `version` / `apps` の形が違えば不正として拒否する
  - インポートは、ファイルにある appId の全キーを削除してから書き込む（1トランザクション）
- `dist/apps.json`：`[{ "id", "name", "icon", "description" }]`（名前順）
- `dist/precache.js`：`self.__PRECACHE = { version: "<全ファイル内容のハッシュ先頭7桁>", files: ["index.html", …] }`
  - 内容が変わると precache.js が変わり、ブラウザが SW の更新を検知する。`app-version` はこの version を表示する
- Service Worker：install で files を `pwa-<version>` キャッシュへ全件取得。`skipWaiting` しない（次回起動で切り替わる）。activate で古いキャッシュを消す。fetch は同一オリジンの GET をキャッシュ優先、なければネットワーク、それも失敗した画面遷移はランチャーへリダイレクト

## 使用するSDK API
- platform 自身が SDK の提供元。ブラウザ API は次のものだけを使う：IndexedDB、Service Worker / Cache、Notification（`registration.showNotification`）、`input[type=file][capture]`、canvas、`prefers-color-scheme`
- ランチャーは `sdk/storage.js` の内部関数 `dumpAll()` / `restoreApps(apps)` を使う（ミニアプリには公開しない）
- 単体テストは Node 環境なので、IndexedDB を使う部分は E2E で確認し、ロジックはメモリ backend で確認する

## ACとテストの対応
| AC | 単体 | E2E |
|---|---|---|
| AC-01 | manifest.test: 正しい manifest は通る | launcher.spec |
| AC-02 | ― | launcher.spec |
| AC-03 | storage.test: set → get | demo.spec |
| AC-04 | storage.test: appId が違えば見えない | storage.spec（実 IndexedDB） |
| AC-05 | ― | offline.spec（WebKit で SW が使えない場合のみ Chromium で実行し、理由を改訂履歴に書く） |
| AC-06 | ― | demo.spec |
| AC-07 | notify.test: channel('denied') は 'toast' | demo.spec |
| AC-08 | camera.test: fitSize(3000, 2000, 1280) | demo.spec（ファイル選択で代用） |
| AC-09 | backup.test: 組み立てと Blob 変換 | backup.spec |
| AC-10 | backup.test: 往復で同じ値に戻る | backup.spec |
| AC-11 | backup.test: 不正な形を拒否 | backup.spec |
| AC-12 | ― | theme.spec（colorScheme: 'dark' で背景と文字の明度を比較） |
| AC-13 | manifest.test: name なしを検出 | build.spec（不正な fixture で build を実行し終了コードを見る） |
| AC-14 | ― | launcher.spec（manifest と apple-touch-icon を取得して確認） |
