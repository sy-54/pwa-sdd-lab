// ランチャー：アプリ一覧の描画と、設定パネル（エクスポート／インポート、バージョン）。
import { registerServiceWorker, ui } from '../sdk/sdk.js';
import { dumpAll, restoreApps } from '../sdk/storage.js';
import { backupFileName, buildBackup, parseBackup } from './backup.js';

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

$('settings-open').onclick = () => {
  const panel = $('settings-panel');
  panel.hidden = !panel.hidden;
  $('settings-open').setAttribute('aria-expanded', String(!panel.hidden));
};

$('export-data').onclick = async () => {
  try {
    const json = JSON.stringify(await buildBackup(await dumpAll()));
    const file = new File([json], backupFileName(), { type: 'application/json' });
    // ホーム画面から起動した iOS では a[download] が効かないため、共有シート（「ファイルに保存」）を使う
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    if (standalone && navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file] });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(file), download: file.name });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  } catch (e) {
    if (e.name !== 'AbortError') ui.toast('書き出せませんでした'); // AbortError は共有シートを閉じただけ
  }
};

$('import-data').onchange = async () => {
  const input = $('import-data');
  const file = input.files[0];
  input.value = '';
  if (!file) return;
  let apps;
  try {
    apps = parseBackup(await file.text());
  } catch (e) {
    return ui.toast(e.message);
  }
  const n = Object.keys(apps).length;
  if (!(await ui.confirm(`${n}個のアプリのデータを、ファイルの内容で置き換えます。よろしいですか？`, { ok: '取り込む' }))) return;
  try {
    await restoreApps(apps);
    ui.toast('取り込みました');
  } catch {
    ui.toast('取り込めませんでした');
  }
};

fetch('precache.js')
  .then((r) => r.text())
  .then((t) => ($('app-version').textContent = /"version":"([^"]+)"/.exec(t)?.[1] ?? '―'), () => {});

registerServiceWorker();
await renderApps();
