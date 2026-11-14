import { expect, test } from '@playwright/test';

test('AC-05 オフラインで起動する', async ({ page, context }) => {
  await page.goto('');
  await expect(page.getByTestId('app-tile-demo')).toBeVisible();
  // Service Worker が全ファイルをキャッシュし、この画面を管理下に置くまで待つ
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise((ok) => navigator.serviceWorker.addEventListener('controllerchange', ok, { once: true }));
  });

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId('app-list')).toBeVisible();
  await page.getByTestId('app-tile-demo').click();
  await expect(page.getByTestId('app-root')).toBeVisible();
  await expect(page.getByTestId('sdk-header')).toContainText('SDKデモ');

  // 未取得のページはランチャーへ戻す
  await page.goto('apps/no-such-app/');
  await expect(page.getByTestId('app-list')).toBeVisible();
});
