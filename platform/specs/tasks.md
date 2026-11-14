# PWAランチャー タスク

> 検証とビルド → SDK（保存・UI・通知・カメラ）→ demo → ランチャー → オフライン → 公開、の順に進める。
> 各タスクは1時間以内・1コミット。純粋関数は単体テストから書き、画面は該当 AC の E2E を同じタスクで書く。
> 完了条件は `npm run check:platform`（build・単体・E2E）の全件通過と、iPhone 実機での起動確認。

- [x] T01: scripts/manifest.ts の validateManifest を単体テストから作る (AC-01, AC-13)
- [x] T02: scripts/build.ts（検証 → dist/ コピー → apps.json / precache.js 生成）と build.spec、Playwright 設定、check:platform (AC-13)
- [ ] T03: sdk/storage.js の createStorage をメモリ backend の単体テストから作り、IndexedDB backend と storage.spec を足す (AC-03, AC-04)
- [ ] T04: sdk/ui.js と sdk.css（toast / confirm / ヘッダー / ダーク対応の CSS 変数）、sdk/sdk.js の mountApp (AC-02, AC-06, AC-12)
- [ ] T05: sdk/notify.js の channel を単体テストから作り、send を実装する (AC-07)
- [ ] T06: sdk/camera.js の fitSize を単体テストから作り、takePhoto を実装する (AC-08)
- [ ] T07: apps/demo（メモ保存・トースト・通知・写真）と demo.spec (AC-03, AC-06, AC-07, AC-08)
- [ ] T08: ランチャーの一覧・空表示・起動と戻る、manifest.webmanifest とアイコン、launcher.spec (AC-01, AC-02, AC-14)
- [ ] T09: launcher/backup.js を単体テストから作り、設定パネルのエクスポート／インポートと backup.spec (AC-09, AC-10, AC-11)
- [ ] T10: theme.spec でランチャーと demo のダーク表示を確認し、不足を直す (AC-12)
- [ ] T11: sw.js（precache・キャッシュ優先・次回起動で更新）と offline.spec (AC-05)
- [ ] T12: sdk/README.md（ミニアプリ作者向け API 一覧と使用例）を書く (setup)
- [ ] T13: 全 AC の E2E を通し、lint --phase e2e を OK にする (AC-01, AC-02, AC-03, AC-04, AC-05, AC-06, AC-07, AC-08, AC-09, AC-10, AC-11, AC-12, AC-13, AC-14)
- [ ] T14: .github/workflows/deploy.yml を書き、GitHub に push して Pages へ公開する (setup)
- [ ] T15: iPhone のホーム画面に追加し、demo の保存・通知・カメラを実機で確認する (setup)
