import { expect, test, type Page } from '@playwright/test';

const count = (page: Page) => page.getByTestId('count');
const open = async (page: Page) => {
  await page.goto('/apps/counter/');
  await expect(page.getByTestId('app-root')).toBeVisible();
};
const press = async (page: Page, id: string, times = 1) => {
  for (let i = 0; i < times; i++) await page.getByTestId(id).click();
};

test.describe('今までの動き（回帰）', () => {
  test.beforeEach(async ({ page }) => open(page));
  test('初期値 0、inc で 1 ずつ増え、dec で 1 減る', async ({ page }) => {
    await expect(count(page)).toHaveText('0');
    await press(page, 'inc', 3);
    await press(page, 'dec');
    await expect(count(page)).toHaveText('2');
  });
  test('0 未満にならない', async ({ page }) => {
    await page.getByTestId('dec').click({ force: true, timeout: 1000 }).catch(() => {});
    await expect(count(page)).toHaveText('0');
  });
  test('reset は確認なしで 0、再読み込みしても値が残る', async ({ page }) => {
    await press(page, 'inc', 2);
    await page.reload();
    await expect(count(page)).toHaveText('2');
    await press(page, 'reset');
    await expect(count(page)).toHaveText('0');
    await page.reload();
    await expect(count(page)).toHaveText('0');
  });
});

test('更新前に保存されていた値がそのまま表示される', async ({ page }) => {
  // 改修前のアプリの保存形式（localStorage "counter:count" に整数の文字列）
  await page.addInitScript(() => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.setItem('counter:count', '7');
      sessionStorage.setItem('seeded', '1');
    }
  });
  await open(page);
  await expect(count(page)).toHaveText('7');
  await press(page, 'inc');
  await expect(count(page)).toHaveText('8');
  await page.reload();
  await expect(count(page)).toHaveText('8');
});

test.describe('増減の幅', () => {
  test.beforeEach(async ({ page }) => open(page));
  test('幅を選ぶと、その幅で増減する', async ({ page }) => {
    await page.getByTestId('step').selectOption('5');
    await press(page, 'inc', 2);
    await expect(count(page)).toHaveText('10');
    await page.getByTestId('step').selectOption('10');
    await press(page, 'inc');
    await expect(count(page)).toHaveText('20');
    await page.getByTestId('step').selectOption('5');
    await press(page, 'dec');
    await expect(count(page)).toHaveText('15');
  });
  test('[意図] 最初の幅は 1 で、選んだ幅は再読み込み後も残る', async ({ page }) => {
    await expect(page.getByTestId('step')).toHaveValue('1');
    await page.getByTestId('step').selectOption('10');
    await page.reload();
    await expect(page.getByTestId('step')).toHaveValue('10');
    await press(page, 'inc');
    await expect(count(page)).toHaveText('10');
  });
  test('[意図] 幅より値が小さいときに減らすと 0 で止まる', async ({ page }) => {
    await press(page, 'inc', 3);
    await page.getByTestId('step').selectOption('5');
    await page.getByTestId('dec').click({ force: true, timeout: 1000 }).catch(() => {});
    await expect(count(page)).toHaveText('0');
  });
});

test.describe('目標', () => {
  test.beforeEach(async ({ page }) => open(page));
  const setGoal = async (page: Page, v: string) => {
    await page.getByTestId('goal').fill(v);
    await page.getByTestId('goal').blur();
  };
  test('目標に届くと達成が表示される', async ({ page }) => {
    await expect(page.getByTestId('goal-reached')).toBeHidden();
    await setGoal(page, '3');
    await press(page, 'inc', 2);
    await expect(page.getByTestId('goal-reached')).toBeHidden();
    await press(page, 'inc');
    await expect(page.getByTestId('goal-reached')).toBeVisible();
  });
  test('[意図] 目標以上のあいだ表示し続け、下回ると消える。リセットでも消える', async ({ page }) => {
    await setGoal(page, '3');
    await press(page, 'inc', 5);
    await expect(page.getByTestId('goal-reached')).toBeVisible();
    await press(page, 'dec', 3);
    await expect(page.getByTestId('goal-reached')).toBeHidden();
    await press(page, 'inc');
    await expect(page.getByTestId('goal-reached')).toBeVisible();
    await press(page, 'reset');
    await expect(page.getByTestId('goal-reached')).toBeHidden();
  });
  test('[意図] 目標が空欄・0 のときは達成を表示しない', async ({ page }) => {
    await press(page, 'inc', 2);
    await expect(page.getByTestId('goal-reached')).toBeHidden();
    await setGoal(page, '0');
    await press(page, 'inc');
    await expect(page.getByTestId('goal-reached')).toBeHidden();
  });
  test('[意図] 目標は再読み込み後も残り、リセットしても幅と目標は変わらない', async ({ page }) => {
    await setGoal(page, '20');
    await page.getByTestId('step').selectOption('10');
    await press(page, 'inc');
    await press(page, 'reset');
    await page.reload();
    await expect(page.getByTestId('goal')).toHaveValue('20');
    await expect(page.getByTestId('step')).toHaveValue('10');
    await press(page, 'inc', 2);
    await expect(page.getByTestId('goal-reached')).toBeVisible();
  });
});
