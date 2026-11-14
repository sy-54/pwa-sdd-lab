import { expect, test } from '@playwright/test';

const count = (page) => page.getByTestId('count');
test.beforeEach(async ({ page }) => {
  await page.goto('/apps/counter/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});

test('初期値は 0', async ({ page }) => {
  await expect(count(page)).toHaveText('0');
});

test('inc で 1 ずつ増える', async ({ page }) => {
  for (let i = 0; i < 3; i++) await page.getByTestId('inc').click();
  await expect(count(page)).toHaveText('3');
});

test('dec で 1 減る', async ({ page }) => {
  await page.getByTestId('inc').click();
  await page.getByTestId('inc').click();
  await page.getByTestId('dec').click();
  await expect(count(page)).toHaveText('1');
});

test('[意図] 0 未満にならない', async ({ page }) => {
  await page.getByTestId('dec').click({ force: true, timeout: 1000 }).catch(() => {});
  await expect(count(page)).toHaveText('0');
  await page.getByTestId('inc').click();
  await expect(count(page)).toHaveText('1');
});

test('[意図] reset は確認なしで即 0', async ({ page }) => {
  await page.getByTestId('inc').click();
  await page.getByTestId('inc').click();
  await page.getByTestId('reset').click();
  await expect(count(page)).toHaveText('0');
});

test('再読み込みしても値が残る', async ({ page }) => {
  await page.getByTestId('inc').click();
  await page.getByTestId('inc').click();
  await expect(count(page)).toHaveText('2');
  await page.reload();
  await expect(count(page)).toHaveText('2');
});

test('reset 後に再読み込みしても 0', async ({ page }) => {
  await page.getByTestId('inc').click();
  await page.getByTestId('reset').click();
  await expect(count(page)).toHaveText('0');
  await page.reload();
  await expect(count(page)).toHaveText('0');
});
