// @ts-check
// SDK の入口。ミニアプリは `import { mountApp, storage, ui, notify, camera } from '../../sdk/sdk.js'` で使う。
import { currentAppId, storage } from './storage.js';
import { ensureStyle, header, ui } from './ui.js';
import { notify } from './notify.js';
import { camera } from './camera.js';

export { storage, ui, notify, camera };

/** サイトのルート（ランチャー）の URL。 */
export const homeUrl = new URL('../', import.meta.url).href;

/** Service Worker を登録する（オフライン起動用）。SW がない環境では何もしない。 */
export function registerServiceWorker() {
  navigator.serviceWorker?.register(new URL('../sw.js', import.meta.url)).catch(() => {});
}

/**
 * ミニアプリの起動時に1度呼ぶ。共通スタイルの適用、ヘッダー（ホームへ戻る）の挿入、オフライン対応を行う。
 * @param {{ title?: string }} [options] title 省略時は document.title
 */
export function mountApp({ title } = {}) {
  ensureStyle();
  if (!document.querySelector('meta[name="viewport"]')) {
    const m = document.createElement('meta');
    m.name = 'viewport';
    m.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    document.head.append(m);
  }
  header(title ?? document.title, homeUrl);
  registerServiceWorker();
  return { appId: currentAppId() };
}
