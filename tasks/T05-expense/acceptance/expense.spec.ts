import { expect, test, type Page } from '@playwright/test';

// 時計を偽装する。開始は 11/29 12:00
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-11-29T12:00:00') });
  await page.goto('/apps/expense/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});
const items = (page: Page) => page.getByTestId('expense-item');
const amounts = async (page: Page) => (await page.getByTestId('expense-amount').allTextContents()).map((t) => t.trim());
async function add(page: Page, amount: string, category?: string) {
  const before = await items(page).count();
  if (category) await page.getByTestId('category').selectOption(category);
  await page.getByTestId('amount').fill(amount);
  await page.getByTestId('amount').blur(); // 入力を確定してから押す
  await page.getByTestId('add').click();
  await expect(items(page)).toHaveCount(before + 1);
}
/** 不正な入力を試みる（入力できない・押せない実装でもよい） */
async function tryAdd(page: Page, amount: string) {
  await page.getByTestId('amount').fill(amount, { timeout: 1000 }).catch(() => {});
  await page.getByTestId('add').click({ force: true, timeout: 1000 }).catch(() => {});
  await page.waitForTimeout(300);
}

test('manifest.json がある', async ({ request }) => {
  expect((await (await request.get('/apps/expense/manifest.json')).json()).id).toBe('expense');
});

test('最初は記録がなく、合計は 0', async ({ page }) => {
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('total')).toHaveText('0');
});

test('記録すると一覧と今月の合計に反映される（3桁区切り）', async ({ page }) => {
  await add(page, '1200', 'food');
  await add(page, '350', 'transport');
  expect((await amounts(page)).sort()).toEqual(['1,200', '350'].sort());
  await expect(page.getByTestId('total')).toHaveText('1,550');
  await add(page, '1234567', 'other');
  await expect(page.getByTestId('total')).toHaveText('1,236,117');
});

test('分類の表示名が記録に出る', async ({ page }) => {
  await add(page, '500', 'daily');
  await add(page, '300', 'transport');
  await expect(items(page).filter({ hasText: '500' }).getByTestId('expense-category')).toHaveText('日用品');
  await expect(items(page).filter({ hasText: '300' }).getByTestId('expense-category')).toHaveText('交通');
});

test('再読み込みしても記録と合計が残る', async ({ page }) => {
  await add(page, '1200', 'food');
  await add(page, '350', 'transport');
  await page.waitForTimeout(300);
  await page.reload();
  await expect(items(page)).toHaveCount(2);
  await expect(page.getByTestId('total')).toHaveText('1,550');
});

test('[意図] 削除は確認（SDK の確認ダイアログ）の後に消え、合計も減る', async ({ page }) => {
  await add(page, '1200', 'food');
  await add(page, '350', 'transport');
  await items(page).filter({ hasText: '1,200' }).getByTestId('expense-delete').click();
  await page.getByTestId('sdk-confirm-cancel').click();
  await expect(items(page)).toHaveCount(2);
  await items(page).filter({ hasText: '1,200' }).getByTestId('expense-delete').click();
  await page.getByTestId('sdk-confirm-ok').click();
  await expect(items(page)).toHaveCount(1);
  await expect(page.getByTestId('total')).toHaveText('350');
});

test('[意図] 新しい記録が一番上', async ({ page }) => {
  await add(page, '100');
  await add(page, '200');
  await add(page, '300');
  expect(await amounts(page)).toEqual(['300', '200', '100']);
});

test('[意図] 不正な金額（空・0・負・小数・文字）は追加されず、トーストで知らせる', async ({ page }) => {
  for (const bad of ['', '0', '-500', '12.5', 'abc']) {
    await tryAdd(page, bad);
    await expect(items(page), `「${bad}」は追加されない`).toHaveCount(0);
  }
  await tryAdd(page, '0');
  await expect(page.getByTestId('sdk-toast')).toBeVisible();
  await expect(page.getByTestId('total')).toHaveText('0');
});

test('[意図] 最初の分類は食費。追加後は金額欄が空になる', async ({ page }) => {
  await expect(page.getByTestId('category')).toHaveValue('food');
  await add(page, '300', 'transport');
  await expect(page.getByTestId('amount')).toHaveValue('');
});

test('追加した後も、分類は直前の選択のまま（要求の Should）', async ({ page }) => {
  await add(page, '300', 'transport');
  await expect(page.getByTestId('category')).toHaveValue('transport');
});

test('[意図] 月が変わると、一覧も合計も今月の分だけになる', async ({ page }) => {
  await add(page, '1200', 'food');
  await page.waitForTimeout(300);
  await page.clock.fastForward(3 * 24 * 60 * 60 * 1000); // 12/2 へ
  await page.reload();
  await expect(page.getByTestId('app-root')).toBeVisible();
  await expect(page.getByTestId('total')).toHaveText('0');
  await expect(items(page)).toHaveCount(0);
  await add(page, '800', 'daily');
  await expect(page.getByTestId('total')).toHaveText('800');
});
