// 採点：隠しE2E・lint・自前テストを機械的に測る。人の目視には頼らない。
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createServer } from 'node:net';
import { join } from 'node:path';
import { lint } from '../lint/lint.ts';

export const REPO = join(import.meta.dirname, '../..');

export function freePort(): Promise<number> {
  return new Promise((ok) => {
    const s = createServer().listen(0, '127.0.0.1', () => {
      const { port } = s.address() as { port: number };
      s.close(() => ok(port));
    });
  });
}

export interface Acceptance {
  passed: number;
  total: number;
  failed: string[]; // 落ちたテスト名
}

export async function runAcceptance(taskDir: string, workDir: string, outDir: string): Promise<Acceptance> {
  const port = await freePort();
  spawnSync('npx', ['playwright', 'test', '-c', join(REPO, 'harness/grade/acceptance.config.ts')], {
    cwd: REPO,
    env: { ...process.env, ACCEPT_DIR: join(taskDir, 'acceptance'), WORK_DIR: workDir, ACCEPT_OUT: outDir, PORT: String(port) },
    encoding: 'utf8',
    timeout: 10 * 60_000,
  });
  const file = join(outDir, 'acceptance.json');
  if (!existsSync(file)) return { passed: 0, total: 0, failed: ['(隠しE2Eを実行できなかった)'] };
  const failed: string[] = [];
  let total = 0;
  const visit = (suite: any) => {
    for (const spec of suite.specs ?? []) {
      total++;
      if (!spec.ok) failed.push(spec.title);
    }
    (suite.suites ?? []).forEach(visit);
  };
  JSON.parse(readFileSync(file, 'utf8')).suites.forEach(visit);
  return { passed: total - failed.length, total, failed };
}

/** ワークスペース内のコマンドを実行し、成否と出力の末尾を返す */
export function sh(cwd: string, cmd: string, env: Record<string, string> = {}, timeoutMs = 5 * 60_000) {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', env: { ...process.env, ...env }, timeout: timeoutMs });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  return { ok: r.status === 0, out: out.slice(-3000) };
}

export function lintWork(workDir: string) {
  return lint({ dir: join(workDir, 'specs'), phase: 'feedback', testsDir: join(workDir, 'tests/e2e') });
}

export function docLines(workDir: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const f of ['spec.md', 'design.md', 'tasks.md']) {
    const p = join(workDir, 'specs', f);
    out[f] = existsSync(p) ? readFileSync(p, 'utf8').trimEnd().split('\n').length : 0;
  }
  return out;
}

/** ログ中のツール呼び出しが隠しファイル（リポジトリ本体）に触れていないか */
export function leaked(logsDir: string): boolean {
  for (const f of readdirSync(logsDir)) {
    if (!f.endsWith('.jsonl') || f.startsWith('stakeholder')) continue;
    for (const line of readFileSync(join(logsDir, f), 'utf8').split('\n')) {
      if (!line.includes('"tool_use"')) continue;
      try {
        for (const c of JSON.parse(line).message?.content ?? []) {
          if (c.type !== 'tool_use') continue;
          const input = JSON.stringify(c.input);
          if (input.includes(REPO) || /stakeholder\.md|\/acceptance\//.test(input)) return true;
        }
      } catch {}
    }
  }
  return false;
}

/** 実行結果に影響する手順書・雛形・lint・ランナー・SDK の版。改善の前後を比べるために記録する */
const REV_PATHS = ['sdd', 'harness/template', 'harness/lint', 'harness/stakeholder', 'harness/run.ts', 'platform/sdk'];
export function sddRev(before?: Date): { rev: string; date: string; subject: string } {
  const args = ['log', '-1', '--format=%h%x09%cI%x09%s', ...(before ? [`--before=${before.toISOString()}`] : []), '--', ...REV_PATHS];
  const [rev = '?', date = '', subject = ''] = spawnSync('git', args, { cwd: REPO, encoding: 'utf8' }).stdout.trim().split('\t');
  return { rev, date, subject };
}
