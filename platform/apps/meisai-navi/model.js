// @ts-check
// 状態の操作と集計。DOM にも storage にも触れない。関数は元の状態を書き換えず、新しい状態を返す。
import { autoClassify, shopKey } from './classify.js';

/**
 * @typedef {import('./csv.js').Row} Row
 * @typedef {{ id: string, name: string, color: number }} Category
 * @typedef {{ v: 1, files: { name: string, rows: Row[] }[], cats: Category[], rules: Record<string, string> }} State
 * @typedef {Row & { key: string, name: string, cat: string, tag: string, ym: string }} ResolvedRow
 */

export const MAX_CATEGORIES = 12;
export const NAME_MAX = 20;
const INITIAL = [['food', '食料品'], ['dining', '外食・カフェ'], ['shop', '買い物'], ['subs', 'サブスク'], ['util', '通信・光熱'], ['move', '交通・車'], ['fun', '趣味・旅行'], ['life', '医療・保険・教育'], ['other', 'その他']];

/** @returns {State} */
export const initialState = () => ({ v: 1, files: [], cats: INITIAL.map(([id, name], color) => ({ id, name, color })), rules: {} });

const isObject = (/** @type {unknown} */ v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const isRow = (/** @type {any} */ r) =>
  isObject(r) && /^\d{4}-\d{2}-\d{2}$/.test(r.d) && typeof r.n === 'string' && Number.isFinite(r.a) && Number.isFinite(r.f) && typeof r.p === 'string';
const isCategory = (/** @type {any} */ c) => isObject(c) && typeof c.id === 'string' && typeof c.name === 'string' && Number.isInteger(c.color);

/** 保存されていた値を確かめ、壊れていれば初期状態にする。 @param {any} value @returns {State} */
export function repairState(value) {
  if (!isObject(value) || !Array.isArray(value.files) || !Array.isArray(value.cats)) return initialState();
  const cats = value.cats.filter(isCategory).map((/** @type {Category} */ c) => ({ id: c.id, name: c.name, color: c.color }));
  if (!cats.some((/** @type {Category} */ c) => c.id === 'other')) return initialState();
  const ids = new Set(cats.map((/** @type {Category} */ c) => c.id));
  const files = value.files
    .filter((/** @type {any} */ f) => isObject(f) && typeof f.name === 'string' && Array.isArray(f.rows))
    .map((/** @type {any} */ f) => ({ name: f.name, rows: f.rows.filter(isRow).map((/** @type {Row} */ r) => ({ d: r.d, n: r.n, a: r.a, f: r.f, p: r.p })) }));
  const rules = Object.fromEntries(Object.entries(isObject(value.rules) ? value.rules : {}).filter(([, cat]) => ids.has(/** @type {string} */ (cat))));
  return { v: 1, files, cats, rules };
}

/** ファイルを加える。同じ名前があれば置き換える。 @param {State} state @param {string} name @param {Row[]} rows @returns {State} */
export function putFile(state, name, rows) {
  const file = { name, rows };
  const i = state.files.findIndex((f) => f.name === name);
  return { ...state, files: i >= 0 ? state.files.map((f, j) => (j === i ? file : f)) : [...state.files, file] };
}

/** @param {State} state @param {number} index @returns {State} */
export const removeFile = (state, index) => ({ ...state, files: state.files.filter((_, i) => i !== index) });

/** 自動分類の費目。その費目が削除済みなら other。 @param {State} state @param {string} name */
function autoCategory(state, name) {
  const auto = autoClassify(name);
  return state.cats.some((c) => c.id === auto.cat) ? auto : { cat: 'other', tag: '' };
}

/**
 * 店ごとの費目修正を設定する。自動分類と同じ費目なら修正を消す。
 * @param {State} state @param {string} key shopKey(店名) @param {string} catId @returns {State}
 */
export function setRule(state, key, catId) {
  if (!state.cats.some((c) => c.id === catId)) return state;
  const rules = { ...state.rules };
  const sample = state.files.flatMap((f) => f.rows).find((r) => shopKey(r.n) === key);
  if (sample && autoCategory(state, sample.n).cat === catId) delete rules[key];
  else rules[key] = catId;
  return { ...state, rules };
}

/** 各明細に、店のキー・表示名・費目・細目・年月を付け、利用日の新しい順に並べる。 @param {State} state @returns {ResolvedRow[]} */
export function resolveRows(state) {
  const ids = new Set(state.cats.map((c) => c.id));
  return state.files
    .flatMap((f) => f.rows)
    .map((r) => {
      const key = shopKey(r.n);
      const auto = autoCategory(state, r.n);
      const cat = ids.has(state.rules[key]) ? state.rules[key] : auto.cat;
      return { ...r, key, name: r.n.normalize('NFKC'), cat, tag: cat === auto.cat ? auto.tag : '', ym: r.d.slice(0, 7) };
    })
    .sort((a, b) => (a.d < b.d ? 1 : a.d > b.d ? -1 : 0));
}

/** 明細にある年月を古い順に返す。 @param {{ ym: string }[]} rows */
export const monthsOf = (rows) => [...new Set(rows.map((r) => r.ym))].sort();

/**
 * 合計、費目別、店別（上位5件）、月別を出す。
 * @param {ResolvedRow[]} rows @param {Category[]} cats
 */
export function summarize(rows, cats) {
  const total = rows.reduce((t, r) => t + r.a, 0);
  const byCat = cats
    .map((c) => {
      const own = rows.filter((r) => r.cat === c.id);
      return { ...c, total: own.reduce((t, r) => t + r.a, 0), count: own.length };
    })
    .filter((c) => c.count > 0 && c.total !== 0)
    .sort((a, b) => b.total - a.total);
  /** @type {Map<string, { name: string, total: number, count: number }>} */
  const shopMap = new Map();
  for (const r of rows) {
    const s = shopMap.get(r.key) ?? { name: r.name, total: 0, count: 0 };
    s.total += r.a;
    s.count += 1;
    shopMap.set(r.key, s);
  }
  const shops = [...shopMap.values()].sort((a, b) => b.total - a.total).slice(0, 5);
  const byMonth = monthsOf(rows).map((ym) => ({ ym, total: rows.filter((r) => r.ym === ym).reduce((t, r) => t + r.a, 0) }));
  return { total, count: rows.length, byCat, shops, byMonth };
}
