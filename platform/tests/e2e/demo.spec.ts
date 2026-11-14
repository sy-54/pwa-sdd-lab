import { expect, test, type Page } from '@playwright/test';
import { png } from './helpers.ts';

test.beforeEach(async ({ page }) => {
  await page.goto('apps/demo/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});

test('AC-03 保存したデータが残る', async ({ page }) => {
  await page.getByTestId('demo-memo').fill('牛乳');
  await page.getByTestId('demo-save').click();
  await expect(page.getByTestId('sdk-toast')).toBeVisible();
  await page.reload();
  await expect(page.getByTestId('demo-memo')).toHaveValue('牛乳');
});

test('AC-06 トーストが表示され、3秒後に消える', async ({ page }) => {
  await page.getByTestId('demo-toast').click();
  await expect(page.getByTestId('sdk-toast')).toHaveText('トーストです');
  await page.waitForTimeout(2000); // 3秒より前には消えないこと
  await expect(page.getByTestId('sdk-toast')).toBeVisible();
  await expect(page.getByTestId('sdk-toast')).toHaveCount(0);
});

test('AC-07 通知が出せないときはトーストで代替する', async ({ page }) => {
  // Playwright の WebKit は Notification 未対応（＝出せない状態）。許可済みでないことだけ確かめる
  expect(await page.evaluate(() => ('Notification' in window ? Notification.permission : 'unsupported'))).not.toBe('granted');
  await page.getByTestId('demo-notify').click();
  await expect(page.getByTestId('sdk-toast')).toContainText('通知のテストです');
  await expect(page.getByTestId('demo-notify-result')).toHaveText('トーストで代替しました');
});

const longSide = (page: Page) =>
  page.getByTestId('demo-photo-img').evaluate(async (img: HTMLImageElement) => {
    await img.decode();
    return Math.max(img.naturalWidth, img.naturalHeight);
  });

test('AC-08 写真を撮って表示する（長辺 1280px 以下、再読み込み後も残る）', async ({ page }) => {
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('demo-photo').click();
  await (await chooser).setFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png(3000, 2000) });
  await expect(page.getByTestId('demo-photo-img')).toBeVisible();
  expect(await longSide(page)).toBe(1280);
  await page.reload();
  await expect(page.getByTestId('demo-photo-img')).toBeVisible();
  expect(await longSide(page)).toBe(1280);
});

test('AC-08 画像でないファイルはトーストで知らせる', async ({ page }) => {
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('demo-photo').click();
  await (await chooser).setFiles({ name: 'memo.txt', mimeType: 'text/plain', buffer: Buffer.from('これは画像ではない') });
  await expect(page.getByTestId('sdk-toast')).toHaveText('画像を読み込めませんでした');
  await expect(page.getByTestId('demo-photo-img')).toBeHidden();
});
