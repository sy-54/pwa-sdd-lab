import { test, expect } from '@playwright/test';

test('AC-01 初期表示：保存データがなければcountは0', async ({ page }) => {
  await page.goto('/apps/counter/');
  await expect(page.getByTestId('count')).toHaveText('0');
});

test('AC-02 incで増える', async ({ page }) => {
  await page.goto('/apps/counter/');
  await page.getByTestId('inc').click();
  await expect(page.getByTestId('count')).toHaveText('1');
});

test('AC-03 decは0未満にならない', async ({ page }) => {
  await page.goto('/apps/counter/');
  await page.getByTestId('dec').click();
  await expect(page.getByTestId('count')).toHaveText('0');
});

test('AC-04 resetで0に戻る', async ({ page }) => {
  await page.goto('/apps/counter/');
  await page.getByTestId('inc').click();
  await page.getByTestId('inc').click();
  await page.getByTestId('inc').click();
  await expect(page.getByTestId('count')).toHaveText('3');
  await page.getByTestId('reset').click();
  await expect(page.getByTestId('count')).toHaveText('0');
});

test('AC-05 再読み込みで値が残る', async ({ page }) => {
  await page.goto('/apps/counter/');
  await page.getByTestId('inc').click();
  await page.getByTestId('inc').click();
  await expect(page.getByTestId('count')).toHaveText('2');
  await page.reload();
  await expect(page.getByTestId('count')).toHaveText('2');
});

test('AC-06 壊れた保存データは0として初期化', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('counter:count', 'not-a-number');
  });
  await page.goto('/apps/counter/');
  await expect(page.getByTestId('count')).toHaveText('0');
  const stored = await page.evaluate(() => localStorage.getItem('counter:count'));
  expect(stored).toBe('0');
});
