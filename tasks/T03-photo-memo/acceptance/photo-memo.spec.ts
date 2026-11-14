import { expect, test, type Page } from '@playwright/test';
import { png } from './helpers.ts';

test.beforeEach(async ({ page }) => {
  await page.goto('/apps/photo-memo/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});
const items = (page: Page) => page.getByTestId('memo-item');

/** 撮影する（幅 width の写真を選ぶ）。幅で写真を見分ける */
async function shoot(page: Page, width: number) {
  const before = await items(page).count();
  const chooser = page.waitForEvent('filechooser');
  await page.getByTestId('shoot').click();
  await (await chooser).setFiles({ name: 'photo.png', mimeType: 'image/png', buffer: png(width, 100) });
  await expect(items(page)).toHaveCount(before + 1);
}
const widths = (page: Page) =>
  page.getByTestId('memo-img').evaluateAll((imgs: HTMLImageElement[]) => Promise.all(imgs.map((i) => i.decode().then(() => i.naturalWidth, () => 0))));
/** メモを入力して確定する（入力後にフォーカスを外し、保存を待つ） */
async function caption(page: Page, index: number, text: string) {
  const input = items(page).nth(index).getByTestId('memo-caption');
  await input.fill(text);
  await input.blur();
  await page.waitForTimeout(500);
}

test('manifest.json がある', async ({ request }) => {
  expect((await (await request.get('/apps/photo-memo/manifest.json')).json()).id).toBe('photo-memo');
});

test('最初は写真がなく、その旨が表示される', async ({ page }) => {
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('memo-empty')).toBeVisible();
});

test('撮った写真が一覧に表示される', async ({ page }) => {
  await shoot(page, 300);
  await expect(page.getByTestId('memo-empty')).toBeHidden();
  expect(await widths(page)).toEqual([300]);
});

test('再読み込みしても写真とメモが残る', async ({ page }) => {
  await shoot(page, 300);
  await caption(page, 0, 'B2の14番');
  await page.reload();
  await expect(items(page)).toHaveCount(1);
  expect(await widths(page)).toEqual([300]);
  await expect(items(page).first().getByTestId('memo-caption')).toHaveValue('B2の14番');
});

test('メモは写真ごとに保存され、後から書き換えられる', async ({ page }) => {
  await shoot(page, 300);
  await caption(page, 0, 'ひとつめ');
  await shoot(page, 200);
  const first = (await widths(page)).indexOf(300);
  await caption(page, 1 - first, 'ふたつめ');
  await caption(page, first, '書き換えた');
  await page.reload();
  await expect(items(page)).toHaveCount(2);
  const after = (await widths(page)).indexOf(300);
  await expect(items(page).nth(after).getByTestId('memo-caption')).toHaveValue('書き換えた');
  await expect(items(page).nth(1 - after).getByTestId('memo-caption')).toHaveValue('ふたつめ');
});

test('[意図] 新しい写真が一番上に来る', async ({ page }) => {
  await shoot(page, 300);
  await shoot(page, 200);
  await shoot(page, 100);
  expect(await widths(page)).toEqual([100, 200, 300]);
  await page.reload();
  await expect(items(page)).toHaveCount(3);
  expect(await widths(page)).toEqual([100, 200, 300]);
});

test('[意図] 削除は確認（SDK の確認ダイアログ）の後に消える', async ({ page }) => {
  await shoot(page, 300);
  await shoot(page, 200);
  const target = (await widths(page)).indexOf(300);
  await items(page).nth(target).getByTestId('memo-delete').click();
  await page.getByTestId('sdk-confirm-ok').click();
  await expect(items(page)).toHaveCount(1);
  expect(await widths(page)).toEqual([200]);
  await page.reload();
  await expect(items(page)).toHaveCount(1);
});

test('[意図] 削除の確認でキャンセルすると何も変わらない', async ({ page }) => {
  await shoot(page, 300);
  await items(page).first().getByTestId('memo-delete').click();
  await page.getByTestId('sdk-confirm-cancel').click();
  await expect(items(page)).toHaveCount(1);
});

test('最後の1枚を消すと、写真がない旨の表示に戻る', async ({ page }) => {
  await shoot(page, 300);
  await items(page).first().getByTestId('memo-delete').click();
  await page.getByTestId('sdk-confirm-ok').click({ timeout: 2000 }).catch(() => {});
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('memo-empty')).toBeVisible();
});
