// results/runs/*/result.json を集計して results/summary.md を書く。
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO = join(import.meta.dirname, '../..');
const runsDir = join(REPO, 'results/runs');
const results = (existsSync(runsDir) ? readdirSync(runsDir) : [])
  .map((d) => join(runsDir, d, 'result.json'))
  .filter(existsSync)
  .map((f) => JSON.parse(readFileSync(f, 'utf8')))
  .filter((r) => !r.invalid) // 利用上限などで無効になった実行は集計しない
  .sort((a, b) => a.id.localeCompare(b.id));

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const group = (key: (r: any) => string) => {
  const m = new Map<string, any[]>();
  for (const r of results) m.set(key(r), [...(m.get(key(r)) ?? []), r]);
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
};
const row = (name: string, rs: any[]) =>
  `| ${name} | ${rs.length} | ${pct(avg(rs.map((r) => r.passRate)))} | ${rs.filter((r) => r.passRate === 1).length}/${rs.length} | ${avg(rs.map((r) => r.lintErrors)).toFixed(1)} | ${avg(rs.map((r) => r.rework)).toFixed(1)} | $${avg(rs.map((r) => r.costUsd)).toFixed(2)} | ${avg(rs.map((r) => r.minutes)).toFixed(0)} |`;
const head = (first: string) => `| ${first} | 実行数 | 隠しE2E通過率 | 全通過 | lintエラー | 手戻り | コスト/回 | 分/回 |\n|---|---|---|---|---|---|---|---|`;

const notes = join(REPO, 'results/improvements.md');
const md = `# 評価サマリ

> 自動生成（\`npm run summary\`）。手で編集しない。改善の記録は results/improvements.md に書く。
> 通過率は隠しE2E（tasks/*/acceptance）の平均。全通過は隠しE2Eを100%通した実行の数。
> 実行数 ${results.length} 件、合計コスト $${results.reduce((s, r) => s + r.costUsd, 0).toFixed(2)}。

## モデル別
${head('モデル')}
${group((r) => r.model).map(([k, rs]) => row(k, rs)).join('\n')}

## 課題×モデル
${head('課題 / モデル')}
${group((r) => `${r.task} / ${r.model}`).map(([k, rs]) => row(k, rs)).join('\n')}

## 実行一覧
| ID | 隠しE2E | 落ちたテスト | lint | 手戻り | 未通過ゲート | コスト |
|---|---|---|---|---|---|---|
${results.map((r) => `| ${r.id} | ${r.acceptance.passed}/${r.acceptance.total} | ${r.acceptance.failed.join(' / ') || '―'} | ${r.lintErrors} | ${r.rework} | ${r.gatesFailed.join(', ') || '―'}${r.leaked ? ' ⚠隠しファイル参照' : ''} | $${r.costUsd.toFixed(2)} |`).join('\n')}

${existsSync(notes) ? readFileSync(notes, 'utf8') : ''}`;

writeFileSync(join(REPO, 'results/summary.md'), md);
console.log(`results/summary.md を更新（${results.length} 件）`);
