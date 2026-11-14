import { expect, test } from '@playwright/test';

test('AC-01 一覧に manifest の名前とアイコンが表示される', async ({ page }) => {
  await page.goto('');
  await expect(page.getByTestId('app-tile-demo')).toContainText('SDKデモ');
  await expect(page.getByTestId('app-tile-demo')).toContainText('🧪');
  await expect(page.getByTestId('app-empty')).toBeHidden();
});

test('AC-01 アプリが0件なら「アプリがありません」', async ({ page }) => {
  await page.route('**/apps.json', (r) => r.fulfill({ json: [] }));
  await page.goto('');
  await expect(page.getByTestId('app-empty')).toHaveText('アプリがありません');
  await expect(page.getByTestId('app-list').locator('a')).toHaveCount(0);
});

test('AC-02 起動して戻る', async ({ page }) => {
  await page.goto('');
  await page.getByTestId('app-tile-demo').click();
  await expect(page).toHaveURL(/\/apps\/demo\/$/);
  await expect(page.getByTestId('app-root')).toBeVisible();
  await expect(page.getByTestId('sdk-header')).toContainText('SDKデモ');
  await page.getByTestId('sdk-home').click();
  await expect(page.getByTestId('app-list')).toBeVisible();
  await expect(page.getByTestId('app-tile-demo')).toBeVisible();
});

test('AC-14 ホーム画面に追加できる（manifest とアイコン）', async ({ page, request }) => {
  await page.goto('');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const manifestUrl = new URL(href!, page.url());
  const manifest = await (await request.get(manifestUrl.href)).json();
  expect(manifest.display).toBe('standalone');
  expect(manifest.start_url).toBe('./'); // サブパス公開のため相対パス
  const big = manifest.icons.filter((i: { sizes: string }) => parseInt(i.sizes) >= 180);
  expect(big.length).toBeGreaterThan(0);
  for (const icon of big) {
    const res = await request.get(new URL(icon.src, manifestUrl).href);
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toBe('image/png');
  }
  const touch = await page.locator('link[rel="apple-touch-icon"]').getAttribute('href');
  expect((await request.get(new URL(touch!, page.url()).href)).status()).toBe(200);
});
