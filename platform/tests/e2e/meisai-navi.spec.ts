import { expect, test, type Page } from '@playwright/test';

const HEAD = '"利用日","利用店名・商品名","利用者","支払方法","利用金額","支払手数料","支払総額","11月支払金額","12月繰越残高","新規サイン"';
const line = (d: string, n: string, a: string, pay = '1回払い', fee = '0') => `"${d}","${n}","本人","${pay}","${a}","${fee}","${a}","${a}","0","*"`;
const csv = (...lines: string[]) => Buffer.from('\uFEFF' + [HEAD, ...lines].join('\r\n') + '\r\n', 'utf8');
// 楽天e-NAVIと同じく、店名は半角カナで入っている想定
const BASIC = csv(line('2026/10/01', 'ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ', '1,234'), line('2026/10/02', 'ｶﾞｽﾄ', '980'), line('2026/10/03', 'NETFLIX.COM', '1,590'));
// AC-01 と同じ内容（店名は全角）を Shift_JIS（CP932）で保存したもの
const BASIC_SJIS = Buffer.from('IpeYl3CT+iIsIpeYl3CTWJa8gUWPpJVplrwiLCKXmJdwjtIiLCKOeJWllfuWQCIsIpeYl3CL4Ip6IiwijniVpY7okJSXvyIsIo54laWRjYp6IiwiMTGMjo54laWL4Ip6IiwiMTKMjoxKiXqOY42CIiwikFaLS4NUg0ODkyINCiIyMDI2LzEwLzAxIiwig1qDdYOTLYNDg4yDdYOTIiwilnuQbCIsIjGJ8ZWlgqIiLCIxLDIzNCIsIjAiLCIxLDIzNCIsIjEsMjM0IiwiMCIsIioiDQoiMjAyNi8xMC8wMiIsIoNLg1iDZyIsIpZ7kGwiLCIxifGVpYKiIiwiOTgwIiwiMCIsIjk4MCIsIjk4MCIsIjAiLCIqIg0KIjIwMjYvMTAvMDMiLCJORVRGTElYLkNPTSIsIpZ7kGwiLCIxifGVpYKiIiwiMSw1OTAiLCIwIiwiMSw1OTAiLCIxLDU5MCIsIjAiLCIqIg0K', 'base64');

async function load(page: Page, buffer: Buffer, name = 'enavi202610.csv') {
  await page.getByTestId('tab-data').click();
  await page.getByTestId('csv-file').setInputFiles({ name, mimeType: 'text/csv', buffer });
}
const row = (page: Page, shop: string) => page.getByTestId('tx-row').filter({ has: page.getByTestId('tx-name').getByText(shop, { exact: true }) });
const category = (page: Page, id: string) => page.locator(`[data-testid="category-row"][data-cat="${id}"]`);
const editOf = (page: Page, id: string) => page.locator(`[data-testid="category-edit"][data-id="${id}"]`);

test.beforeEach(async ({ page }) => {
  page.on('pageerror', (e) => console.log('pageerror:', e.message));
  await page.goto('apps/meisai-navi/');
  await expect(page.getByTestId('app-root')).toBeVisible();
  await expect(page.getByTestId('tab-home')).toHaveAttribute('aria-current', 'page');
});

test('AC-01 CSVを読み込むと合計が出る', async ({ page }) => {
  await expect(page.getByTestId('empty-guide')).toBeVisible();
  await load(page, BASIC);
  await expect(page.getByTestId('import-message')).toHaveText('1ファイル・3件を読み込みました。');
  await page.getByTestId('tab-home').click();
  await expect(page.getByTestId('total')).toHaveText('3,804');
  await expect(page.getByTestId('count')).toHaveText('3');
});

test('AC-02 費目ごとの金額と割合', async ({ page }) => {
  await load(page, BASIC);
  await page.getByTestId('tab-home').click();
  await expect(page.getByTestId('category-row')).toHaveCount(3);
  expect(await page.getByTestId('category-row').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.cat))).toEqual(['subs', 'food', 'dining']);
  await expect(category(page, 'food').getByTestId('category-amount')).toHaveText('1,234');
  await expect(category(page, 'food').getByTestId('category-share')).toHaveText('32.4%');
  await expect(category(page, 'subs').getByTestId('category-share')).toHaveText('41.8%');
});

test('AC-03 月で切り替える', async ({ page }) => {
  await load(page, csv(line('2026/09/10', 'A商店', '500'), line('2026/10/05', 'B商店', '800'), line('2026/08/20', 'C商店', '300')));
  await page.getByTestId('tab-home').click();
  await expect(page.getByTestId('total')).toHaveText('1,600');
  expect(await page.getByTestId('month-chip').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.month))).toEqual(['all', '2026-10', '2026-09', '2026-08']);
  await page.locator('[data-testid="month-chip"][data-month="2026-09"]').click();
  await expect(page.getByTestId('total')).toHaveText('500');
  await expect(page.locator('[data-testid="month-chip"][data-month="2026-09"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-testid="month-chip"][data-month="all"]').click();
  await expect(page.getByTestId('total')).toHaveText('1,600');
});

test('AC-04 手数料の節約ポイント', async ({ page }) => {
  await load(page, csv(line('2026/10/01', 'ﾄﾞｺﾓご利用料金', '7,480'), line('2026/10/12', 'ﾔﾏﾀﾞﾃﾞﾝｷ', '64,800', '分割6回払い', '1,296'), line('2026/10/15', 'UBER *EATS', '2,400')));
  await page.getByTestId('tab-tips').click();
  await expect(page.getByTestId('tip').first()).toHaveAttribute('data-kind', 'fee');
  await expect(page.getByTestId('tip').first().getByTestId('tip-saving')).toContainText('1,296');
  expect(await page.getByTestId('tip').evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.kind))).toEqual(['fee', 'tel', 'deli']);
  await expect(page.getByTestId('tip-total')).toHaveText('4,740'); // 1,296 + 7,480×0.3 + 2,400×0.5
});

const KAWAMURA = csv(line('2026/10/01', '個人商店カワムラ', '600'), line('2026/10/05', '個人商店カワムラ', '900'), line('2026/10/06', 'ｶﾞｽﾄ', '980'));

test('AC-05 店ごとに費目を修正する', async ({ page }) => {
  await load(page, KAWAMURA);
  await page.getByTestId('tab-list').click();
  await expect(row(page, '個人商店カワムラ').getByTestId('tx-category')).toHaveText(['その他', 'その他']);
  await row(page, '個人商店カワムラ').first().click();
  await page.locator('[data-testid="category-option"][data-cat="food"]').click();
  await expect(page.getByTestId('category-option')).toHaveCount(9);
  await expect(page.getByTestId('category-option').first()).toBeHidden();
  await expect(row(page, '個人商店カワムラ').getByTestId('tx-category')).toHaveText(['食料品', '食料品']);
  await expect(row(page, 'ガスト').getByTestId('tx-category')).toHaveText('外食・カフェ');
  await page.getByTestId('tab-home').click();
  await expect(category(page, 'food').getByTestId('category-amount')).toHaveText('1,500');
});

test('AC-06 開き直しても残る', async ({ page }) => {
  await load(page, KAWAMURA);
  await page.getByTestId('tab-list').click();
  await row(page, '個人商店カワムラ').first().click();
  await page.locator('[data-testid="category-option"][data-cat="food"]').click();
  await expect(row(page, '個人商店カワムラ').getByTestId('tx-category')).toHaveText(['食料品', '食料品']);
  await page.reload();
  await page.getByTestId('tab-list').click();
  await expect(page.getByTestId('tx-row')).toHaveCount(3);
  await expect(row(page, '個人商店カワムラ').getByTestId('tx-category')).toHaveText(['食料品', '食料品']);
});

test('AC-07 同じファイル名は置き換える', async ({ page }) => {
  await load(page, BASIC);
  await expect(page.getByTestId('file-row')).toHaveCount(1);
  await load(page, BASIC);
  await expect(page.getByTestId('import-message')).toHaveText('1ファイル・3件を読み込みました。');
  await expect(page.getByTestId('file-row')).toHaveCount(1);
  await page.getByTestId('tab-home').click();
  await expect(page.getByTestId('total')).toHaveText('3,804');
  // 別のファイル名なら追加される
  await load(page, csv(line('2026/09/10', 'A商店', '500')), 'enavi202609.csv');
  await expect(page.getByTestId('file-row')).toHaveCount(2);
  await page.getByTestId('tab-home').click();
  await expect(page.getByTestId('total')).toHaveText('4,304');
});

test('AC-08 ファイルを削除する', async ({ page }) => {
  await load(page, BASIC);
  await page.getByTestId('file-delete').click();
  await expect(page.getByTestId('file-row')).toHaveCount(0);
  await page.getByTestId('tab-home').click();
  await expect(page.getByTestId('empty-guide')).toBeVisible();
  await expect(page.getByTestId('total')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('empty-guide')).toBeVisible();
  await page.getByTestId('go-import').click();
  await expect(page.getByTestId('tab-data')).toHaveAttribute('aria-current', 'page');
});

test('AC-09 すべて消す', async ({ page }) => {
  await load(page, BASIC);
  await page.getByTestId('clear-all').click();
  await page.getByTestId('sdk-confirm-cancel').click();
  await page.reload();
  await page.getByTestId('tab-data').click();
  await expect(page.getByTestId('file-row')).toHaveCount(1);
  await page.getByTestId('clear-all').click();
  await page.getByTestId('sdk-confirm-ok').click();
  await expect(page.getByTestId('file-row')).toHaveCount(0);
  await page.reload();
  await page.getByTestId('tab-data').click();
  await expect(page.getByTestId('file-row')).toHaveCount(0);
});

test('AC-10 費目を追加して使う', async ({ page }) => {
  await load(page, BASIC);
  await page.getByTestId('category-name').fill('ペット');
  await page.getByTestId('category-add').click();
  await expect(page.getByTestId('category-edit')).toHaveCount(10);
  await expect(page.getByTestId('category-name')).toHaveValue('');
  await page.getByTestId('tab-list').click();
  await row(page, 'ガスト').click();
  const option = page.getByTestId('category-option').filter({ hasText: 'ペット' });
  await expect(option).toHaveCount(1);
  await option.click();
  await expect(row(page, 'ガスト').getByTestId('tx-category')).toHaveText('ペット');
  await page.reload();
  await page.getByTestId('tab-list').click();
  await expect(row(page, 'ガスト').getByTestId('tx-category')).toHaveText('ペット');
});

test('AC-11 費目を改名する', async ({ page }) => {
  await load(page, BASIC);
  await editOf(page, 'food').fill('食費');
  await editOf(page, 'food').blur();
  await page.getByTestId('tab-list').click();
  await expect(row(page, 'セブン-イレブン').getByTestId('tx-category')).toHaveText('食費');
  await page.reload();
  await page.getByTestId('tab-data').click();
  await expect(editOf(page, 'food')).toHaveValue('食費');
});

test('AC-12 読めないCSV', async ({ page }) => {
  await load(page, BASIC);
  await load(page, Buffer.from('日付,内容,金額\n2026/10/01,A,100\n', 'utf8'), 'bad.csv');
  await expect(page.getByTestId('import-message')).toContainText('bad.csv');
  await expect(page.getByTestId('import-message')).toContainText('利用日');
  await expect(page.getByTestId('file-row')).toHaveCount(1);
  await page.reload();
  await expect(page.getByTestId('total')).toHaveText('3,804');
  // 読めるものと混ぜて選ぶと、読めたものだけ取り込む
  await page.getByTestId('tab-data').click();
  await page.getByTestId('csv-file').setInputFiles([
    { name: 'bad.csv', mimeType: 'text/csv', buffer: Buffer.from('利用日,メモ\n2026/10/01,A\n', 'utf8') },
    { name: 'enavi202609.csv', mimeType: 'text/csv', buffer: csv(line('2026/09/10', 'A商店', '500')) },
  ]);
  await expect(page.getByTestId('import-message')).toContainText('1ファイル・1件を読み込みました。');
  await expect(page.getByTestId('import-message')).toContainText('bad.csv：');
  await expect(page.getByTestId('file-row')).toHaveCount(2);
});

test('AC-12 壊れた保存データは明細0件として開く', async ({ page }) => {
  await load(page, BASIC);
  await expect(page.getByTestId('file-row')).toHaveCount(1);
  // SDK の保存領域にある state を、形の違う値で上書きする
  await page.evaluate(async () => {
    const { storage } = await import('../../sdk/sdk.js');
    await storage.set('state', { files: 'こわれた値' });
  });
  await page.reload();
  await expect(page.getByTestId('empty-guide')).toBeVisible();
  await page.getByTestId('tab-data').click();
  await expect(page.getByTestId('category-edit')).toHaveCount(9);
});

test('AC-13 Shift_JIS のCSV', async ({ page }) => {
  await load(page, BASIC_SJIS);
  await expect(page.getByTestId('import-message')).toHaveText('1ファイル・3件を読み込みました。');
  await page.getByTestId('tab-list').click();
  await expect(page.getByTestId('tx-name')).toHaveText(['NETFLIX.COM', 'ガスト', 'セブン-イレブン']);
  await expect(page.getByTestId('tx-amount')).toHaveText(['1,590', '980', '1,234']);
});

test('AC-14 明細で探す・しぼる', async ({ page }) => {
  await load(page, BASIC);
  await page.getByTestId('tab-list').click();
  await expect(page.getByTestId('tx-row')).toHaveCount(3);
  await page.getByTestId('tx-search').fill('ガスト');
  await expect(page.getByTestId('tx-row')).toHaveCount(1);
  await expect(page.getByTestId('tx-name')).toHaveText('ガスト');
  await page.getByTestId('tx-search').fill('');
  await page.getByTestId('tx-filter').selectOption('subs');
  await expect(page.getByTestId('tx-row')).toHaveCount(1);
  await expect(page.getByTestId('tx-name')).toHaveText('NETFLIX.COM');
  // 内訳の費目の行から来ると、その費目でしぼられている
  await page.getByTestId('tab-home').click();
  await category(page, 'dining').click();
  await expect(page.getByTestId('tx-filter')).toHaveValue('dining');
  await expect(page.getByTestId('tx-name')).toHaveText('ガスト');
});

test('AC-15 費目名が空・重複', async ({ page }) => {
  await page.getByTestId('tab-data').click();
  await expect(page.getByTestId('category-edit')).toHaveCount(9);
  for (const name of ['', '   ', '　', '食料品', ' その他 ']) {
    await page.getByTestId('sdk-toast').evaluateAll((els) => els.forEach((e) => e.remove()));
    await page.getByTestId('category-name').fill(name);
    await page.getByTestId('category-add').click();
    await expect(page.getByTestId('sdk-toast')).toBeVisible();
    await expect(page.getByTestId('category-edit')).toHaveCount(9);
  }
  // 改名でも同じ。元の名前に戻る
  await editOf(page, 'food').fill('その他');
  await editOf(page, 'food').blur();
  await expect(editOf(page, 'food')).toHaveValue('食料品');
  await page.reload();
  await page.getByTestId('tab-data').click();
  await expect(page.getByTestId('category-edit')).toHaveCount(9);
  await expect(editOf(page, 'food')).toHaveValue('食料品');
});

test('AC-15 費目は全部で12まで', async ({ page }) => {
  await page.getByTestId('tab-data').click();
  for (const name of ['ペット', '推し活', '園芸']) {
    await page.getByTestId('category-name').fill(name);
    await page.getByTestId('category-add').click();
  }
  await expect(page.getByTestId('category-edit')).toHaveCount(12);
  await page.getByTestId('category-name').fill('13個目');
  await page.getByTestId('category-add').click();
  await expect(page.getByTestId('sdk-toast')).toBeVisible();
  await expect(page.getByTestId('category-edit')).toHaveCount(12);
});

test('AC-16 費目を削除する', async ({ page }) => {
  await load(page, BASIC);
  await expect(page.locator('[data-testid="category-delete"][data-id="other"]')).toHaveCount(0);
  await page.locator('[data-testid="category-delete"][data-id="food"]').click();
  await page.getByTestId('sdk-confirm-cancel').click();
  await expect(page.getByTestId('category-edit')).toHaveCount(9);
  await page.locator('[data-testid="category-delete"][data-id="food"]').click();
  await page.getByTestId('sdk-confirm-ok').click();
  await expect(page.getByTestId('category-edit')).toHaveCount(8);
  await page.getByTestId('tab-list').click();
  await expect(row(page, 'セブン-イレブン').getByTestId('tx-category')).toHaveText('その他');
  await page.reload();
  await page.getByTestId('tab-data').click();
  await expect(page.getByTestId('category-edit')).toHaveCount(8);
});
