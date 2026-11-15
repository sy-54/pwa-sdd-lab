import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/apps/shopping/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});

const items = (page: Page) => page.getByTestId('shopping-item');
const names = async (page: Page) => (await page.getByTestId('item-name').allTextContents()).map((t) => t.trim());

async function add(page: Page, name: string, qty?: string) {
  const before = await items(page).count();
  await page.getByTestId('new-item-name').fill(name);
  if (qty !== undefined) await page.getByTestId('new-item-qty').fill(qty);
  await page.getByTestId('new-item-name').blur(); // 入力を確定してから押す
  await page.getByTestId('add').click();
  await expect(items(page)).toHaveCount(before + 1);
}

/** 不正な入力を試みる（入力できない・押せない実装でもよい） */
async function tryAdd(page: Page, name: string, qty?: string) {
  await page.getByTestId('new-item-name').fill(name, { timeout: 1000 }).catch(() => {});
  if (qty !== undefined) await page.getByTestId('new-item-qty').fill(qty, { timeout: 1000 }).catch(() => {});
  await page.getByTestId('add').click({ force: true, timeout: 1000 }).catch(() => {});
  await page.waitForTimeout(300);
}

test('manifest.json がある', async ({ request }) => {
  expect((await (await request.get('/apps/shopping/manifest.json')).json()).id).toBe('shopping');
});

test('最初は項目がなく、未購入件数は 0', async ({ page }) => {
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('remaining-count')).toHaveText('0');
});

test('登録すると一覧に反映され、未購入件数が増える', async ({ page }) => {
  await add(page, '牛乳', '2');
  await add(page, 'パン', '1');
  expect((await names(page)).sort()).toEqual(['パン', '牛乳'].sort());
  await expect(page.getByTestId('remaining-count')).toHaveText('2');
});

test('数量を入力しないと 1 個として登録される', async ({ page }) => {
  await add(page, '卵');
  await expect(items(page).filter({ hasText: '卵' }).getByTestId('item-qty')).toHaveText('1');
});

test('追加後は商品名・数量の入力欄が空になる', async ({ page }) => {
  await add(page, '牛乳', '2');
  await expect(page.getByTestId('new-item-name')).toHaveValue('');
  await expect(page.getByTestId('new-item-qty')).toHaveValue('');
});

test('買った（チェック）にすると、未購入件数が減る', async ({ page }) => {
  await add(page, '牛乳', '2');
  await add(page, 'パン', '1');
  await items(page).filter({ hasText: '牛乳' }).getByTestId('item-toggle').check();
  await expect(page.getByTestId('remaining-count')).toHaveText('1');
});

test('削除すると一覧と未購入件数から消える', async ({ page }) => {
  await add(page, '牛乳', '2');
  await add(page, 'パン', '1');
  await items(page).filter({ hasText: '牛乳' }).getByTestId('item-delete').click();
  await expect(items(page)).toHaveCount(1);
  await expect(page.getByTestId('remaining-count')).toHaveText('1');
});

test('再読み込みしても内容が残る', async ({ page }) => {
  await add(page, '牛乳', '2');
  await add(page, 'パン', '1');
  await page.waitForTimeout(300);
  await page.reload();
  await expect(items(page)).toHaveCount(2);
  await expect(page.getByTestId('remaining-count')).toHaveText('2');
});

test('[意図] 新しい項目は一番下に追加される', async ({ page }) => {
  await add(page, '牛乳');
  await add(page, 'パン');
  await add(page, '卵');
  expect(await names(page)).toEqual(['牛乳', 'パン', '卵']);
});

test('[意図] 買った（チェック）にしても並び順は変わらない', async ({ page }) => {
  await add(page, '牛乳');
  await add(page, 'パン');
  await add(page, '卵');
  await items(page).filter({ hasText: 'パン' }).getByTestId('item-toggle').check();
  expect(await names(page)).toEqual(['牛乳', 'パン', '卵']);
});

test('[意図] 削除は確認なしで即座に消える', async ({ page }) => {
  await add(page, '牛乳');
  const delBtn = items(page).filter({ hasText: '牛乳' }).getByTestId('item-delete');
  await delBtn.click();
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('sdk-confirm-ok')).toHaveCount(0);
});

test('[意図] 商品名が空・空白だけのときは追加されない', async ({ page }) => {
  for (const bad of ['', '   ']) {
    await tryAdd(page, bad, '1');
    await expect(items(page), `「${bad}」は追加されない`).toHaveCount(0);
  }
});

test('[意図] 不正な数量（0・負・小数・文字）は追加されず、トーストで知らせる', async ({ page }) => {
  for (const bad of ['0', '-1', '1.5', 'abc']) {
    await tryAdd(page, 'バナナ', bad);
    await expect(items(page), `数量「${bad}」は追加されない`).toHaveCount(0);
  }
  await tryAdd(page, 'バナナ', '0');
  await expect(page.getByTestId('sdk-toast')).toBeVisible();
});
