// Service Worker：公開物を丸ごとキャッシュし、オフラインでも起動できるようにする。
// precache.js（ビルド生成物）の内容が変わるとブラウザが更新を検知する。新しい版は裏で取得し、
// skipWaiting しないので、すべての画面を閉じた後の「次の起動」から切り替わる。
importScripts('./precache.js');
const { version, files } = self.__PRECACHE;
const CACHE = `pwa-${version}`;

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll([...files, 'precache.js'].map((f) => new Request(f, { cache: 'reload' })))),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    (async () => {
      for (const k of await caches.keys()) if (k.startsWith('pwa-') && k !== CACHE) await caches.delete(k);
      await self.clients.claim(); // 初回インストール時に、開いている画面をすぐ管理下に置く
    })(),
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    (async () => {
      if (url.pathname.endsWith('/')) url.pathname += 'index.html';
      const hit = await (await caches.open(CACHE)).match(url.href, { ignoreSearch: true });
      if (hit) return hit;
      try {
        return await fetch(e.request);
      } catch (err) {
        // オフラインで未取得のページを開いた：ランチャーへ戻す
        if (e.request.mode === 'navigate') return Response.redirect(self.registration.scope, 302);
        throw err;
      }
    })(),
  );
});
