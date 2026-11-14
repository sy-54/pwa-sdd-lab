import { expect, test, type Page } from '@playwright/test';

// 時計を偽装し、日付をまたぐ挙動を確かめる。開始は 11/10（火）21:00
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-10T21:00:00') });
  await page.goto('/apps/habit/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});
const items = (page: Page) => page.getByTestId('habit-item');
const item = (page: Page, name: string) => items(page).filter({ hasText: name });
const check = (page: Page, name: string) => item(page, name).getByTestId('habit-check');
const streak = (page: Page, name: string) => item(page, name).getByTestId('habit-streak');
async function add(page: Page, name: string) {
  const before = await items(page).count();
  await page.getByTestId('new-habit').fill(name);
  await page.getByTestId('new-habit').blur(); // 入力を確定してから押す
  await page.getByTestId('add-habit').click();
  await expect(items(page)).toHaveCount(before + 1);
}
/** 保存を待ってから、指定した日数だけ時計を進めて開き直す */
async function nextDay(page: Page, days = 1) {
  await page.waitForTimeout(300);
  await page.clock.fastForward(days * 24 * 60 * 60 * 1000);
  await page.reload();
  await expect(page.getByTestId('app-root')).toBeVisible();
}

test('manifest.json がある', async ({ request }) => {
  expect((await (await request.get('/apps/habit/manifest.json')).json()).id).toBe('habit');
});

test('追加した習慣は未チェックで連続 0 日', async ({ page }) => {
  await add(page, '筋トレ');
  await expect(item(page, '筋トレ').getByTestId('habit-name')).toHaveText('筋トレ');
  await expect(check(page, '筋トレ')).not.toBeChecked();
  await expect(streak(page, '筋トレ')).toHaveText('0');
});

test('今日チェックすると連続 1 日、外すと 0 日', async ({ page }) => {
  await add(page, '筋トレ');
  await check(page, '筋トレ').check();
  await expect(streak(page, '筋トレ')).toHaveText('1');
  await check(page, '筋トレ').uncheck();
  await expect(streak(page, '筋トレ')).toHaveText('0');
});

test('習慣ごとに別々に記録され、再読み込みしても残る', async ({ page }) => {
  await add(page, '筋トレ');
  await add(page, '読書');
  await check(page, '読書').check();
  await expect(streak(page, '読書')).toHaveText('1');
  await page.waitForTimeout(300);
  await page.reload();
  await expect(items(page)).toHaveCount(2);
  await expect(check(page, '読書')).toBeChecked();
  await expect(streak(page, '読書')).toHaveText('1');
  await expect(check(page, '筋トレ')).not.toBeChecked();
  await expect(streak(page, '筋トレ')).toHaveText('0');
});

test('毎日続けると連続日数が増える', async ({ page }) => {
  await add(page, '筋トレ');
  await check(page, '筋トレ').check();
  await nextDay(page);
  await expect(check(page, '筋トレ')).not.toBeChecked();
  await check(page, '筋トレ').check();
  await expect(streak(page, '筋トレ')).toHaveText('2');
  await nextDay(page);
  await check(page, '筋トレ').check();
  await expect(streak(page, '筋トレ')).toHaveText('3');
});

test('1日空くと連続は 0 に戻り、再開すると 1 から', async ({ page }) => {
  await add(page, '筋トレ');
  await check(page, '筋トレ').check();
  await nextDay(page, 2);
  await expect(check(page, '筋トレ')).not.toBeChecked();
  await expect(streak(page, '筋トレ')).toHaveText('0');
  await check(page, '筋トレ').check();
  await expect(streak(page, '筋トレ')).toHaveText('1');
});

test('[意図] 今日まだチェックしていなくても、昨日までの連続は途切れない', async ({ page }) => {
  await add(page, '筋トレ');
  await check(page, '筋トレ').check();
  await nextDay(page);
  await check(page, '筋トレ').check();
  await expect(streak(page, '筋トレ')).toHaveText('2');
  await nextDay(page);
  await expect(check(page, '筋トレ')).not.toBeChecked();
  await expect(streak(page, '筋トレ')).toHaveText('2');
  await check(page, '筋トレ').check();
  await expect(streak(page, '筋トレ')).toHaveText('3');
  await check(page, '筋トレ').uncheck();
  await expect(streak(page, '筋トレ')).toHaveText('2');
});

test('[意図] 日付の変わり目は深夜 0:00（21時→翌1時で翌日になる）', async ({ page }) => {
  await add(page, '筋トレ');
  await check(page, '筋トレ').check();
  await page.waitForTimeout(300);
  await page.clock.fastForward(4 * 60 * 60 * 1000);
  await page.reload();
  await expect(check(page, '筋トレ')).not.toBeChecked();
  await check(page, '筋トレ').check();
  await expect(streak(page, '筋トレ')).toHaveText('2');
});

test('[意図] 同じ名前・空欄の習慣は追加できない', async ({ page }) => {
  await add(page, '筋トレ');
  await page.getByTestId('new-habit').fill('筋トレ');
  await page.getByTestId('add-habit').click({ force: true, timeout: 1000 }).catch(() => {});
  await page.getByTestId('new-habit').fill('  ');
  await page.getByTestId('add-habit').click({ force: true, timeout: 1000 }).catch(() => {});
  await page.waitForTimeout(300);
  await expect(items(page)).toHaveCount(1);
});

test('[意図] 削除は確認（SDK の確認ダイアログ）の後に消え、新しい習慣は一番下', async ({ page }) => {
  await add(page, '筋トレ');
  await add(page, '読書');
  await add(page, '早起き');
  expect((await page.getByTestId('habit-name').allTextContents()).map((t) => t.trim())).toEqual(['筋トレ', '読書', '早起き']);
  await item(page, '読書').getByTestId('habit-delete').click();
  await page.getByTestId('sdk-confirm-cancel').click();
  await expect(items(page)).toHaveCount(3);
  await item(page, '読書').getByTestId('habit-delete').click();
  await page.getByTestId('sdk-confirm-ok').click();
  await expect(items(page)).toHaveCount(2);
  await page.waitForTimeout(300);
  await page.reload();
  await expect(items(page)).toHaveCount(2);
});
