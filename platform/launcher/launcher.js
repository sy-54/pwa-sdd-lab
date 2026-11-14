// ランチャー：アプリ一覧の描画。
import { registerServiceWorker } from '../sdk/sdk.js';

const $ = (id) => document.querySelector(`[data-testid="${id}"]`);

async function renderApps() {
  const apps = await fetch('apps.json').then((r) => (r.ok ? r.json() : []), () => []);
  $('app-list').replaceChildren(
    ...apps.map((app) => {
      const a = document.createElement('a');
      a.className = 'tile';
      a.href = `apps/${app.id}/`;
      a.dataset.testid = `app-tile-${app.id}`;
      if (app.description) a.title = app.description;
      const icon = Object.assign(document.createElement('span'), { className: 'icon', textContent: app.icon });
      const name = Object.assign(document.createElement('span'), { className: 'name', textContent: app.name });
      a.append(icon, name);
      return a;
    }),
  );
  $('app-empty').hidden = apps.length > 0;
}

registerServiceWorker();
await renderApps();
