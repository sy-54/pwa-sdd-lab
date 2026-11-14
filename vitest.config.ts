import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: { include: ['harness/**/*.test.ts', 'platform/**/*.test.ts'], exclude: ['**/node_modules/**', 'results/**', 'harness/template/**'] },
});
