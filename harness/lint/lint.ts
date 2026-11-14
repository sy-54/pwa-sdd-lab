// SDDドキュメントの機械チェック。依存ゼロ（評価用ワークスペースへそのままコピーして使う）。
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface Issue {
  file: string;
  line: number;
  rule: string;
  msg: string;
}

export const PHASES = ['requirements', 'spec', 'design', 'tasks', 'e2e', 'feedback'] as const;
export type Phase = (typeof PHASES)[number];

export const LIMITS = { requirements: 40, spec: 150, design: 100, tasks: 50, history: 15 };

const REQUIRED: Record<string, string[]> = {
  spec: ['画面と操作', '振る舞い', 'エラー時の挙動', '受け入れ条件', '決定事項', '未決事項'],
  design: ['モジュール構成', 'データモデル', '使用するSDK API', 'ACとテストの対応'],
};

interface Section {
  title: string;
  start: number; // 見出し行の index
  end: number; // 次の ## 見出しの index（排他）
}

function readLines(path: string): string[] {
  const lines = readFileSync(path, 'utf8').replace(/\r\n/g, '\n').split('\n');
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();
  return lines;
}

function sections(lines: string[]): Section[] {
  const out: Section[] = [];
  let fenced = false;
  lines.forEach((l, i) => {
    if (l.startsWith('```')) fenced = !fenced;
    if (!fenced && /^## /.test(l)) out.push({ title: l.slice(3).trim(), start: i, end: lines.length });
  });
  out.forEach((s, i) => {
    if (out[i + 1]) s.end = out[i + 1].start;
  });
  return out;
}

const findSection = (secs: Section[], key: string) => secs.find((s) => s.title.includes(key));
const acIds = (text: string) => [...text.matchAll(/AC-\d{2,}/g)].map((m) => m[0]);

function checkSummary(file: string, lines: string[], issues: Issue[]) {
  if (!/^# \S/.test(lines[0] ?? '')) {
    issues.push({ file, line: 1, rule: 'title', msg: '1行目は「# タイトル」にする' });
    return;
  }
  let i = 1;
  while (i < lines.length && lines[i].trim() === '') i++;
  let n = 0;
  while (i + n < lines.length && /^>\s*\S/.test(lines[i + n])) n++;
  if (n !== 3)
    issues.push({
      file,
      line: i + 1,
      rule: 'summary',
      msg: `タイトル直後に「> 」で始まる3行サマリを置く（現在 ${n} 行）`,
    });
}

function checkLimit(file: string, count: number, limit: number, issues: Issue[], what = '') {
  if (count > limit)
    issues.push({ file, line: limit + 1, rule: 'line-limit', msg: `${what}行数 ${count} が上限 ${limit} を超過。削って短くする` });
}

function checkRequired(file: string, secs: Section[], keys: string[], issues: Issue[]) {
  for (const k of keys)
    if (!findSection(secs, k)) issues.push({ file, line: 1, rule: 'section', msg: `必須セクション「## ${k === 'Won' ? "Won't" : k}」がない` });
}

function lintRequirements(file: string, lines: string[], needHistory: boolean, issues: Issue[]) {
  checkSummary(file, lines, issues);
  const secs = sections(lines);
  const hist = findSection(secs, '改訂履歴');
  checkLimit(file, hist ? hist.start : lines.length, LIMITS.requirements, issues, '本文（改訂履歴を除く）の');
  for (const k of ['目的', '利用者']) {
    const ok = findSection(secs, k) || lines.some((l) => new RegExp(`^${k}\\s*[:：]`).test(l));
    if (!ok) issues.push({ file, line: 1, rule: 'section', msg: `「${k}」がない（「## ${k}」または「${k}：…」）` });
  }
  checkRequired(file, secs, ['Must', 'Won', '制約', 'UI契約'], issues);
  if (hist) {
    const body = lines.slice(hist.start + 1, hist.end).filter((l) => l.trim() !== '');
    checkLimit(file, body.length, LIMITS.history, issues, '改訂履歴の');
    if (needHistory && body.length === 0)
      issues.push({ file, line: hist.start + 1, rule: 'history', msg: '改訂履歴が空' });
  } else if (needHistory) {
    issues.push({ file, line: lines.length, rule: 'history', msg: '末尾に「## 改訂履歴」がない' });
  }
}

/** spec.md を検査し、定義済み AC の ID 一覧を返す */
function lintSpec(file: string, lines: string[], issues: Issue[]): string[] {
  checkSummary(file, lines, issues);
  checkLimit(file, lines.length, LIMITS.spec, issues);
  const secs = sections(lines);
  checkRequired(file, secs, REQUIRED.spec, issues);
  const defined: string[] = [];
  const acSec = findSection(secs, '受け入れ条件');
  if (acSec) {
    for (let i = acSec.start + 1; i < acSec.end; i++) {
      const m = /^### (AC-\d{2,})\b/.exec(lines[i]);
      if (!m) {
        if (/^###\s/.test(lines[i]))
          issues.push({ file, line: i + 1, rule: 'ac-format', msg: 'AC見出しは「### AC-01: タイトル」形式にする' });
        continue;
      }
      const id = m[1];
      if (defined.includes(id)) issues.push({ file, line: i + 1, rule: 'ac-dup', msg: `${id} が重複` });
      defined.push(id);
      let j = i + 1;
      while (j < acSec.end && !/^#{2,3} /.test(lines[j])) j++;
      const body = lines.slice(i + 1, j).join('\n');
      for (const kw of ['Given', 'When', 'Then'])
        if (!new RegExp(`\\b${kw}\\b`).test(body))
          issues.push({ file, line: i + 1, rule: 'ac-gwt', msg: `${id} に ${kw} がない` });
    }
    if (defined.length === 0)
      issues.push({ file, line: acSec.start + 1, rule: 'ac-none', msg: 'AC が1つも定義されていない（### AC-01: …）' });
  }
  lines.forEach((l, i) => {
    for (const id of acIds(l))
      if (!defined.includes(id)) issues.push({ file, line: i + 1, rule: 'ac-unknown', msg: `${id} は受け入れ条件に定義されていない` });
  });
  return defined;
}

function lintDesign(file: string, lines: string[], acs: string[], issues: Issue[]) {
  checkSummary(file, lines, issues);
  checkLimit(file, lines.length, LIMITS.design, issues);
  const secs = sections(lines);
  checkRequired(file, secs, REQUIRED.design, issues);
  const map = findSection(secs, 'ACとテストの対応');
  if (map) {
    const covered = acIds(lines.slice(map.start, map.end).join('\n'));
    for (const id of acs)
      if (!covered.includes(id))
        issues.push({ file, line: map.start + 1, rule: 'trace-design', msg: `${id} が「ACとテストの対応」にない` });
  }
  lines.forEach((l, i) => {
    for (const id of acIds(l))
      if (!acs.includes(id)) issues.push({ file, line: i + 1, rule: 'ac-unknown', msg: `${id} は spec.md に定義されていない` });
  });
}

function lintTasks(file: string, lines: string[], acs: string[], issues: Issue[]) {
  checkSummary(file, lines, issues);
  checkLimit(file, lines.length, LIMITS.tasks, issues);
  const seen: string[] = [];
  const covered = new Set<string>();
  lines.forEach((l, i) => {
    if (!/^\s*- \[/.test(l)) return;
    const m = /^- \[( |x)\] (T\d{2,}): .+\(((?:AC-\d{2,})(?:, ?AC-\d{2,})*|setup)\)\s*$/.exec(l);
    if (!m) {
      issues.push({ file, line: i + 1, rule: 'task-format', msg: 'タスクは「- [ ] T01: 内容 (AC-01, AC-02)」形式。ACに紐づかない準備作業は末尾を (setup) にする' });
      return;
    }
    if (seen.includes(m[2])) issues.push({ file, line: i + 1, rule: 'task-dup', msg: `${m[2]} が重複` });
    seen.push(m[2]);
    for (const id of acIds(m[3])) {
      covered.add(id);
      if (!acs.includes(id)) issues.push({ file, line: i + 1, rule: 'ac-unknown', msg: `${id} は spec.md に定義されていない` });
    }
  });
  if (seen.length === 0) issues.push({ file, line: 1, rule: 'task-none', msg: 'タスクが1つもない' });
  for (const id of acs)
    if (!covered.has(id)) issues.push({ file, line: 1, rule: 'trace-tasks', msg: `${id} に対応するタスクがない` });
}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n === 'node_modules') return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function lintE2E(testsDir: string, acs: string[], issues: Issue[]) {
  if (!existsSync(testsDir)) {
    issues.push({ file: testsDir, line: 1, rule: 'e2e-missing', msg: 'E2Eテストのディレクトリがない' });
    return;
  }
  const text = walk(testsDir)
    .filter((f) => /\.spec\.(ts|js|mjs)$/.test(f))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');
  const found = acIds(text);
  for (const id of acs)
    if (!found.includes(id))
      issues.push({ file: testsDir, line: 1, rule: 'trace-e2e', msg: `${id} のE2Eテストがない（テスト名に「${id}」を含める）` });
}

export interface LintOptions {
  dir: string; // requirements.md / spec.md / design.md / tasks.md があるディレクトリ
  phase: Phase; // このフェーズまでの成果物を検査する
  testsDir?: string; // E2Eテストの場所（phase が e2e 以降のとき必須）
}

export function lint(opts: LintOptions): Issue[] {
  const issues: Issue[] = [];
  const upto = PHASES.indexOf(opts.phase);
  const has = (p: Phase) => upto >= PHASES.indexOf(p);
  const load = (name: string): string[] | null => {
    const p = join(opts.dir, name);
    if (existsSync(p)) return readLines(p);
    issues.push({ file: name, line: 1, rule: 'file-missing', msg: `${name} がない` });
    return null;
  };

  const req = load('requirements.md');
  if (req) lintRequirements('requirements.md', req, has('feedback'), issues);
  if (!has('spec')) return issues;
  const spec = load('spec.md');
  const acs = spec ? lintSpec('spec.md', spec, issues) : [];
  if (has('design')) {
    const d = load('design.md');
    if (d) lintDesign('design.md', d, acs, issues);
  }
  if (has('tasks')) {
    const t = load('tasks.md');
    if (t) lintTasks('tasks.md', t, acs, issues);
  }
  if (has('e2e')) lintE2E(opts.testsDir ?? join(opts.dir, '..', 'tests', 'e2e'), acs, issues);
  return issues;
}

export function format(issues: Issue[]): string {
  return issues.map((i) => `${i.file}:${i.line}: [${i.rule}] ${i.msg}`).join('\n');
}
