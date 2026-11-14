// @ts-check
// バックアップ JSON の組み立てと検証（純粋関数。ブラウザでも Node でも動く）。
// 形式: { format: "pwa-backup", version: 1, exportedAt, apps: { <appId>: { <key>: <value> } } }　Blob は { "$blob": dataURL }

const plain = (/** @type {any} */ v) => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Blob);

/** @param {Blob} blob */
async function toDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${blob.type || 'application/octet-stream'};base64,${btoa(bin)}`;
}

/** @param {string} url */
function fromDataUrl(url) {
  const m = /^data:([^;,]*);base64,(.*)$/s.exec(url);
  if (!m) throw new Error('bad blob');
  return new Blob([Uint8Array.from(atob(m[2]), (c) => c.charCodeAt(0))], { type: m[1] });
}

/** @param {any} v @returns {Promise<any>} */
async function encode(v) {
  if (v instanceof Blob) return { $blob: await toDataUrl(v) };
  if (Array.isArray(v)) return Promise.all(v.map(encode));
  if (plain(v)) return Object.fromEntries(await Promise.all(Object.entries(v).map(async ([k, x]) => [k, await encode(x)])));
  return v;
}

/** @param {any} v @returns {any} */
function decode(v) {
  if (Array.isArray(v)) return v.map(decode);
  if (plain(v)) return typeof v.$blob === 'string' ? fromDataUrl(v.$blob) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, decode(x)]));
  return v;
}

/** @param {Record<string, Record<string, any>>} apps storage.dumpAll() の結果 */
export async function buildBackup(apps, now = new Date()) {
  return { format: 'pwa-backup', version: 1, exportedAt: now.toISOString(), apps: await encode(apps) };
}

/**
 * バックアップファイルの中身を検証し、restoreApps に渡せる形で返す。不正なら例外。
 * @param {string} text
 * @returns {Record<string, Record<string, any>>}
 */
export function parseBackup(text) {
  try {
    const b = JSON.parse(text);
    if (!plain(b) || b.format !== 'pwa-backup' || b.version !== 1 || !plain(b.apps)) throw new Error('形式が違う');
    for (const [id, data] of Object.entries(b.apps)) if (!/^[a-z0-9-]+$/.test(id) || !plain(data)) throw new Error('形式が違う');
    return decode(b.apps);
  } catch {
    throw new Error('読み込めないファイルです');
  }
}

export function backupFileName(now = new Date()) {
  const p = (/** @type {number} */ n) => String(n).padStart(2, '0');
  return `pwa-backup-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}.json`;
}
