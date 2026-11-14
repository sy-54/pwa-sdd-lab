// 既存の実行を、いまの隠しE2E で採点し直す（テストを直した後に使う）。
// 使い方: npm run regrade -- T01            （課題 T01 の全実行）
//         npm run regrade -- T01-sonnet-20261114011104-1
import { existsSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO, runAcceptance } from './grade.ts';

const runs = join(REPO, 'results/runs');
const targets = process.argv.slice(2);
for (const id of readdirSync(runs).filter((d) => targets.some((t) => d === t || d.startsWith(t + '-')))) {
  const file = join(runs, id, 'result.json');
  if (!existsSync(file)) continue;
  const r = JSON.parse(readFileSync(file, 'utf8'));
  if (r.invalid) continue;
  const before = `${r.acceptance.passed}/${r.acceptance.total}`;
  r.acceptance = await runAcceptance(join(REPO, 'tasks', r.task), join(runs, id, 'work'), join(runs, id));
  r.passRate = r.acceptance.total ? r.acceptance.passed / r.acceptance.total : 0;
  r.regradedAt = new Date().toISOString();
  rmSync(join(runs, id, 'artifacts'), { recursive: true, force: true });
  writeFileSync(file, JSON.stringify(r, null, 2));
  console.log(`${id}: ${before} → ${r.acceptance.passed}/${r.acceptance.total}${r.acceptance.failed.length ? '\n   ' + r.acceptance.failed.join(' | ') : ''}`);
}
