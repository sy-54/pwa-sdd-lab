import { defineConfig, devices } from '@playwright/test';
const port = Number(process.env.PORT ?? 4173);
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 15_000,
  expect: { timeout: 3_000 },
  reporter: 'line',
  use: { baseURL: `http://127.0.0.1:${port}` },
  projects: [{ name: 'webkit', use: { ...devices['iPhone 14'] } }],
  webServer: { command: 'node serve.mjs', url: `http://127.0.0.1:${port}/__health`, env: { PORT: String(port) }, reuseExistingServer: false },
});
