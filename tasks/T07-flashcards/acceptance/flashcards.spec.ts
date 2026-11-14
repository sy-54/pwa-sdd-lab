import { expect, test, type Page } from '@playwright/test';

const CARDS = [['apple', 'りんご'], ['book', '本'], ['cat', 'ねこ']] as const;
const BACK = Object.fromEntries(CARDS);

test.beforeEach(async ({ page }) => {
  await page.goto('/apps/flashcards/');
  await expect(page.getByTestId('app-root')).toBeVisible();
});
const items = (page: Page) => page.getByTestId('card-item');
async function add(page: Page, front: string, back: string) {
  const before = await items(page).count();
  await page.getByTestId('card-front-input').fill(front);
  await page.getByTestId('card-back-input').fill(back);
  await page.getByTestId('card-back-input').blur(); // 入力を確定してから押す
  await page.getByTestId('add-card').click();
  await expect(items(page)).toHaveCount(before + 1);
}
const addAll = async (page: Page) => {
  for (const [f, b] of CARDS) await add(page, f, b);
};
const front = async (page: Page) => (await page.getByTestId('study-front').textContent())!.trim();
/** いまのカードをめくって、覚えた／まだ を押す。カードの表を返す */
async function answer(page: Page, button: 'know' | 'again') {
  const f = await front(page);
  await page.getByTestId('flip').click();
  await expect(page.getByTestId('study-back')).toHaveText(BACK[f]);
  await page.getByTestId(button).click();
  return f;
}

test('manifest.json がある', async ({ request }) => {
  expect((await (await request.get('/apps/flashcards/manifest.json')).json()).id).toBe('flashcards');
});

test('カードを追加すると一覧に表と裏が出て、再読み込みしても残る', async ({ page }) => {
  await addAll(page);
  await expect(items(page).filter({ hasText: 'apple' }).getByTestId('card-back')).toHaveText('りんご');
  await page.waitForTimeout(300);
  await page.reload();
  await expect(items(page)).toHaveCount(3);
  await expect(page.getByTestId('study-view')).toBeHidden();
  await expect(page.getByTestId('study-result')).toBeHidden();
});

test('学習を始めると表が出て、めくると裏が見える', async ({ page }) => {
  await addAll(page);
  await page.getByTestId('study-start').click();
  await expect(page.getByTestId('study-view')).toBeVisible();
  await expect(page.getByTestId('study-back')).toBeHidden();
  await expect(page.getByTestId('study-progress')).toHaveText('0/3');
  const f = await front(page);
  expect(Object.keys(BACK)).toContain(f);
  await page.getByTestId('flip').click();
  await expect(page.getByTestId('study-back')).toHaveText(BACK[f]);
});

test('全部「覚えた」にすると結果が出て、一覧に戻れる', async ({ page }) => {
  await addAll(page);
  await page.getByTestId('study-start').click();
  const seen = [];
  for (let i = 0; i < 3; i++) {
    seen.push(await answer(page, 'know'));
    if (i < 2) await expect(page.getByTestId('study-progress')).toHaveText(`${i + 1}/3`);
  }
  expect(seen.sort()).toEqual(['apple', 'book', 'cat']);
  await expect(page.getByTestId('study-result')).toBeVisible();
  await expect(page.getByTestId('study-view')).toBeHidden();
  await expect(page.getByTestId('result-known')).toHaveText('3');
  await page.getByTestId('study-finish').click();
  await expect(page.getByTestId('study-result')).toBeHidden();
  await expect(items(page)).toHaveCount(3);
});

test('「まだ」のカードは覚えるまで繰り返し出て、結果は1回で覚えた枚数', async ({ page }) => {
  await addAll(page);
  await page.getByTestId('study-start').click();
  const first = await answer(page, 'again');
  await expect(page.getByTestId('study-progress')).toHaveText('0/3');
  const seen = [first];
  for (let i = 0; i < 10 && !(await page.getByTestId('study-result').isVisible()); i++) {
    // 最初に「まだ」にしたカードは、2回目にもう一度「まだ」、3回目で「覚えた」
    const f = await front(page);
    const times = seen.filter((s) => s === f).length;
    seen.push(await answer(page, f === first && times < 2 ? 'again' : 'know'));
    await page.waitForTimeout(100);
  }
  await expect(page.getByTestId('study-result')).toBeVisible();
  expect(seen.filter((s) => s === first)).toHaveLength(3);
  expect(seen).toHaveLength(5);
  await expect(page.getByTestId('result-known')).toHaveText('2');
});

test('カードを削除できる', async ({ page }) => {
  await addAll(page);
  await items(page).filter({ hasText: 'book' }).getByTestId('card-delete').click();
  await page.getByTestId('sdk-confirm-ok').click({ timeout: 1000 }).catch(() => {});
  await expect(items(page)).toHaveCount(2);
  await page.waitForTimeout(300);
  await page.reload();
  await expect(items(page)).toHaveCount(2);
});

test('[意図] 登録した順に出題され、「まだ」のカードは列の最後に回る', async ({ page }) => {
  await addAll(page);
  expect((await page.getByTestId('card-front').allTextContents()).map((t) => t.trim())).toEqual(['apple', 'book', 'cat']);
  await page.getByTestId('study-start').click();
  const seen = [await answer(page, 'know'), await answer(page, 'again'), await answer(page, 'know'), await answer(page, 'know')];
  expect(seen).toEqual(['apple', 'book', 'cat', 'book']);
  await expect(page.getByTestId('result-known')).toHaveText('2');
});

test('[意図] めくる前は「覚えた」「まだ」を押せない', async ({ page }) => {
  await addAll(page);
  await page.getByTestId('study-start').click();
  const f = await front(page);
  for (const b of ['know', 'again']) await page.getByTestId(b).click({ force: true, timeout: 1000 }).catch(() => {});
  await expect(page.getByTestId('study-progress')).toHaveText('0/3');
  expect(await front(page)).toBe(f);
  await expect(page.getByTestId('study-back')).toBeHidden();
});

test('[意図] カードが 0 枚のときは学習を始められない', async ({ page }) => {
  await page.getByTestId('study-start').click({ force: true, timeout: 1000 }).catch(() => {});
  await page.waitForTimeout(300);
  await expect(page.getByTestId('study-view')).toBeHidden();
  await expect(page.getByTestId('study-result')).toBeHidden();
});

test('[意図] 表か裏が空欄のカードは追加されず、削除は確認なし', async ({ page }) => {
  for (const [f, b] of [['apple', ''], ['', 'りんご'], ['  ', '  ']]) {
    await page.getByTestId('card-front-input').fill(f);
    await page.getByTestId('card-back-input').fill(b);
    await page.getByTestId('add-card').click({ force: true, timeout: 1000 }).catch(() => {});
  }
  await page.waitForTimeout(300);
  await expect(items(page)).toHaveCount(0);
  await add(page, 'apple', 'りんご');
  await expect(page.getByTestId('card-front-input')).toHaveValue('');
  await items(page).first().getByTestId('card-delete').click();
  await expect(items(page)).toHaveCount(0);
  await expect(page.getByTestId('sdk-confirm')).toHaveCount(0);
});
