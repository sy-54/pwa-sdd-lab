// 使い方: tsx cli.ts <specsDir> [--phase requirements|spec|design|tasks|e2e|feedback] [--tests <e2eDir>] [--json]
import { PHASES, format, lint, type Phase } from './lint.ts';

const args = process.argv.slice(2);
const opt = (name: string) => {
  const i = args.indexOf(name);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
const phase = (opt('--phase') ?? 'feedback') as Phase;
const testsDir = opt('--tests');
const json = args.includes('--json');
const dir = args.find((a) => !a.startsWith('--'));

if (!dir || !PHASES.includes(phase)) {
  console.error(`usage: cli.ts <specsDir> [--phase ${PHASES.join('|')}] [--tests <e2eDir>] [--json]`);
  process.exit(2);
}

const issues = lint({ dir, phase, testsDir });
if (json) console.log(JSON.stringify(issues));
else console.log(issues.length ? `${format(issues)}\n\nSDD lint: NG（${issues.length}件, phase=${phase}）` : `SDD lint: OK（phase=${phase}）`);
process.exit(issues.length ? 1 : 0);
