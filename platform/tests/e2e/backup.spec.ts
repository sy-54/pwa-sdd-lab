import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { png } from './helpers.ts';

async function saveMemo(page: Page, text: string) {
  await page.goto('apps/demo/');
  await page.getByTestId('demo-memo').fill(text);
  await page.getByTestId('demo-save').click();
  await expect(page.getByTestId('sdk-toast')).toHaveText('保存しました');
}

async function exportFile(page: Page) {
  await page.goto('');
  await page.getByTestId('settings-open').click();
  const download = page.waitForEvent('download');
  await page.getByTestId('export-data').click();
  const d = await download;
  return { name: d.suggestedFilename(), path: await d.path() };
}

async function importFile(page: Page, file: string | { name: string; mimeType: string; buffer: Buffer }) {
  await page.goto('');
  await page.getByTestId('settings-open').click();
  await page.getByTestId('import-data').setInputFiles(file);
}

test('AC-09 エクスポート', async ({ page }) => {
  await saveMemo(page, '牛乳');
  const { name, path } = await exportFile(page);
  expect(name).toMatch(/^pwa-backup-\d{8}\.json$/);
  const backup = JSON.parse(readFileSync(path, 'utf8'));
  expect(backup.format).toBe('pwa-backup');
  expect(backup.apps.demo.memo).toBe('牛乳');
});

test('AC-10 インポート（別の端末に見立てた空のコンテキストへ、写真ごと移す）', async ({ page, browser, baseURL }) => {
  await saveMemo(page, '牛乳');
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('demo-photo').click();
  await (await chooser).setFiles({ name: 'p.png', mimeType: 'image/png', buffer: png(400, 300) });
  await expect(page.getByTestId('demo-photo-img')).toBeVisible();
  const { path } = await exportFile(page);

  const other = await (await browser.newContext({ baseURL })).newPage();
  await other.goto('apps/demo/');
  await expect(other.getByTestId('demo-memo')).toHaveValue('');
  await importFile(other, path);
  await other.getByTestId('sdk-confirm-ok').click();
  await expect(other.getByTestId('sdk-toast')).toHaveText('取り込みました');
  await other.goto('apps/demo/');
  await expect(other.getByTestId('demo-memo')).toHaveValue('牛乳');
  await expect(other.getByTestId('demo-photo-img')).toBeVisible();
  await other.context().close();
});

test('AC-10 確認でキャンセルすると何も変わらない', async ({ page }) => {
  await saveMemo(page, '牛乳');
  const backup = { format: 'pwa-backup', version: 1, apps: { demo: { memo: 'パン' } } };
  await importFile(page, { name: 'b.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(backup)) });
  await page.getByTestId('sdk-confirm-cancel').click();
  await page.goto('apps/demo/');
  await expect(page.getByTestId('demo-memo')).toHaveValue('牛乳');
});

for (const [label, content] of [['JSON でない', 'これはJSONではない'], ['形式が違う', '{"apps":{}}']]) {
  test(`AC-11 不正なファイルのインポート（${label}）`, async ({ page }) => {
    await saveMemo(page, '牛乳');
    await importFile(page, { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(content) });
    await expect(page.getByTestId('sdk-toast')).toHaveText('読み込めないファイルです');
    await expect(page.getByTestId('sdk-confirm')).toHaveCount(0);
    await page.goto('apps/demo/');
    await expect(page.getByTestId('demo-memo')).toHaveValue('牛乳');
  });
}

test('AC-09 設定パネルにバージョンが表示される', async ({ page }) => {
  await page.goto('');
  await expect(page.getByTestId('settings-panel')).toBeHidden();
  await page.getByTestId('settings-open').click();
  await expect(page.getByTestId('app-version')).toHaveText(/^[0-9a-f]{7}$/);
});
