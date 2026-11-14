import { expect, test } from '@playwright/test';

// 時計を偽装し、実時間を待たずに進める
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-14T09:00:00') });
  await page.goto('/apps/timer/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});
const time = (page) => page.getByTestId('time');
const sec = (page, s: number) => page.clock.runFor(s * 1000);

test('manifest.json がある', async ({ request }) => {
  const m = await (await request.get('/apps/timer/manifest.json')).json();
  expect(m.id).toBe('timer');
  expect(typeof m.name).toBe('string');
});

test('分を指定して開始すると 1 秒ずつ減る', async ({ page }) => {
  await page.getByTestId('minutes').fill('5');
  await page.getByTestId('start').click();
  await sec(page, 1);
  await expect(time(page)).toHaveText('04:59');
  await sec(page, 59);
  await expect(time(page)).toHaveText('04:00');
});

test('一時停止で止まり、開始で続きから再開する', async ({ page }) => {
  await page.getByTestId('minutes').fill('2');
  await page.getByTestId('start').click();
  await sec(page, 10);
  await page.getByTestId('pause').click();
  await sec(page, 30);
  await expect(time(page)).toHaveText('01:50');
  await page.getByTestId('start').click();
  await sec(page, 5);
  await expect(time(page)).toHaveText('01:45');
});

test('リセットで止まり、指定した分数に戻る', async ({ page }) => {
  await page.getByTestId('minutes').fill('2');
  await page.getByTestId('start').click();
  await sec(page, 10);
  await page.getByTestId('reset').click();
  await expect(time(page)).toHaveText('02:00');
  await sec(page, 5);
  await expect(time(page)).toHaveText('02:00');
});

test('時間になると 00:00 で止まり、終了が表示される', async ({ page }) => {
  await expect(page.getByTestId('done')).toBeHidden();
  await page.getByTestId('minutes').fill('1');
  await page.getByTestId('start').click();
  await sec(page, 60);
  await expect(time(page)).toHaveText('00:00');
  await expect(page.getByTestId('done')).toBeVisible();
  await sec(page, 5);
  await expect(time(page)).toHaveText('00:00');
});

test('[意図] 最初は 3 分がセットされている', async ({ page }) => {
  await expect(time(page)).toHaveText('03:00');
  await expect(page.getByTestId('minutes')).toHaveValue('3');
});

test('[意図] 0 分では開始しない', async ({ page }) => {
  await page.getByTestId('minutes').fill('0');
  await page.getByTestId('start').click({ force: true, timeout: 1000 }).catch(() => {});
  await sec(page, 3);
  await expect(page.getByTestId('done')).toBeHidden();
  await expect(time(page)).toHaveText('00:00');
});

test('[意図] 時間になったら SDK の通知で知らせる（テスト環境ではトースト）', async ({ page }) => {
  await page.getByTestId('minutes').fill('1');
  await page.getByTestId('start').click();
  await sec(page, 60);
  await expect(page.getByTestId('sdk-toast')).toBeVisible();
});

test('[意図] 終了後にリセットすると終了の表示が消える', async ({ page }) => {
  await page.getByTestId('minutes').fill('1');
  await page.getByTestId('start').click();
  await sec(page, 60);
  await expect(page.getByTestId('done')).toBeVisible();
  await page.getByTestId('reset').click();
  await expect(page.getByTestId('done')).toBeHidden();
  await expect(time(page)).toHaveText('01:00');
});
