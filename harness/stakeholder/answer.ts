// 要求者シミュレータ：stakeholder.md だけを根拠に、SPEC壁打ちの質問へ答える。
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runClaude, type ClaudeResult } from '../lib/claude.ts';

const persona = readFileSync(join(import.meta.dirname, 'prompt.md'), 'utf8');

export async function answer(o: {
  questions: string;
  stakeholderFile: string;
  model: string;
  cwd: string; // 隠しファイルのない空ディレクトリ
  logFile: string;
}): Promise<ClaudeResult> {
  return runClaude({
    cwd: o.cwd,
    model: o.model,
    logFile: o.logFile,
    system: persona + '\n' + readFileSync(o.stakeholderFile, 'utf8'),
    tools: '',
    prompt: `開発者からの質問です。ルールに従って回答だけを書いてください。\n\n${o.questions}`,
    timeoutMs: 3 * 60_000,
  });
}
