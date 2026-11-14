import { defineConfig, devices } from '@playwright/test';
import { join } from 'node:path';

// dist/（公開物そのもの）を配信して検査する
const port = Number(process.env.PORT ?? 4180);
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 20_000,
  expect: { timeout: 5_000 },
  reporter: 'line',
  use: { baseURL: `http://127.0.0.1:${port}/` },
  projects: [{ name: 'webkit', use: { ...devices['iPhone 14'] } }],
  webServer: {
    command: `npx tsx scripts/build.ts && node ${join(import.meta.dirname, '../harness/template/serve.mjs')}`,
    url: `http://127.0.0.1:${port}/__health`,
    env: { PORT: String(port), ROOT: join(import.meta.dirname, 'dist') },
    reuseExistingServer: false,
  },
});
