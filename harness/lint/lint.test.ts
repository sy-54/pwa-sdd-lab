import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { lint, type Phase } from './lint.ts';

const fx = (n: string) => join(import.meta.dirname, 'fixtures', n);
const run = (root: string, phase: Phase = 'feedback') =>
  lint({ dir: join(root, 'specs'), phase, testsDir: join(root, 'tests/e2e') });
const rules = (root: string, phase?: Phase) => run(root, phase).map((i) => `${i.file}:${i.rule}`);

let tmp: string | undefined;
afterEach(() => tmp && rmSync(tmp, { recursive: true }));
/** good を複製し、1ファイルだけ書き換えたものを返す */
function mutate(file: string, edit: (s: string) => string): string {
  tmp = mkdtempSync(join(tmpdir(), 'sddlint-'));
  cpSync(fx('good'), tmp, { recursive: true });
  const p = join(tmp, file);
  writeFileSync(p, edit(readFileSync(p, 'utf8')));
  return tmp;
}

describe('合格サンプル', () => {
  it.each(['requirements', 'spec', 'design', 'tasks', 'e2e', 'feedback'] as Phase[])('%s まで問題なし', (p) => {
    expect(run(fx('good'), p)).toEqual([]);
  });
});

describe('不合格サンプル', () => {
  const r = rules(fx('bad'), 'tasks');
  it.each([
    'requirements.md:summary',
    'requirements.md:section', // 利用者 / Won't / UI契約
    'spec.md:section', // エラー時の挙動 / 未決事項
    'spec.md:ac-gwt', // AC-01 に When がない
    'spec.md:ac-format', // 「### 復元する」
    'spec.md:ac-unknown', // AC-09
    'design.md:summary',
    'design.md:section',
    'design.md:trace-design',
    'tasks.md:task-format',
    'tasks.md:ac-unknown',
    'tasks.md:trace-tasks',
  ])('%s を検出する', (rule) => expect(r).toContain(rule));
  it('前のフェーズだけ検査するときは後続文書を見ない', () => {
    expect(rules(fx('bad'), 'spec').some((x) => x.startsWith('design.md') || x.startsWith('tasks.md'))).toBe(false);
  });
});

describe('個別ルール', () => {
  it('行数上限', () => {
    const root = mutate('specs/tasks.md', (s) => s + '\n'.padEnd(60, '\n') + 'x\n');
    expect(rules(root)).toContain('tasks.md:line-limit');
  });
  it('requirements の40行は改訂履歴を除いて数える', () => {
    const root = mutate('specs/requirements.md', (s) => s.replace('## Should', '\n'.repeat(20) + '## Should'));
    expect(rules(root)).toContain('requirements.md:line-limit');
  });
  it('改訂履歴は15行まで', () => {
    const root = mutate('specs/requirements.md', (s) => s + '- x\n'.repeat(15));
    expect(rules(root)).toContain('requirements.md:line-limit');
  });
  it('feedback では改訂履歴が必須、それ以前は不要', () => {
    const root = mutate('specs/requirements.md', (s) => s.slice(0, s.indexOf('## 改訂履歴')));
    expect(rules(root, 'feedback')).toContain('requirements.md:history');
    expect(run(root, 'e2e')).toEqual([]);
  });
  it('AC の重複', () => {
    const root = mutate('specs/spec.md', (s) => s.replace('### AC-02', '### AC-01'));
    expect(rules(root)).toContain('spec.md:ac-dup');
  });
  it('E2E のない AC', () => {
    const root = mutate('tests/e2e/counter.spec.ts', (s) => s.replace('AC-04', 'AC4'));
    expect(rules(root)).toContain(`${join(root, 'tests/e2e')}:trace-e2e`);
  });
  it('ファイル欠落', () => {
    const root = mutate('specs/design.md', (s) => s);
    rmSync(join(root, 'specs/design.md'));
    expect(rules(root)).toContain('design.md:file-missing');
  });
});
