// results/runs/*/result.json を集計して results/summary.md を書く。
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { sddRev } from './grade.ts';

const REPO = join(import.meta.dirname, '../..');
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const runsDir = join(REPO, 'results/runs');
const results = (existsSync(runsDir) ? readdirSync(runsDir) : [])
  .map((d) => join(runsDir, d, 'result.json'))
  .filter(existsSync)
  .map((f) => JSON.parse(readFileSync(f, 'utf8')))
  .filter((r) => !r.invalid) // 利用上限などで無効になった実行は集計しない
  .sort((a, b) => a.id.localeCompare(b.id));

// 版（手順書・雛形・lint・ランナー・SDK のコミット）。古い実行には記録がないので、開始時刻（ID）から求める
const started = (r: any) => {
  const t = r.id.match(/-(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)-\d+$/);
  return new Date(Date.UTC(+t[1], +t[2] - 1, +t[3], +t[4], +t[5], +t[6]));
};
const revs = new Map<string, { date: string; subject: string }>();
for (const r of results) {
  const at = started(r);
  const v = sddRev(new Date(at.getTime() + 2 * 60_000)); // 開始直前のコミットを拾うための余裕
  r.rev ??= v.rev;
  r.at = at.getTime();
  if (r.rev === v.rev) revs.set(v.rev, v);
}
const byTime = (rs: any[]) => [...rs].sort((a, b) => a.at - b.at);
const cell = (rs: any[]) => (rs.length ? `${pct(avg(rs.map((r) => r.passRate)))}（${rs.length}）` : '―');
const revRows = [...revs.entries()]
  .sort(([, a], [, b]) => a.date.localeCompare(b.date))
  .map(([rev, v]) => {
    const rs = results.filter((r) => r.rev === rev);
    const tasks = [...new Set(rs.map((r) => r.task.slice(0, 3)))].join(' ');
    return `| ${rev} | ${v.date.slice(5, 16).replace('T', ' ')} | ${v.subject.slice(0, 40)} | ${tasks} | ${cell(rs.filter((r) => r.model === 'sonnet'))} | ${cell(rs.filter((r) => r.model === 'haiku'))} |`;
  });

const group = (key: (r: any) => string) => {
  const m = new Map<string, any[]>();
  for (const r of results) m.set(key(r), [...(m.get(key(r)) ?? []), r]);
  return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
};
const row = (name: string, rs: any[]) =>
  `| ${name} | ${rs.length} | ${pct(avg(rs.map((r) => r.passRate)))} | ${rs.filter((r) => r.passRate === 1).length}/${rs.length} | ${avg(rs.map((r) => r.lintErrors)).toFixed(1)} | ${avg(rs.map((r) => r.rework)).toFixed(1)} | $${avg(rs.map((r) => r.costUsd)).toFixed(2)} | ${avg(rs.map((r) => r.minutes)).toFixed(0)} |`;
const head = (first: string, extra = '') => `| ${first} | 実行数 | 隠しE2E通過率 | 全通過 | lintエラー | 手戻り | コスト/回 | 分/回 |${extra && ` ${extra} |`}\n|---|---|---|---|---|---|---|---|${extra && '---|'}`;
const trend = (rs: any[]) => byTime(rs).map((r, i, a) => (i && a[i - 1].rev !== r.rev ? '｜ ' : '') + `${r.acceptance.passed}/${r.acceptance.total}`).join(' ');

const notes = join(REPO, 'results/improvements.md');
const md = `# 評価サマリ

> 自動生成（\`npm run summary\`）。手で編集しない。改善の記録は results/improvements.md に書く。
> 通過率は隠しE2E（tasks/*/acceptance）の平均。全通過は隠しE2Eを100%通した実行の数。
> 実行数 ${results.length} 件、合計コスト $${results.reduce((s, r) => s + r.costUsd, 0).toFixed(2)}。

## モデル別
${head('モデル')}
${group((r) => r.model).map(([k, rs]) => row(k, rs)).join('\n')}

## 版別（改善の前後）
> 版は、手順書（sdd/）・雛形・lint・ランナー・SDK を最後に変えたコミット。数字は隠しE2E の平均通過率（実行数）。
> 版ごとに実行した課題が違うので、版どうしの平均は直接比べられない。同じ課題の前後は下の「推移」で見る。

| 版 | 日時 | 変更 | 実行した課題 | sonnet | haiku |
|---|---|---|---|---|---|
${revRows.join('\n')}

## 課題×モデル
> 推移は、古い順に並べた各実行の通過数。「｜」は版の変わり目。

${head('課題 / モデル', '推移')}
${group((r) => `${r.task} / ${r.model}`).map(([k, rs]) => `${row(k, rs)} ${trend(rs)} |`).join('\n')}

## 実行一覧
| ID | 隠しE2E | 落ちたテスト | lint | 手戻り | 未通過ゲート | コスト |
|---|---|---|---|---|---|---|
${results.map((r) => `| ${r.id} | ${r.acceptance.passed}/${r.acceptance.total} | ${r.acceptance.failed.join(' / ') || '―'} | ${r.lintErrors} | ${r.rework} | ${r.gatesFailed.join(', ') || '―'}${r.leaked ? ' ⚠隠しファイル参照' : ''} | $${r.costUsd.toFixed(2)} |`).join('\n')}

${existsSync(notes) ? readFileSync(notes, 'utf8') : ''}`;

writeFileSync(join(REPO, 'results/summary.md'), md);
console.log(`results/summary.md を更新（${results.length} 件）`);
