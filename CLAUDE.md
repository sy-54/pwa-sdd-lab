# pwa-sdd-lab

軽量SDDハーネス（主成果物）と、その題材である PWA ランチャー＋SDK。経緯と全体計画は `fable-kickoff.md`、期限後の改善手順は `docs/LOOP.md`。

## 構成
- `sdd/`：SDDスキル本体（`SKILL.md`、`phases/`、`templates/`）。`.claude/skills/sdd` からリンクしている
- `harness/`：`run.ts`（ランナー）、`template/`（実行用ワークスペースの雛形）、`stakeholder/`（要求者シミュレータ）、`lint/`、`grade/`（採点と集計）
- `platform/`：ランチャー、SDK、ミニアプリ。文書は `platform/specs/`
- `tasks/Txx-名前/`：評価課題。`requirements.md`（実行モデルに渡す）、`stakeholder.md` と `acceptance/`（隠し）
- `results/`：`runs/<実行ID>/result.json`、`summary.md`（自動生成）、`improvements.md`、`progress.md`

## コマンド
- `npm test`：ハーネスと platform の単体テスト
- `npm run lint:sdd -- <specsDir> --phase <spec|design|tasks|e2e|feedback> [--tests <e2eDir>]`
- `npm run harness -- --tasks T00,T01 --models sonnet,haiku --runs 2 --parallel 2`
- `npm run summary`：`results/summary.md` を再生成
- `npm run regrade -- T01`：隠しE2E を直した後、既存の実行を採点し直す

## 規約
- 機能追加は SDD フローで行う（`sdd/SKILL.md`）。spec・design・改訂履歴は人間（Shigeru）の承認を得てから次へ進む
- `sdd/` と `harness/template/` を変えたら、変更理由を `results/improvements.md` に1行で残し、影響する課題を再実行して確かめる
- 実行モデルに隠しファイル（`stakeholder.md`、`acceptance/`）の内容を渡さない。課題の requirements にも書かない
- ハーネスは作り込まない。採点は機械的に（隠しE2E、lint、コスト、手戻り）
- 文書・コミットメッセージは日本語。こまめにコミットする
