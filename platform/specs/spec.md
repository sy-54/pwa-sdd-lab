# PWAランチャー 外部仕様

> ランチャー（一覧・設定）と、各ミニアプリが読み込む共通SDK（保存・UI・通知・カメラ）の2つで構成する。
> ミニアプリは `apps/<id>/` に manifest.json と index.html を置くだけ。push すると検証→E2E→GitHub Pages 公開まで自動で進む。
> 未決事項は1件（U1：OS通知の実機挙動）。レビューでは「決定事項」と SDK の API 形（振る舞い節）を見てほしい。

## 画面と操作
### ランチャー（サイトのルート）
- アプリ一覧 `app-list`：アプリごとにタイル `app-tile-<id>`（アイコンと名前）。並びは名前順。タップで `apps/<id>/` へページ遷移する
- アプリが0件のときは `app-empty` に「アプリがありません」と表示する
- 設定ボタン `settings-open` で設定パネル `settings-panel` を開く。中に次の3つを置く
  - `export-data`：全アプリのデータを1つの JSON ファイル（`pwa-backup-YYYYMMDD.json`）としてダウンロードする
  - `import-data`（ファイル選択）：JSON を選ぶと確認ダイアログの後、データを取り込む
  - `app-version`：公開中のバージョン（ビルドごとに変わる識別子）
### ミニアプリ（`apps/<id>/index.html`）
- ルート要素は `app-root`。SDK の `mountApp()` を呼ぶと、画面上部にヘッダー `sdk-header`（アプリ名と、ランチャーへ戻る `sdk-home`）が入る
- 同梱アプリ `demo`（SDKデモ）：実機確認用。メモの保存、トースト、通知、写真撮影を1画面で試せる
  - `demo-memo`（入力）と `demo-save`、`demo-toast`、`demo-notify`、`demo-photo`（撮影）、撮った写真 `demo-photo-img`

## 振る舞い
### ミニアプリの追加
- `apps/<id>/manifest.json`：`{ "id": "<フォルダ名と同じ>", "name": "1〜20文字", "icon": "絵文字1つ", "description": "任意" }`。`id` は英小文字・数字・ハイフンのみ
- 一覧（`apps.json`）は manifest から自動生成する。手で編集しない
- main へ push すると「manifest 検証 → 単体テスト → E2E → 公開」の順に進み、どれかが失敗すると公開されない
### SDK（`sdk/sdk.js` を ES Module として読み込む。API の詳細は `sdk/README.md`）
- `mountApp({ title })`：ヘッダーの挿入、共通スタイルとテーマの適用、Service Worker の登録
- 保存 `storage`：`get(key, 既定値)` / `set(key, value)` / `remove(key)` / `keys()`。すべて非同期。値は JSON にできるものと Blob（写真）
  - アプリ ID（URL の `apps/<id>/` から決まる）ごとに領域が分かれ、他のアプリのデータは読めない
- UI部品 `ui`：`toast(文言)`（`sdk-toast`、3秒で消える）、`confirm(文言)`（`sdk-confirm-ok` / `sdk-confirm-cancel`、結果を true / false で返す）。ボタン・入力・リストは共通 CSS で整う
- 通知 `notify.send(タイトル, 本文)`：OS 通知を出す。初回は許可を求める。出せないときはトーストで代替する。どちらで出したかを `'os'` / `'toast'` で返す
  - アプリを開いている間（裏に回した直後を含む）だけ使える。時刻指定や、閉じている間の通知はできない
- カメラ `camera.takePhoto({ maxSize })`：カメラ（または写真の選択）を開き、長辺 `maxSize`（既定 1280px）以下の JPEG を Blob で返す。キャンセル時は `null`
### オフラインと更新
- 一度オンラインで開けば、以後はオフラインでもランチャーと全ミニアプリが起動する
- 新しい版が公開されると、次にオンラインで開いたときに裏で取得し、**その次の起動**から反映する（使用中に勝手に再読み込みしない）
### エクスポート／インポート
- エクスポートは全アプリのデータを含む。写真（Blob）も含める
- インポートは**ファイルに含まれるアプリのデータを丸ごと置き換える**。ファイルにないアプリのデータは変えない
### テーマ
- OS のライト／ダーク設定に従う。アプリ内の切り替えは設けない

## エラー時の挙動
- manifest が不正（必須項目の欠落、id とフォルダ名の不一致、`index.html` がない、`app-root` がない）：検証が失敗し、対象アプリと理由を表示する。公開は行わない
- 通知が拒否された、または未対応：`notify.send` はトーストで代替し `'toast'` を返す。エラーにはしない
- 写真の読み込みに失敗（画像でないファイルなど）：`takePhoto` は例外を投げる。アプリ側でトースト表示する
- 保存に失敗（容量超過など）：`storage.set` は例外を投げる。SDK は握りつぶさない
- インポートするファイルが不正（JSON でない、形式が違う）：トーストで「読み込めないファイルです」と表示し、既存データは変えない
- オフラインで未取得のページを開いた：ランチャーへ戻す

## 受け入れ条件
### AC-01: 一覧に表示される
- Given `apps/demo/` に正しい manifest がある
- When ランチャーを開く
- Then `app-tile-demo` に manifest の名前とアイコンが表示される

### AC-02: 起動して戻る
- Given ランチャーを開いている
- When `app-tile-demo` をタップし、続けて `sdk-home` をタップする
- Then タップ後に `app-root` と `sdk-header` が表示され、戻った後に `app-list` が表示される

### AC-03: 保存したデータが残る
- Given demo で `demo-memo` に「牛乳」と入力し `demo-save` を押した
- When 再読み込みする
- Then `demo-memo` の値は「牛乳」

### AC-04: アプリごとにデータが分かれる
- Given アプリ a が `storage.set('k', 1)` を実行した
- When アプリ b が `storage.get('k', 'なし')` を実行する
- Then 結果は「なし」

### AC-05: オフラインで起動する
- Given オンラインでランチャーを一度開いた
- When オフラインにしてランチャーを再読み込みし、`app-tile-demo` をタップする
- Then `app-list` が表示され、遷移後に `app-root` が表示される

### AC-06: トースト
- Given demo を開いている
- When `demo-toast` を押す
- Then `sdk-toast` が表示され、3秒後に消える

### AC-07: 通知が出せないときはトーストで代替する
- Given 通知が許可されていない
- When `demo-notify` を押す
- Then `sdk-toast` に通知の本文が表示される

### AC-08: 写真を撮って表示する
- Given demo を開いている
- When `demo-photo` で長辺 3000px の画像を選ぶ
- Then `demo-photo-img` に長辺 1280px 以下の画像が表示され、再読み込み後も表示される

### AC-09: エクスポート
- Given demo に「牛乳」を保存した
- When `settings-open` → `export-data` を押す
- Then `pwa-backup-` で始まる JSON がダウンロードされ、中に demo の「牛乳」が含まれる

### AC-10: インポート
- Given AC-09 のファイルがあり、端末のデータは空
- When `import-data` でそのファイルを選び、`sdk-confirm-ok` を押す
- Then demo を開くと `demo-memo` の値は「牛乳」

### AC-11: 不正なファイルのインポート
- Given demo に「牛乳」を保存した
- When `import-data` で JSON でないファイルを選ぶ
- Then `sdk-toast` に「読み込めないファイルです」と表示され、demo の `demo-memo` は「牛乳」のまま

### AC-12: ダークモード
- Given OS がダーク設定
- When ランチャーと demo を開く
- Then どちらも背景が暗色、文字が明色で表示される

### AC-13: 不正な manifest は公開前に止まる
- Given `name` のない manifest を持つアプリがある
- When manifest 検証を実行する
- Then 終了コードが 0 以外になり、そのアプリの id と「name」が出力される

### AC-14: ホーム画面に追加できる
- Given 公開されたランチャー
- When Web App Manifest を取得する
- Then `display` が `standalone`、`start_url` と 180px 以上のアイコンがあり、HTML に apple-touch-icon がある

## 決定事項
- D1: デプロイ先は GitHub Pages（公開リポジトリ sy-54/pwa-sdd-lab）。GitHub Actions で検証後に公開する（Q1）
- D2: 通知は「アプリ内トースト＋起動中の OS 通知」。時刻指定・バックグラウンド通知はやらない（Q2）
- D3: 起動はページ遷移。戻る手段は SDK のヘッダーが提供する（Q3）
- D4: Should は両方入れる。ダークモードは OS 追従のみ、エクスポート／インポートは全アプリ一括の JSON（Q4）
- D5: サブパス（`/pwa-sdd-lab/`）で公開されるため、URL はすべて相対パスにする
- D6: ミニアプリはビルドなしの静的ファイル。SDK も素の ES Modules（JavaScript）で提供する

## 未決事項
- U1: iOS のホーム画面 PWA で、サーバーなしの OS 通知（`showNotification`）が実際に表示されるか。仮：表示できなければトースト代替のまま M2 を完了とし、結果を改訂履歴に書く
