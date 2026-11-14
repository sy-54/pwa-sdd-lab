import { expect, test, type Page } from '@playwright/test';
import { png } from './helpers.ts';

test.beforeEach(async ({ page }) => {
  await page.goto('/apps/books/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});
const items = (page: Page) => page.getByTestId('book-item');
const book = (page: Page, title: string) => items(page).filter({ hasText: title });
const titles = async (page: Page) => (await page.getByTestId('book-title').allTextContents()).map((t) => t.trim());
type Fields = { title?: string; status?: string; rating?: string; note?: string };
async function fill(page: Page, f: Fields) {
  await expect(page.getByTestId('book-form')).toBeVisible();
  if (f.title !== undefined) await page.getByTestId('form-title').fill(f.title);
  if (f.status) await page.getByTestId('form-status').selectOption(f.status);
  if (f.rating !== undefined) await page.getByTestId('form-rating').selectOption(f.rating);
  if (f.note !== undefined) await page.getByTestId('form-note').fill(f.note);
}
async function save(page: Page) {
  await page.getByTestId('form-save').focus(); // 入力を確定してから押す
  await page.getByTestId('form-save').click();
  await expect(page.getByTestId('book-form')).toBeHidden();
}
async function addBook(page: Page, f: Fields) {
  await page.getByTestId('book-new').click();
  await fill(page, f);
  await save(page);
}
const settle = (page: Page) => page.waitForTimeout(300);

test('manifest.json がある', async ({ request }) => {
  expect((await (await request.get('/apps/books/manifest.json')).json()).id).toBe('books');
});

test('最初は 0 件で、フォームは閉じている', async ({ page }) => {
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('book-count')).toHaveText('0');
  await expect(page.getByTestId('book-form')).toBeHidden();
});

test('本を登録すると、題名と状態が一覧に出る', async ({ page }) => {
  await addBook(page, { title: '吾輩は猫である', status: 'reading' });
  await addBook(page, { title: '坊っちゃん', status: 'want' });
  await expect(book(page, '吾輩は猫である').getByTestId('book-status')).toHaveText('読んでいる');
  await expect(book(page, '坊っちゃん').getByTestId('book-status')).toHaveText('読みたい');
  await expect(page.getByTestId('book-count')).toHaveText('2');
});

test('読んだ本に評価と感想を残せ、再読み込みしても残る', async ({ page }) => {
  await addBook(page, { title: 'こころ', status: 'done', rating: '4', note: '先生の手紙が長い' });
  await expect(book(page, 'こころ').getByTestId('book-rating')).toHaveText('★★★★');
  await settle(page);
  await page.reload();
  await expect(book(page, 'こころ').getByTestId('book-status')).toHaveText('読んだ');
  await expect(book(page, 'こころ').getByTestId('book-rating')).toHaveText('★★★★');
  await book(page, 'こころ').getByTestId('book-edit').click();
  await expect(page.getByTestId('form-title')).toHaveValue('こころ');
  await expect(page.getByTestId('form-status')).toHaveValue('done');
  await expect(page.getByTestId('form-rating')).toHaveValue('4');
  await expect(page.getByTestId('form-note')).toHaveValue('先生の手紙が長い');
});

test('編集で題名と状態を変えられる', async ({ page }) => {
  await addBook(page, { title: '三四郎', status: 'want' });
  await expect(page.getByTestId('form-delete')).toBeHidden();
  await book(page, '三四郎').getByTestId('book-edit').click();
  await expect(page.getByTestId('form-delete')).toBeVisible();
  await fill(page, { title: '三四郎（再読）', status: 'done', rating: '5' });
  await save(page);
  await expect(items(page)).toHaveCount(1);
  await expect(book(page, '三四郎（再読）').getByTestId('book-status')).toHaveText('読んだ');
  await expect(book(page, '三四郎（再読）').getByTestId('book-rating')).toHaveText('★★★★★');
});

test('状態で絞り込め、件数は表示中の数になる', async ({ page }) => {
  await addBook(page, { title: 'A', status: 'want' });
  await addBook(page, { title: 'B', status: 'done' });
  await addBook(page, { title: 'C', status: 'done' });
  await page.getByTestId('filter').selectOption('done');
  await expect(items(page)).toHaveCount(2);
  expect((await titles(page)).sort()).toEqual(['B', 'C']);
  await expect(page.getByTestId('book-count')).toHaveText('2');
  await page.getByTestId('filter').selectOption('reading');
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('book-count')).toHaveText('0');
  await page.getByTestId('filter').selectOption('all');
  await expect(page.getByTestId('book-count')).toHaveText('3');
});

test('表紙の写真を付けられ、再読み込みしても残る', async ({ page }) => {
  await page.getByTestId('book-new').click();
  await fill(page, { title: '草枕' });
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('form-cover').click();
  await (await chooser).setFiles({ name: 'cover.png', mimeType: 'image/png', buffer: png(240, 320) });
  await settle(page);
  await save(page);
  const width = () => book(page, '草枕').getByTestId('book-cover').evaluate((i: HTMLImageElement) => i.decode().then(() => i.naturalWidth));
  expect(await width()).toBe(240);
  await addBook(page, { title: '写真なし' });
  await expect(book(page, '写真なし').getByTestId('book-cover')).toHaveCount(0);
  await settle(page);
  await page.reload();
  expect(await width()).toBe(240);
});

test('[意図] 削除は確認（SDK の確認ダイアログ）の後に消える', async ({ page }) => {
  await addBook(page, { title: 'A' });
  await addBook(page, { title: 'B' });
  await book(page, 'A').getByTestId('book-edit').click();
  await page.getByTestId('form-delete').click();
  await page.getByTestId('sdk-confirm-cancel').click();
  await page.getByTestId('form-cancel').click({ timeout: 1000 }).catch(() => {});
  await expect(items(page)).toHaveCount(2);
  await book(page, 'A').getByTestId('book-edit').click();
  await page.getByTestId('form-delete').click();
  await page.getByTestId('sdk-confirm-ok').click();
  await expect(items(page)).toHaveCount(1);
  await expect(page.getByTestId('book-form')).toBeHidden();
  expect(await titles(page)).toEqual(['B']);
});

test('[意図] 題名が空欄では保存されず、トーストで知らせ、フォームは開いたまま', async ({ page }) => {
  await page.getByTestId('book-new').click();
  await fill(page, { title: '   ' });
  await page.getByTestId('form-save').click({ force: true, timeout: 1000 }).catch(() => {});
  await expect(page.getByTestId('sdk-toast')).toBeVisible();
  await expect(page.getByTestId('book-form')).toBeVisible();
  await expect(items(page)).toHaveCount(0);
});

test('[意図] 新しく登録した本が一番上。初期の状態は「読みたい」で、編集しても順番は変わらない', async ({ page }) => {
  await page.getByTestId('book-new').click();
  await expect(page.getByTestId('form-status')).toHaveValue('want');
  await fill(page, { title: 'A' });
  await save(page);
  await addBook(page, { title: 'B' });
  await addBook(page, { title: 'C' });
  expect(await titles(page)).toEqual(['C', 'B', 'A']);
  await book(page, 'A').getByTestId('book-edit').click();
  await fill(page, { status: 'reading' });
  await save(page);
  expect(await titles(page)).toEqual(['C', 'B', 'A']);
});

test('[意図] キャンセルすると入力内容は捨てられる', async ({ page }) => {
  await page.getByTestId('book-new').click();
  await fill(page, { title: '捨てる本' });
  await page.getByTestId('form-cancel').click();
  await expect(page.getByTestId('book-form')).toBeHidden();
  await expect(items(page)).toHaveCount(0);
  await addBook(page, { title: '残る本', status: 'want' });
  await book(page, '残る本').getByTestId('book-edit').click();
  await fill(page, { title: '変えた題名', status: 'done' });
  await page.getByTestId('form-cancel').click();
  expect(await titles(page)).toEqual(['残る本']);
  await expect(book(page, '残る本').getByTestId('book-status')).toHaveText('読みたい');
});

test('[意図] 評価は「読んだ」の本だけ。他の状態に戻すと評価は消える', async ({ page }) => {
  await addBook(page, { title: 'こころ', status: 'done', rating: '3' });
  await expect(book(page, 'こころ').getByTestId('book-rating')).toHaveText('★★★');
  await book(page, 'こころ').getByTestId('book-edit').click();
  await fill(page, { status: 'reading' });
  await save(page);
  await expect(book(page, 'こころ').getByTestId('book-rating')).toHaveCount(0);
  await book(page, 'こころ').getByTestId('book-edit').click();
  await fill(page, { status: 'done' });
  await expect(page.getByTestId('form-rating')).toHaveValue('');
});
