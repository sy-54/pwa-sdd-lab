import { expect, test } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';

const platform = join(import.meta.dirname, '../..');
const build = (...args: string[]) =>
  spawnSync('npx', ['tsx', join(platform, 'scripts/build.ts'), '--check', ...args], { encoding: 'utf8' });

test('AC-13 不正な manifest は公開前に止まる', () => {
  const r = build('--apps', join(platform, 'tests/fixtures/bad-apps'));
  expect(r.status).not.toBe(0);
  expect(r.stdout + r.stderr).toContain('noname');
  expect(r.stdout + r.stderr).toContain('name');
});

test('AC-13 同梱アプリの manifest は検証を通る', () => {
  expect(build().status).toBe(0);
});
