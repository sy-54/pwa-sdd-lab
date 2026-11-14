# ミニアプリ SDK

ミニアプリは `apps/<id>/` に置く、ビルドなしの静的ファイル。SDK は ES Module として相対パスで読み込む。

## 最小構成
`apps/<id>/manifest.json`（`id` はフォルダ名と同じ。英小文字・数字・ハイフン）
```json
{ "id": "todo", "name": "ToDo", "icon": "✅", "description": "やることリスト" }
```
`apps/<id>/index.html`
```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <title>ToDo</title>
    <link rel="stylesheet" href="../../sdk/sdk.css" />
  </head>
  <body>
    <main data-testid="app-root">
      <!-- 画面 -->
    </main>
    <script type="module" src="main.js"></script>
  </body>
</html>
```
`apps/<id>/main.js`
```js
import { mountApp, storage, ui, notify, camera } from '../../sdk/sdk.js';
import { addItem } from './logic.js'; // ロジックは DOM に触れない別ファイルにして単体テストする

mountApp({ title: 'ToDo' }); // 最初に1度呼ぶ。ヘッダー（ホームへ戻る）と共通スタイルが入る
let items = await storage.get('items', []);
```

## API
| 呼び出し | 戻り値 | 説明 |
|---|---|---|
| `mountApp({ title })` | `{ appId }` | 起動時に1度。ヘッダー `sdk-header`／`sdk-home` を body 先頭に挿入 |
| `await storage.get(key, 既定値)` | 保存値／既定値（省略時 `null`） | このアプリの領域から読む |
| `await storage.set(key, value)` | ― | 書く。value は JSON にできる値か Blob。失敗時は例外 |
| `await storage.remove(key)` | ― | 消す |
| `await storage.keys()` | `string[]` | このアプリのキー一覧 |
| `ui.toast(文言)` | ― | 画面下に3秒表示（`sdk-toast`）。同時に1つ |
| `await ui.confirm(文言, { ok, cancel })` | `boolean` | 確認ダイアログ（`sdk-confirm-ok`／`sdk-confirm-cancel`） |
| `await notify.send(タイトル, 本文)` | `'os'`／`'toast'` | OS 通知。出せなければトーストで代替。例外は投げない |
| `await camera.takePhoto({ maxSize })` | `Blob`／`null` | カメラを開き、長辺 `maxSize`（既定 1280）以下の JPEG を返す。キャンセルは `null`。画像でなければ例外 |

## 決まりごと
- **保存は `storage` を使う。** `localStorage` は使わない（アプリ間で混ざる。エクスポートにも含まれない）。データはアプリごとに分かれている
- `storage` は非同期。`get` した配列やオブジェクトを書き換えただけでは保存されない。変更のたびに `set` する
- 1つのキーに「アプリの状態まるごと」を入れると単純になる（例：`items` に配列）。壊れた値に備え、読んだ後に形を確かめる
- 確認は `ui.confirm` を使う。`window.confirm`／`alert` は使わない（ホーム画面の PWA で不安定。E2E でも押せない）
- `notify.send` と `camera.takePhoto` は、ボタンを押したときの処理の中から呼ぶ（iOS の制約）
- 通知は、アプリを開いている間にだけ出せる。時刻指定や、閉じている間の通知はできない
- 写真は Blob のまま `storage.set` し、表示は `img.src = URL.createObjectURL(blob)`
- リンクや import はすべて相対パス（サブパスで公開されるため。`/` で始めない）

## 見た目（sdk.css）
- `button`、`input`、`textarea`、`select`、`ul > li`、`label` は何も指定しなくても整う。ライト／ダークは自動
- クラス：`button.secondary`（控えめ）、`button.danger`（削除）、`.card`（囲み）、`.row`（横並び。伸ばす子に `.grow`）、`.muted`（補足文字）、`.big`（大きな数字）
- 色を足すときは変数を使う：`var(--bg)` `var(--card)` `var(--fg)` `var(--muted)` `var(--border)` `var(--accent)` `var(--danger)`。色を直書きするとダークモードで読めなくなる
- 要素を隠すときは `hidden` 属性を使う

## テスト
- 単体テスト（Vitest、Node 環境）では SDK を import しない。ロジックを純粋関数に分けてテストする
- E2E（Playwright）は `page.goto('/apps/<id>/')`。保存データはテストごとに空から始まる
- カメラの E2E：`const chooser = page.waitForEvent('filechooser'); await 撮影ボタン.click(); await (await chooser).setFiles(画像ファイル)`
- 通知の E2E：テスト環境では OS 通知は出せず、常にトースト（`sdk-toast`）になる
