// `claude -p` を1回呼び、ログ（stream-json）を保存して、結果とコストを返す。
import { spawn } from 'node:child_process';
import { createWriteStream, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const local = join(homedir(), '.local/bin/claude');
export const CLAUDE_BIN = process.env.CLAUDE_BIN ?? (existsSync(local) ? local : 'claude');

export interface ClaudeCall {
  cwd: string;
  prompt: string;
  model: string;
  logFile: string;
  /** 既定のシステムプロンプトへ追記する（作業環境の規約など） */
  appendSystem?: string;
  /** 既定のシステムプロンプトを置き換える（要求者シミュレータ用） */
  system?: string;
  /** 使えるツール。'' で全ツール無効 */
  tools?: string;
  allowed?: string[];
  disallowed?: string[];
  resume?: string;
  env?: Record<string, string>;
  timeoutMs?: number;
  maxBudgetUsd?: number;
}

export interface ClaudeResult {
  ok: boolean;
  text: string;
  sessionId?: string;
  costUsd: number;
  tokensIn: number; // キャッシュ読み書きを含む入力
  tokensOut: number;
  turns: number;
  durationMs: number;
  error?: string;
  /** 利用上限・認証切れなど、モデルの出来と無関係な失敗。この実行は採点してはいけない */
  infra?: string;
}

export function runClaude(c: ClaudeCall): Promise<ClaudeResult> {
  const args = ['-p', '--model', c.model, '--output-format', 'stream-json', '--verbose', '--safe-mode'];
  if (c.system !== undefined) args.push('--system-prompt', c.system);
  if (c.appendSystem) args.push('--append-system-prompt', c.appendSystem);
  if (c.tools !== undefined) args.push('--tools', c.tools);
  if (c.allowed?.length) args.push('--permission-mode', 'acceptEdits', '--allowedTools', ...c.allowed);
  if (c.disallowed?.length) args.push('--disallowedTools', ...c.disallowed);
  if (c.resume) args.push('--resume', c.resume);
  if (c.maxBudgetUsd) args.push('--max-budget-usd', String(c.maxBudgetUsd));

  const started = Date.now();
  return new Promise((done) => {
    const child = spawn(CLAUDE_BIN, args, { cwd: c.cwd, env: { ...process.env, ...c.env }, stdio: ['pipe', 'pipe', 'pipe'] });
    const log = createWriteStream(c.logFile);
    let buf = '';
    let stderr = '';
    let final: any;
    let limited = false;
    let sessionId: string | undefined;
    const timer = setTimeout(() => child.kill('SIGKILL'), c.timeoutMs ?? 20 * 60_000);

    child.stdout.on('data', (d) => {
      log.write(d);
      buf += d;
      let nl: number;
      while ((nl = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, nl);
        buf = buf.slice(nl + 1);
        try {
          const ev = JSON.parse(line);
          sessionId ??= ev.session_id;
          if (ev.type === 'result') final = ev;
          if (ev.type === 'rate_limit_event' && ev.rate_limit_info?.status === 'rejected') limited = true;
        } catch {}
      }
    });
    child.stderr.on('data', (d) => (stderr += d));
    child.on('close', (code, signal) => {
      clearTimeout(timer);
      log.end();
      const u = final?.usage ?? {};
      const status = final?.api_error_status;
      const infra =
        limited || status === 429 ? `利用上限に達した（${final?.result ?? ''}）` : status === 401 || status === 403 ? `認証エラー（${status}）` : !final && code !== 0 && signal !== 'SIGKILL' ? `claude を起動できない（${stderr.slice(-200)}）` : undefined;
      done({
        ok: !!final && !final.is_error && code === 0,
        text: final?.result ?? '',
        sessionId,
        costUsd: final?.total_cost_usd ?? 0,
        tokensIn: (u.input_tokens ?? 0) + (u.cache_creation_input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0),
        tokensOut: u.output_tokens ?? 0,
        turns: final?.num_turns ?? 0,
        durationMs: Date.now() - started,
        infra,
        error: final && !final.is_error ? undefined : signal === 'SIGKILL' ? 'timeout' : (final?.subtype ?? stderr.slice(-500)) || `exit ${code}`,
      });
    });
    child.stdin.end(c.prompt);
  });
}
