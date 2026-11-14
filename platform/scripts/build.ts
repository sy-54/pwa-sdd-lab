// 全 manifest を検証し、公開物 dist/ を生成する。
// 使い方: tsx build.ts [--check] [--apps <dir>] [--out <dir>]　（--check は検証だけ）
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { validateManifest, type AppManifest } from './manifest.ts';

const root = join(import.meta.dirname, '..');
const argv = process.argv.slice(2);
const opt = (k: string, d: string) => (argv.includes(k) ? argv[argv.indexOf(k) + 1] : d);
const appsDir = opt('--apps', join(root, 'apps'));
const out = opt('--out', join(root, 'dist'));
const PUBLISH = ['index.html', 'launcher', 'sdk', 'icons', 'manifest.webmanifest', 'sw.js'];

// 1. 検証
const apps: AppManifest[] = [];
let failed = false;
for (const id of existsSync(appsDir) ? readdirSync(appsDir).sort() : []) {
  const dir = join(appsDir, id);
  if (!statSync(dir).isDirectory()) continue;
  let json: unknown;
  let errs: string[];
  try {
    json = JSON.parse(readFileSync(join(dir, 'manifest.json'), 'utf8'));
    const index = join(dir, 'index.html');
    errs = validateManifest(json, id, existsSync(index) ? readFileSync(index, 'utf8') : null);
  } catch (e) {
    errs = [`manifest.json を読めない（${(e as Error).message}）`];
  }
  if (errs.length) {
    failed = true;
    for (const e of errs) console.error(`✗ ${id}: ${e}`);
  } else {
    const m = json as AppManifest;
    apps.push({ id: m.id, name: m.name, icon: m.icon, description: m.description ?? '' });
  }
}
if (failed) {
  console.error('manifest の検証に失敗しました。公開物は生成していません。');
  process.exit(1);
}
console.log(`✓ manifest 検証 OK（${apps.length} アプリ）`);
if (argv.includes('--check')) process.exit(0);

// 2. dist/ を生成
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const p of PUBLISH) if (existsSync(join(root, p))) cpSync(join(root, p), join(out, p), { recursive: true });
if (existsSync(appsDir)) cpSync(appsDir, join(out, 'apps'), { recursive: true });
apps.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
writeFileSync(join(out, 'apps.json'), JSON.stringify(apps, null, 2));

// 3. precache.js（内容が変わると version が変わり、Service Worker が更新される）
const walk = (d: string): string[] =>
  readdirSync(d).flatMap((n) => (statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)]));
const files = walk(out)
  .map((f) => relative(out, f).split(sep).join('/'))
  .filter((f) => !['sw.js', 'precache.js'].includes(f) && !f.endsWith('.md') && !f.endsWith('.DS_Store'))
  .sort();
const hash = createHash('sha1');
for (const f of [...files, 'sw.js']) if (existsSync(join(out, f))) hash.update(f).update(readFileSync(join(out, f)));
const version = hash.digest('hex').slice(0, 7);
writeFileSync(join(out, 'precache.js'), `self.__PRECACHE = ${JSON.stringify({ version, files })};\n`);
console.log(`✓ dist/ を生成（${files.length} ファイル, version ${version}）`);
