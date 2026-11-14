import { expect, test } from '@playwright/test';

// 実際の IndexedDB で確認する（単体テストはメモリ backend）
test('AC-04 アプリごとにデータが分かれる', async ({ page }) => {
  await page.goto('__health');
  const r = await page.evaluate(async () => {
    const { createStorage } = await import('/sdk/storage.js');
    await createStorage('a').set('k', 1);
    return { b: await createStorage('b').get('k', 'なし'), a: await createStorage('a').get('k', 'なし'), keys: await createStorage('a').keys() };
  });
  expect(r).toEqual({ b: 'なし', a: 1, keys: ['k'] });
});

test('AC-04 Blob を保存でき、丸ごと置き換えは他アプリに影響しない', async ({ page }) => {
  await page.goto('__health');
  const r = await page.evaluate(async () => {
    const { createStorage, dumpAll, restoreApps } = await import('/sdk/storage.js');
    await createStorage('a').set('photo', new Blob(['abc'], { type: 'image/jpeg' }));
    await createStorage('b').set('keep', 2);
    const blob = await createStorage('a').get('photo');
    await restoreApps({ a: { n: 3 } });
    return { type: blob.type, text: await blob.text(), all: await dumpAll() };
  });
  expect(r).toEqual({ type: 'image/jpeg', text: 'abc', all: { a: { n: 3 }, b: { keep: 2 } } });
});
