// @ts-check
// 楽天e-NAVIの利用明細CSVを読む。DOM に触れない。

/**
 * @typedef {{ d: string, n: string, a: number, f: number, p: string }} Row
 * d 利用日(YYYY-MM-DD)、n 店名（CSVのまま）、a 利用金額、f 手数料、p 支払方法
 */

/** UTF-8 として読み、読めなければ Shift_JIS として読む。 @param {ArrayBuffer | Uint8Array} buffer */
export function decodeText(buffer) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder('shift_jis').decode(buffer);
  }
}

/** CSV を行と列に分ける。 @param {string} text @returns {string[][]} */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch !== '"') cell += ch;
      else if (s[i + 1] === '"') { cell += '"'; i++; }
      else quoted = false;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      rows.push(row); row = [];
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

/** @param {string | undefined} s @returns {number} 数字がなければ NaN */
const toNumber = (s) => {
  const t = String(s ?? '').normalize('NFKC').replace(/[^\d-]/g, '');
  return /\d/.test(t) ? parseInt(t, 10) : NaN;
};

/**
 * 明細CSVの文字列から明細を取り出す。読めなければ、利用者に見せる理由つきで例外を投げる。
 * @param {string} text @returns {Row[]}
 */
export function readStatement(text) {
  const rows = parseCsv(text);
  const h = rows.findIndex((r) => r.some((c) => c.includes('利用日')));
  if (h < 0) throw new Error('「利用日」の列が見つかりません。楽天e-NAVIの明細CSVか確認してください。');
  const head = rows[h].map((c) => c.trim());
  const col = (/** @type {string[]} */ ...names) => {
    for (const n of names) {
      const i = head.findIndex((c) => c.includes(n));
      if (i >= 0) return i;
    }
    return -1;
  };
  const iDate = col('利用日');
  const iName = col('利用店名', '商品名');
  const iAmount = col('利用金額');
  const iFee = col('手数料');
  const iPay = col('支払方法');
  if (iName < 0 || iAmount < 0) throw new Error('「利用店名」または「利用金額」の列が見つかりません。');
  /** @type {Row[]} */
  const out = [];
  for (const r of rows.slice(h + 1)) {
    const m = /(\d{4})[/\-.年](\d{1,2})[/\-.月](\d{1,2})/.exec(r[iDate] ?? '');
    const name = (r[iName] ?? '').trim();
    const amount = toNumber(r[iAmount]);
    if (!m || !name || Number.isNaN(amount)) continue;
    out.push({
      d: `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`,
      n: name,
      a: amount,
      f: iFee >= 0 ? toNumber(r[iFee]) || 0 : 0,
      p: iPay >= 0 ? (r[iPay] ?? '').trim() : '',
    });
  }
  if (!out.length) throw new Error('明細の行が1件も読み取れませんでした。');
  return out;
}
