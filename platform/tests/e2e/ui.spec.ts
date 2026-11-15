import { expect, test } from '@playwright/test';

// SDK の UI 部品を、アプリに依存しない素のページで確認する
test.beforeEach(async ({ page }) => {
  await page.goto('__health');
});

test('AC-06 toast は表示され、指定時間後に消える', async ({ page }) => {
  await page.evaluate(async () => (await import('/sdk/sdk.js')).ui.toast('保存しました', { duration: 800 }));
  await expect(page.getByTestId('sdk-toast')).toHaveText('保存しました');
  await expect(page.getByTestId('sdk-toast')).toHaveCount(0);
});

test('AC-06 toast は同時に1つだけ', async ({ page }) => {
  await page.evaluate(async () => {
    const { ui } = await import('/sdk/sdk.js');
    ui.toast('1つ目');
    ui.toast('2つ目');
  });
  await expect(page.getByTestId('sdk-toast')).toHaveCount(1);
  await expect(page.getByTestId('sdk-toast')).toHaveText('2つ目');
});

for (const [button, expected] of [['sdk-confirm-ok', true], ['sdk-confirm-cancel', false]] as const) {
  test(`AC-10 confirm は ${button} で ${expected} を返す`, async ({ page }) => {
    await page.evaluate(async () => {
      const { ui } = await import('/sdk/sdk.js');
      ui.confirm('取り込みますか？').then((v) => ((window as any).answer = v));
    });
    await page.getByTestId(button).click();
    await expect(page.getByTestId('sdk-confirm')).toHaveCount(0);
    expect(await page.evaluate(() => (window as any).answer)).toBe(expected);
  });
}

test('AC-10 confirm とトーストは、アプリ側のモーダル（z-index: 100）より前に出る', async ({ page }) => {
  await page.evaluate(async () => {
    const { ui } = await import('/sdk/sdk.js');
    const modal = Object.assign(document.createElement('div'), { textContent: 'アプリのフォーム' });
    modal.style.cssText = 'position:fixed;inset:0;z-index:100;background:#fff';
    document.body.append(modal);
    ui.toast('前に出る');
    ui.confirm('消しますか？').then((v) => ((window as any).answer = v));
  });
  await page.getByTestId('sdk-toast').click({ timeout: 2000 }); // 覆われていれば押せない
  await page.getByTestId('sdk-confirm-cancel').click({ timeout: 2000 });
  expect(await page.evaluate(() => (window as any).answer)).toBe(false);
});

test('AC-02 mountApp はヘッダーとホームへのリンクを入れる', async ({ page, baseURL }) => {
  await page.evaluate(async () => (await import('/sdk/sdk.js')).mountApp({ title: 'テスト' }));
  await expect(page.getByTestId('sdk-header')).toContainText('テスト');
  await expect(page.getByTestId('sdk-home')).toHaveAttribute('href', baseURL!);
});
