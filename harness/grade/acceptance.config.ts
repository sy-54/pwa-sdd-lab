// 隠しE2E用の Playwright 設定。ACCEPT_DIR のテストを、WORK_DIR を配信したサーバーに対して実行する。
import { defineConfig, devices } from '@playwright/test';
import { join } from 'node:path';

const { ACCEPT_DIR, WORK_DIR, ACCEPT_OUT, PORT } = process.env;
const base = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: ACCEPT_DIR,
  outputDir: join(ACCEPT_OUT!, 'artifacts'),
  timeout: 10_000,
  expect: { timeout: 2_000 },
  workers: 2,
  reporter: [['json', { outputFile: join(ACCEPT_OUT!, 'acceptance.json') }]],
  use: { baseURL: base },
  projects: [{ name: 'webkit', use: { ...devices['iPhone 14'] } }],
  webServer: {
    command: `node ${join(import.meta.dirname, '../template/serve.mjs')}`,
    url: `${base}/__health`,
    env: { PORT: PORT!, ROOT: WORK_DIR! },
    reuseExistingServer: false,
  },
});
