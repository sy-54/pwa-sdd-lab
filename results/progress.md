# 進捗

## M0　SDDスキル v0（11/14 完了）
- `sdd/`（SKILL.md、手順書6本、雛形4本）と `harness/lint/` を作成。
- lint は行数上限・3行サマリ・必須セクション・AC追跡（spec→design→tasks→E2E）を検査する。
- 合格サンプル（fixtures/good）と不合格サンプル（fixtures/bad）を正しく判定。単体テスト26件が通過。

## M1　ハーネス v0（11/14 完了）
- `harness/run.ts` が課題×モデルを独立ディレクトリ（リポジトリ外）で SDD の6フェーズ順に実行し、各ゲート（lint・テスト）で最大2回まで手戻りさせる。
- SPEC の壁打ちは要求者シミュレータ（Sonnet、`stakeholder.md` のみ参照、ツールなし）が回答する。
- 採点は隠しE2E通過率・lint・手戻り回数・コスト・隠しファイル参照の有無。正解実装 7/7、確認ダイアログ付き実装 5/7 で採点の妥当性を確認。
- T00（カウンタ）を Sonnet で完走：隠しE2E 7/7、lint 0件、手戻り 0、$1.35、5.5分。

## M2　platform を SDD で開発（11/14 実装・公開まで完了、実機確認待ち）
- spec（AC-01〜14）と design を Shigeru が承認。T01〜T14 を TDD・1タスク1コミットで実装（単体41件、E2E 29件）。
- SDK は `mountApp` / `storage` / `ui` / `notify` / `camera`。ランチャーは一覧・設定（エクスポート／インポート）・オフライン起動・ダークモード。
- GitHub Actions で検証後に https://sy-54.github.io/pwa-sdd-lab/ へ公開。公開サイトに対しても E2E 20件が通過。
- 残り：T15（iPhone 実機でホーム画面追加と demo の確認、未決 U1 の OS 通知）と、改訂履歴の承認。
- 開発中の気づき5件を `sdd/` に反映（`results/improvements.md`）。
