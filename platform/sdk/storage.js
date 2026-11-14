// @ts-check
// アプリごとに分かれたキー・バリュー保存。キーは "<appId>/<key>" の形で1つのストアに入れる。

const ID = /^[a-z0-9-]+$/;

/**
 * @typedef {object} Backend
 * @property {(k: string) => Promise<any>} get  ない場合は undefined
 * @property {(k: string, v: any) => Promise<void>} set
 * @property {(k: string) => Promise<void>} delete
 * @property {(prefix: string) => Promise<[string, any][]>} entries  キーが prefix で始まるもの（キー順）
 * @property {(prefixes: string[], entries: [string, any][]) => Promise<void>} replace  prefixes 配下を全削除して entries を書く（不可分）
 */

/** テスト用のメモリ保存。IndexedDB と同じく値を複製して持つ。 @returns {Backend} */
export function memoryBackend() {
  /** @type {Map<string, any>} */
  const m = new Map();
  return {
    get: async (k) => (m.has(k) ? structuredClone(m.get(k)) : undefined),
    set: async (k, v) => void m.set(k, structuredClone(v)),
    delete: async (k) => void m.delete(k),
    entries: async (prefix) =>
      [...m].filter(([k]) => k.startsWith(prefix)).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, v]) => [k, structuredClone(v)]),
    replace: async (prefixes, entries) => {
      for (const k of [...m.keys()]) if (prefixes.some((p) => k.startsWith(p))) m.delete(k);
      for (const [k, v] of entries) m.set(k, structuredClone(v));
    },
  };
}

// WebKit は環境によって IndexedDB に Blob を直接保存できない（プライベートブラウズなど）。
// そのため Blob は { __blob, type, data: ArrayBuffer } に変換して保存し、読むときに戻す。
const plain = (/** @type {any} */ v) => v !== null && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;
/** @param {any} v @returns {Promise<any>} */
async function pack(v) {
  if (v instanceof Blob) return { __blob: true, type: v.type, data: await v.arrayBuffer() };
  if (Array.isArray(v)) return Promise.all(v.map(pack));
  if (plain(v)) return Object.fromEntries(await Promise.all(Object.entries(v).map(async ([k, x]) => [k, await pack(x)])));
  return v;
}
/** @param {any} v @returns {any} */
function unpack(v) {
  if (plain(v) && v.__blob === true) return new Blob([v.data], { type: v.type });
  if (Array.isArray(v)) return v.map(unpack);
  if (plain(v)) return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, unpack(x)]));
  return v;
}

/** IndexedDB（DB: pwa-sdd / ストア: kv）。 @returns {Backend} */
export function idbBackend() {
  /** @type {Promise<IDBDatabase> | undefined} */
  let db;
  const open = () =>
    (db ??= new Promise((ok, ng) => {
      const r = indexedDB.open('pwa-sdd', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ng(r.error);
    }));
  /** @template T @param {IDBTransactionMode} mode @param {(s: IDBObjectStore) => T} fn @returns {Promise<T>} */
  const tx = async (mode, fn) => {
    const t = (await open()).transaction('kv', mode);
    const out = fn(t.objectStore('kv'));
    return new Promise((ok, ng) => {
      t.oncomplete = () => ok(out);
      t.onerror = t.onabort = () => ng(t.error ?? new Error('保存に失敗しました'));
    });
  };
  const range = (/** @type {string} */ p) => IDBKeyRange.bound(p, p + '\uffff');
  return {
    get: async (k) => unpack((await tx('readonly', (s) => s.get(k))).result),
    set: async (k, v) => {
      const packed = await pack(v); // トランザクションの外で変換する（await をまたぐと自動コミットされるため）
      await tx('readwrite', (s) => s.put(packed, k));
    },
    delete: async (k) => void (await tx('readwrite', (s) => s.delete(k))),
    entries: async (prefix) => {
      const [keys, vals] = await tx('readonly', (s) => [s.getAllKeys(range(prefix)), s.getAll(range(prefix))]);
      return keys.result.map((k, i) => [String(k), unpack(vals.result[i])]);
    },
    replace: async (prefixes, entries) => {
      const packed = await Promise.all(entries.map(async ([k, v]) => /** @type {[string, any]} */ ([k, await pack(v)])));
      await tx('readwrite', (s) => {
        for (const p of prefixes) s.delete(range(p));
        for (const [k, v] of packed) s.put(v, k);
      });
    },
  };
}

/** URL からアプリ ID を取る。ミニアプリの外（ランチャーなど）では null。 */
export function currentAppId(pathname = location.pathname) {
  return /\/apps\/([a-z0-9-]+)\//.exec(pathname)?.[1] ?? null;
}

/**
 * @param {string} appId
 * @param {Backend} [backend]
 */
export function createStorage(appId, backend = idbBackend()) {
  if (!ID.test(appId ?? '')) throw new Error(`appId が不正です: ${appId}`);
  const full = (/** @type {string} */ key) => {
    if (typeof key !== 'string' || key === '') throw new Error('キーは空でない文字列にしてください');
    return `${appId}/${key}`;
  };
  return {
    /** 値を読む。なければ fallback（省略時 null）。 @param {string} key @param {any} [fallback] */
    get: async (key, fallback = null) => (await backend.get(full(key))) ?? fallback,
    /** 値を書く。JSON にできる値と Blob を保存できる。失敗時は例外。 @param {string} key @param {any} value */
    set: async (key, value) => backend.set(full(key), value),
    /** @param {string} key */
    remove: async (key) => backend.delete(full(key)),
    /** このアプリのキー一覧（キー順）。 @returns {Promise<string[]>} */
    keys: async () => (await backend.entries(`${appId}/`)).map(([k]) => k.slice(appId.length + 1)),
  };
}

/** @type {ReturnType<typeof createStorage> | undefined} */
let current;
const bound = () => {
  const id = currentAppId();
  if (!id) throw new Error('storage はミニアプリ（apps/<id>/）の中でだけ使えます');
  return (current ??= createStorage(id));
};
/** いま開いているミニアプリ用の保存領域。 */
export const storage = {
  /** @param {string} key @param {any} [fallback] */
  get: (key, fallback) => bound().get(key, fallback),
  /** @param {string} key @param {any} value */
  set: (key, value) => bound().set(key, value),
  /** @param {string} key */
  remove: (key) => bound().remove(key),
  keys: () => bound().keys(),
};

// ---- 以下はランチャー専用（ミニアプリからは使わない） ----

/** 全アプリのデータを { appId: { key: value } } で返す。 @param {Backend} [backend] */
export async function dumpAll(backend = idbBackend()) {
  /** @type {Record<string, Record<string, any>>} */
  const apps = {};
  for (const [k, v] of await backend.entries('')) {
    const i = k.indexOf('/');
    (apps[k.slice(0, i)] ??= {})[k.slice(i + 1)] = v;
  }
  return apps;
}

/** apps に含まれるアプリのデータを丸ごと置き換える。含まれないアプリは変えない。 @param {Record<string, Record<string, any>>} apps @param {Backend} [backend] */
export async function restoreApps(apps, backend = idbBackend()) {
  const ids = Object.keys(apps);
  for (const id of ids) if (!ID.test(id)) throw new Error(`appId が不正です: ${id}`);
  /** @type {[string, any][]} */
  const entries = ids.flatMap((id) => Object.entries(apps[id]).map(([k, v]) => /** @type {[string, any]} */ ([`${id}/${k}`, v])));
  await backend.replace(ids.map((id) => `${id}/`), entries);
}
