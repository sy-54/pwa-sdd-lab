// 課題×モデルを SDD フローで自動実行し、採点する。
// 使い方: npm run harness -- --tasks T00,T01 --models sonnet,haiku [--runs 2] [--parallel 2] [--stakeholder sonnet]
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { format, lint, type Phase } from './lint/lint.ts';
import { runClaude, type ClaudeResult } from './lib/claude.ts';
import { answer } from './stakeholder/answer.ts';
import { REPO, docLines, freePort, leaked, lintWork, runAcceptance, sh } from './grade/grade.ts';

const MAX_ATTEMPTS = 3; // 1フェーズあたりの試行回数（初回＋手戻り2回）
const MAX_QA_ROUNDS = 2;
const RUNS_ROOT = process.env.SDD_RUNS_DIR ?? join(tmpdir(), 'sdd-runs'); // 隠しファイルから離すためリポジトリの外に置く

const TOOLS = 'Bash,Read,Write,Edit,Glob,Grep';
const ALLOWED = [
  'Read', 'Write', 'Edit', 'Glob', 'Grep',
  'Bash(npm test*)', 'Bash(npm run *)', 'Bash(npx vitest*)', 'Bash(npx playwright test*)',
  'Bash(git add*)', 'Bash(git commit*)', 'Bash(git status*)', 'Bash(git diff*)', 'Bash(git log*)',
  'Bash(ls*)', 'Bash(cat *)', 'Bash(head *)', 'Bash(tail *)', 'Bash(grep *)', 'Bash(find *)', 'Bash(wc *)',
  'Bash(mkdir *)', 'Bash(node *)', 'Bash(echo *)', 'Bash(pwd)',
];
const DISALLOWED = ['Bash(npm install*)', 'Bash(npm i *)', 'Bash(npx playwright install*)', 'Bash(git push*)'];

interface PhaseLog {
  phase: string;
  attempts: number;
  gate: boolean;
  costUsd: number;
  tokensIn: number;
  tokensOut: number;
  durationMs: number;
  lastError?: string;
}

function args() {
  const a = process.argv.slice(2);
  const get = (k: string, d: string) => (a.includes(k) ? a[a.indexOf(k) + 1] : d);
  return {
    tasks: get('--tasks', 'T00').split(','),
    models: get('--models', 'sonnet').split(','),
    runs: Number(get('--runs', '1')),
    parallel: Number(get('--parallel', '2')),
    stakeholder: get('--stakeholder', 'sonnet'),
  };
}

function findTask(prefix: string): string {
  const name = readdirSync(join(REPO, 'tasks')).find((d) => d === prefix || d.startsWith(prefix + '-'));
  if (!name) throw new Error(`課題が見つからない: ${prefix}`);
  return name;
}

function prepare(work: string, taskDir: string) {
  rmSync(work, { recursive: true, force: true });
  mkdirSync(join(work, 'specs'), { recursive: true });
  cpSync(join(REPO, 'harness/template'), work, { recursive: true });
  cpSync(join(work, 'WORKSPACE.md'), join(work, 'CLAUDE.md'));
  rmSync(join(work, 'WORKSPACE.md'));
  cpSync(join(REPO, 'sdd'), join(work, 'sdd'), { recursive: true });
  mkdirSync(join(work, 'tools/lint'), { recursive: true });
  for (const f of ['lint.ts', 'cli.ts']) cpSync(join(REPO, 'harness/lint', f), join(work, 'tools/lint', f));
  cpSync(join(taskDir, 'requirements.md'), join(work, 'specs/requirements.md'));
  // 課題が platform（ランチャー＋SDK）を使う場合は task.json の "platform": true で同梱する
  const meta = existsSync(join(taskDir, 'task.json')) ? JSON.parse(readFileSync(join(taskDir, 'task.json'), 'utf8')) : {};
  if (meta.platform) for (const d of ['sdk', 'launcher']) if (existsSync(join(REPO, 'platform', d))) cpSync(join(REPO, 'platform', d), join(work, d), { recursive: true });
  symlinkSync(join(REPO, 'node_modules'), join(work, 'node_modules'));
  writeFileSync(join(work, '.gitignore'), 'node_modules\ntest-results\nplaywright-report\n');
  sh(work, 'git init -q -b main && git add -A && git -c user.name=harness -c user.email=harness@local commit -qm "初期状態"');
  sh(work, 'git config user.name sdd-agent && git config user.email agent@local');
}

async function runOne(taskName: string, model: string, n: number, stakeholderModel: string) {
  const taskDir = join(REPO, 'tasks', taskName);
  const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
  const id = `${taskName.split('-')[0]}-${model}-${stamp}-${n}`;
  const work = join(RUNS_ROOT, id);
  const out = join(REPO, 'results/runs', id);
  const logs = join(out, 'logs');
  mkdirSync(logs, { recursive: true });
  prepare(work, taskDir);
  const env = { PORT: String(await freePort()) };
  const rules = readFileSync(join(work, 'CLAUDE.md'), 'utf8');
  const phases: PhaseLog[] = [];
  const say = (m: string) => console.log(`[${id}] ${m}`);
  const read = (f: string) => (existsSync(join(work, f)) ? readFileSync(join(work, f), 'utf8').trim() : '');
  const lintErr = (phase: Phase) => {
    const issues = lint({ dir: join(work, 'specs'), phase, testsDir: join(work, 'tests/e2e') });
    return issues.length ? `lint (--phase ${phase}) が NG：\n${format(issues)}` : null;
  };

  let seq = 0;
  const call = (name: string, prompt: string, resume?: string): Promise<ClaudeResult> =>
    runClaude({
      cwd: work, model, prompt, resume, env,
      logFile: join(logs, `${String(++seq).padStart(2, '0')}-${name}.jsonl`),
      appendSystem: rules, tools: TOOLS, allowed: ALLOWED, disallowed: DISALLOWED, maxBudgetUsd: 5,
    });
  const intro = (doc: string) =>
    `これは自動実行です（人間は応答しません。承認待ちで止まらず、指示された範囲を最後までやり切ってください）。\n最初に sdd/SKILL.md と sdd/phases/${doc} を読み、その手順に従ってください。\n\n`;

  /** フェーズを実行し、ゲートを通るまで最大 MAX_ATTEMPTS 回やり直す */
  async function phase(name: string, prompt: string, gate: () => string | null): Promise<boolean> {
    const log: PhaseLog = { phase: name, attempts: 0, gate: false, costUsd: 0, tokensIn: 0, tokensOut: 0, durationMs: 0 };
    phases.push(log);
    let session: string | undefined;
    let p = prompt;
    while (log.attempts < MAX_ATTEMPTS) {
      log.attempts++;
      const r = await call(`${name}-${log.attempts}`, p, session);
      log.costUsd += r.costUsd;
      log.tokensIn += r.tokensIn;
      log.tokensOut += r.tokensOut;
      log.durationMs += r.durationMs;
      session = r.ok ? r.sessionId : undefined;
      const err = gate() ?? undefined;
      log.lastError = err ?? (r.ok ? undefined : `claude: ${r.error}`);
      if (!err) {
        log.gate = true;
        break;
      }
      say(`${name} 手戻り ${log.attempts}/${MAX_ATTEMPTS}: ${err.split('\n')[0]}`);
      p = `${session ? '' : prompt + '\n\n'}前回の作業はゲートを通過しませんでした。次の問題を直してください。\n\n${err}`;
    }
    say(`${name}: ${log.gate ? 'OK' : 'NG'}（${log.attempts}回, $${log.costUsd.toFixed(2)}）`);
    return log.gate;
  }

  // 1. SPEC：質問 → 要求者シミュレータが回答 → spec.md
  let qaRounds = 0;
  await phase(
    'spec-questions',
    intro('01-spec.md') +
      '今回は手順1〜2（質問）だけを行います。specs/requirements.md を読み、質問を specs/questions.md に「Q1: …」の形式で書いて終了してください（最大5個。質問が不要なら NONE とだけ書く）。spec.md はまだ書きません。',
    () => (read('specs/questions.md') ? null : 'specs/questions.md がない'),
  );
  const askStakeholder = async () => {
    const q = read('specs/questions.md');
    if (!q || /^NONE\b/.test(q)) return false;
    qaRounds++;
    const empty = join(RUNS_ROOT, `${id}-stakeholder`);
    mkdirSync(empty, { recursive: true });
    const a = await answer({ questions: q, stakeholderFile: join(taskDir, 'stakeholder.md'), model: stakeholderModel, cwd: empty, logFile: join(logs, `stakeholder-${qaRounds}.jsonl`) });
    const body = a.ok ? a.text : '（回答を得られなかった。未決事項として扱うこと）';
    writeFileSync(join(work, 'specs/qa.md'), `${read('specs/qa.md')}\n\n## ラウンド${qaRounds}\n### 質問\n${q}\n\n### 要求者の回答\n${body}\n`.trimStart());
    rmSync(join(work, 'specs/questions.md'));
    return true;
  };
  await askStakeholder();
  const specPrompt = () =>
    intro('01-spec.md') +
    `質問への回答は specs/qa.md にあります（なければ質問なしで進めた）。手順3〜5を行い、specs/spec.md を書いて、\`npm run lint:sdd -- --phase spec\` が OK になるまで直してください。` +
    (qaRounds < MAX_QA_ROUNDS && qaRounds > 0
      ? '回答を読んで、仕様を決めるのにどうしても追加の質問が必要な場合に限り、spec.md を書かずに specs/questions.md へ新しい質問（最大5個）を書いて終了してもかまいません（あと1ラウンドだけ）。'
      : '');
  for (;;) {
    await phase('spec', specPrompt(), () => (read('specs/questions.md') && !read('specs/spec.md') ? null : lintErr('spec')));
    if (read('specs/spec.md') || !(qaRounds < MAX_QA_ROUNDS && (await askStakeholder()))) break;
  }

  // 2〜6. design → tasks → impl → E2E → 反映
  await phase('design', intro('02-design.md') + 'specs/design.md を書き、`npm run lint:sdd -- --phase design` が OK になるまで直してください。', () => lintErr('design'));
  await phase('tasks', intro('03-tasks.md') + 'specs/tasks.md を書き、`npm run lint:sdd -- --phase tasks` が OK になるまで直してください。', () => lintErr('tasks'));
  const unchecked = (includeE2E: boolean) =>
    read('specs/tasks.md').split('\n').filter((l) => /^- \[ \]/.test(l) && (includeE2E || !/E2E/i.test(l)));
  await phase(
    'impl',
    intro('04-impl.md') + 'specs/tasks.md の未完了タスクを上から順に、すべて実装してください。E2E のタスクだけは次のフェーズで行うので残します。最後に `npm test` が通ることを確認してください。',
    () => {
      const left = unchecked(false);
      if (left.length) return `未完了のタスクが残っている：\n${left.join('\n')}`;
      const t = sh(work, 'npm test', env);
      return t.ok ? null : `npm test が失敗：\n${t.out}`;
    },
  );
  await phase(
    'e2e',
    intro('05-e2e.md') + 'spec.md の全 AC の E2E を tests/e2e/ に書き、`npm run e2e` を全件通し、`npm run lint:sdd -- --phase e2e` を OK にしてください。tasks.md を全てチェック済みにしてコミットします。',
    () => {
      const e = sh(work, 'npm run e2e', env);
      if (!e.ok) return `npm run e2e が失敗：\n${e.out}`;
      const left = unchecked(true);
      return left.length ? `未完了のタスクが残っている：\n${left.join('\n')}` : lintErr('e2e');
    },
  );
  await phase('feedback', intro('06-feedback.md') + 'specs/requirements.md の末尾に改訂履歴を書き、`npm run lint:sdd -- --phase feedback` を OK にしてコミットしてください。', () => lintErr('feedback'));

  // 採点
  sh(work, 'git add -A && git commit -qm "実行終了時の未コミット分" ; git log --oneline > git-log.txt');
  const acceptance = await runAcceptance(taskDir, work, out);
  const lintIssues = lintWork(work);
  const unit = sh(work, 'npm test', env);
  const e2e = sh(work, 'npm run e2e', env);
  const sum = (k: 'costUsd' | 'tokensIn' | 'tokensOut' | 'durationMs') => phases.reduce((s, p) => s + p[k], 0);
  const result = {
    id, task: taskName, model, stakeholderModel, finishedAt: new Date().toISOString(),
    acceptance,
    passRate: acceptance.total ? acceptance.passed / acceptance.total : 0,
    lintErrors: lintIssues.length,
    lintIssues: lintIssues.map((i) => `${i.file}: [${i.rule}] ${i.msg}`),
    ownTests: { unit: unit.ok, e2e: e2e.ok },
    rework: phases.reduce((s, p) => s + p.attempts - 1, 0),
    gatesFailed: phases.filter((p) => !p.gate).map((p) => p.phase),
    qaRounds,
    commits: read('git-log.txt').split('\n').length - 1,
    docLines: docLines(work),
    costUsd: +sum('costUsd').toFixed(4),
    tokensIn: sum('tokensIn'),
    tokensOut: sum('tokensOut'),
    minutes: +(sum('durationMs') / 60000).toFixed(1),
    leaked: leaked(logs),
    phases,
  };
  writeFileSync(join(out, 'result.json'), JSON.stringify(result, null, 2));
  cpSync(work, join(out, 'work'), { recursive: true, filter: (s) => !/\/(node_modules|\.git|test-results|sdd|tools)$/.test(s) });
  rmSync(join(out, 'artifacts'), { recursive: true, force: true });
  say(`完了：隠しE2E ${acceptance.passed}/${acceptance.total}, lint ${lintIssues.length}件, 手戻り ${result.rework}, $${result.costUsd}, ${result.minutes}分`);
  return result;
}

const o = args();
const jobs = o.tasks.flatMap((t) => o.models.flatMap((m) => Array.from({ length: o.runs }, (_, i) => ({ t: findTask(t), m, n: i + 1 }))));
console.log(`${jobs.length} 件を並列 ${o.parallel} で実行（作業場所: ${RUNS_ROOT}）`);
let next = 0;
await Promise.all(
  Array.from({ length: Math.min(o.parallel, jobs.length) }, async () => {
    while (next < jobs.length) {
      const j = jobs[next++];
      await runOne(j.t, j.m, j.n, o.stakeholder).catch((e) => console.error(`[${j.t}/${j.m}] 実行失敗:`, e));
    }
  }),
);
console.log('集計は `npm run summary` で results/summary.md に出力する');
