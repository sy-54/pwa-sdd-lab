import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/apps/todo/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});
const items = (page: Page) => page.getByTestId('todo-item');
const texts = async (page: Page) => (await page.getByTestId('todo-text').allTextContents()).map((t) => t.trim());
async function add(page: Page, text: string) {
  const before = await items(page).count();
  await page.getByTestId('new-todo').fill(text);
  await page.getByTestId('new-todo').blur(); // 入力を確定してから押す（入力直後のクリックは実装の細部に依存する）
  await page.getByTestId('add').click();
  await expect(items(page)).toHaveCount(before + 1);
}

test('manifest.json がある', async ({ request }) => {
  expect((await (await request.get('/apps/todo/manifest.json')).json()).id).toBe('todo');
});

test('最初は 0 件', async ({ page }) => {
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('todo-count')).toHaveText('0');
});

test('追加すると項目と残り件数が増える', async ({ page }) => {
  await add(page, '牛乳を買う');
  await add(page, '洗濯');
  expect((await texts(page)).sort()).toEqual(['洗濯', '牛乳を買う'].sort());
  await expect(page.getByTestId('todo-count')).toHaveText('2');
});

test('完了にすると残り件数が減り、戻すと増える', async ({ page }) => {
  await add(page, '牛乳を買う');
  await add(page, '洗濯');
  const toggle = items(page).filter({ hasText: '洗濯' }).getByTestId('todo-toggle');
  await toggle.check();
  await expect(page.getByTestId('todo-count')).toHaveText('1');
  await toggle.uncheck();
  await expect(page.getByTestId('todo-count')).toHaveText('2');
});

test('再読み込みしても項目と完了状態が残る', async ({ page }) => {
  await add(page, '牛乳を買う');
  await add(page, '洗濯');
  await items(page).filter({ hasText: '洗濯' }).getByTestId('todo-toggle').check();
  await expect(page.getByTestId('todo-count')).toHaveText('1');
  await page.reload();
  await expect(items(page)).toHaveCount(2);
  await expect(items(page).filter({ hasText: '洗濯' }).getByTestId('todo-toggle')).toBeChecked();
  await expect(items(page).filter({ hasText: '牛乳を買う' }).getByTestId('todo-toggle')).not.toBeChecked();
  await expect(page.getByTestId('todo-count')).toHaveText('1');
});

test('[意図] 削除は確認なしで即座に消える', async ({ page }) => {
  await add(page, '牛乳を買う');
  await add(page, '洗濯');
  await items(page).filter({ hasText: '牛乳を買う' }).getByTestId('todo-delete').click();
  await expect(items(page)).toHaveCount(1);
  expect(await texts(page)).toEqual(['洗濯']);
  await page.reload();
  await expect(items(page)).toHaveCount(1);
});

test('[意図] 新しい項目は一番下に追加され、完了にしても順番は変わらない', async ({ page }) => {
  await add(page, 'A');
  await add(page, 'B');
  await add(page, 'C');
  expect(await texts(page)).toEqual(['A', 'B', 'C']);
  await items(page).filter({ hasText: 'A' }).getByTestId('todo-toggle').check();
  await expect(page.getByTestId('todo-count')).toHaveText('2');
  expect(await texts(page)).toEqual(['A', 'B', 'C']);
});

test('[意図] 空欄・空白だけでは追加されず、前後の空白は取り除く', async ({ page }) => {
  await page.getByTestId('add').click({ force: true, timeout: 1000 }).catch(() => {});
  await page.getByTestId('new-todo').fill('   ');
  await page.getByTestId('add').click({ force: true, timeout: 1000 }).catch(() => {});
  await expect(items(page)).toHaveCount(0);
  await add(page, '  牛乳  ');
  expect(await page.getByTestId('todo-text').first().textContent()).toBe('牛乳');
});

test('[意図] Enter キーでも追加でき、入力欄は空になる', async ({ page }) => {
  await page.getByTestId('new-todo').fill('牛乳を買う');
  await page.getByTestId('new-todo').press('Enter');
  await expect(items(page)).toHaveCount(1);
  await expect(page.getByTestId('new-todo')).toHaveValue('');
});
