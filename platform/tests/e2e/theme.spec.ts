import { expect, test, type Page } from '@playwright/test';

/** 背景色と文字色の明るさ（0〜1）を返す */
async function luminance(page: Page) {
  return page.evaluate(() => {
    const lum = (css: string) => {
      const [r, g, b] = css.match(/[\d.]+/g)!.map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    };
    const s = getComputedStyle(document.body);
    return { bg: lum(s.backgroundColor), fg: lum(s.color) };
  });
}

for (const path of ['', 'apps/demo/']) {
  const name = path || 'ランチャー';
  test.describe(`ダーク設定: ${name}`, () => {
    test.use({ colorScheme: 'dark' });
    test(`AC-12 ダークモード（${name}）は背景が暗色、文字が明色`, async ({ page }) => {
      await page.goto(path);
      const { bg, fg } = await luminance(page);
      expect(bg).toBeLessThan(0.2);
      expect(fg).toBeGreaterThan(0.8);
      if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/dark-${path ? 'demo' : 'launcher'}.png` });
    });
  });
  test.describe(`ライト設定: ${name}`, () => {
    test.use({ colorScheme: 'light' });
    test(`AC-12 ライト設定（${name}）は背景が明色、文字が暗色`, async ({ page }) => {
      await page.goto(path);
      const { bg, fg } = await luminance(page);
      expect(bg).toBeGreaterThan(0.8);
      expect(fg).toBeLessThan(0.2);
      if (process.env.SHOTS) await page.screenshot({ path: `${process.env.SHOTS}/light-${path ? 'demo' : 'launcher'}.png` });
    });
  });
}
