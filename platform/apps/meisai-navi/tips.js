// @ts-check
// 節約ポイント。spec の表（出す条件と目安額）をそのまま実装する。DOM に触れない。
import { yen } from './format.js';

/**
 * @typedef {import('./model.js').ResolvedRow} ResolvedRow
 * @typedef {{ kind: string, level: 'crit' | 'warn' | 'info', title: string, body: string, saving: number,
 *   list?: [string, string][], filter?: { cat?: string, tag?: string, month?: string } }} Tip
 */

const sum = (/** @type {ResolvedRow[]} */ rows) => rows.reduce((t, r) => t + r.a, 0);
const label = (/** @type {string} */ ym) => `${Number(ym.split('-')[1])}月`;

/**
 * @param {{ rows: ResolvedRow[], allRows: ResolvedRow[], month: string, months: string[], cats: { id: string, name: string }[] }} input
 *   rows は表示中の期間の明細、allRows は全期間、month は 'all' か YYYY-MM、months は古い順
 * @returns {Tip[]}
 */
export function buildTips({ rows, allRows, month, months, cats }) {
  if (!rows.length) return [];
  /** @type {Tip[]} */
  const tips = [];
  const m = month === 'all' ? Math.max(1, months.length) : 1;
  const per = (/** @type {number} */ x) => x / m;
  const when = m > 1 ? '月平均' : 'この月';
  const total = sum(rows);
  const tagged = (/** @type {string} */ tag) => rows.filter((r) => r.tag === tag);

  const fee = rows.filter((r) => r.f > 0 || /リボ|分割/.test(r.p.normalize('NFKC')));
  if (fee.length) {
    const f = fee.reduce((t, r) => t + r.f, 0);
    tips.push({
      kind: 'fee', level: 'crit', title: 'リボ・分割払いの手数料がかかっています', saving: per(f),
      body: `${fee.length}件が分割・リボ払いで、手数料は合計${yen(f)}円です。繰上げ返済や1回払いへの変更で、手数料はそのまま節約になります。`,
      list: fee.slice(0, 4).map((r) => [`${r.name}（${r.p.normalize('NFKC')}）`, yen(r.a)]),
    });
  }

  const subs = rows.filter((r) => r.cat === 'subs');
  if (subs.length) {
    /** @type {Map<string, { name: string, amount: number }>} */
    const services = new Map();
    for (const r of subs) {
      const s = services.get(r.key) ?? { name: r.name, amount: 0 };
      s.amount += per(r.a);
      services.set(r.key, s);
    }
    const list = [...services.values()].sort((a, b) => b.amount - a.amount);
    const monthly = list.reduce((t, s) => t + s.amount, 0);
    const many = list.length >= 3;
    const cut = many ? list.slice(-Math.ceil(list.length / 3)).reduce((t, s) => t + s.amount, 0) : 0;
    tips.push({
      kind: 'subs', level: many ? 'warn' : 'info', title: `サブスク${list.length}件で${when}${yen(monthly)}円（年間${yen(monthly * 12)}円）`, saving: cut,
      body: many ? 'この1か月で使っていないものはありませんか。金額の小さい方から3分の1を解約した場合の目安です。' : '毎月自動で引き落とされる支出です。使っているか時々確認しましょう。',
      list: list.slice(0, 8).map((s) => [s.name, `${yen(s.amount)}/月`]), filter: { cat: 'subs' },
    });
  }

  const conv = tagged('conv');
  if (per(sum(conv)) >= 3000) {
    tips.push({
      kind: 'conv', level: 'warn', title: `コンビニに${when}${Math.round(per(conv.length))}回・${yen(per(sum(conv)))}円`, saving: per(sum(conv)) * 0.3,
      body: `1回あたり${yen(sum(conv) / conv.length)}円。飲み物やお菓子をスーパーでのまとめ買いに置き換えて、利用を3割減らした場合の目安です。`, filter: { tag: 'conv' },
    });
  }

  const deli = tagged('deli');
  if (deli.length) {
    tips.push({
      kind: 'deli', level: 'warn', title: `フードデリバリーが${when}${yen(per(sum(deli)))}円`, saving: per(sum(deli)) * 0.5,
      body: `${deli.length}回の利用で、1回あたり${yen(sum(deli) / deli.length)}円。配達料とサービス料が上乗せされるため、半分を持ち帰りや自炊に変えた場合の目安です。`, filter: { tag: 'deli' },
    });
  }

  const dining = rows.filter((r) => r.cat === 'dining' && r.tag !== 'deli');
  if (dining.length && (per(sum(dining)) >= 15000 || (total > 0 && sum(dining) / total >= 0.15))) {
    const cafe = tagged('cafe');
    tips.push({
      kind: 'dining', level: 'warn', title: `外食・カフェが${when}${yen(per(sum(dining)))}円（デリバリー除く）`, saving: per(sum(dining)) * 0.2,
      body: `${cafe.length ? `うちカフェが${Math.round(per(cafe.length))}回・${yen(per(sum(cafe)))}円。` : ''}回数を2割減らした場合の目安です。`, filter: { cat: 'dining' },
    });
  }

  const tel = tagged('tel');
  if (per(sum(tel)) >= 6000) {
    tips.push({
      kind: 'tel', level: 'warn', title: `通信費が${when}${yen(per(sum(tel)))}円`, saving: per(sum(tel)) * 0.3,
      body: 'スマホ料金は一度見直すと効果が毎月続きます。データ使用量を確かめ、オンライン専用プランや格安プランに替えて3割下がった場合の目安です。', filter: { tag: 'tel' },
    });
  }

  const ec = tagged('ec');
  if (per(ec.length) >= 6) {
    tips.push({
      kind: 'ec', level: 'info', title: `ネット通販が${when}${Math.round(per(ec.length))}回・${yen(per(sum(ec)))}円`, saving: per(sum(ec)) * 0.15,
      body: '回数が多いと、ついで買いが増えがちです。カートに入れて一晩置く、週1回にまとめる、で15%減らした場合の目安です。', filter: { tag: 'ec' },
    });
  }

  const small = rows.filter((r) => r.a > 0 && r.a < 1000 && r.tag !== 'conv');
  if (per(small.length) >= 12) {
    tips.push({
      kind: 'small', level: 'info', title: `1,000円未満の決済が${when}${Math.round(per(small.length))}回`, saving: per(sum(small)) * 0.2,
      body: `少額でも合計は${when}${yen(per(sum(small)))}円（コンビニを除く）。2割減らした場合の目安です。`,
    });
  }

  const current = month === 'all' ? months[months.length - 1] : month;
  const previous = months[months.indexOf(current) - 1];
  if (previous) {
    /** @type {{ name: string, id: string, now: number, before: number, diff: number } | null} */
    let top = null;
    for (const c of cats) {
      const now = sum(allRows.filter((r) => r.ym === current && r.cat === c.id));
      const before = sum(allRows.filter((r) => r.ym === previous && r.cat === c.id));
      const diff = now - before;
      if (diff >= 3000 && before > 0 && diff / before >= 0.2 && (!top || diff > top.diff)) top = { name: c.name, id: c.id, now, before, diff };
    }
    if (top) {
      tips.push({
        kind: 'rise', level: 'info', title: `${top.name}が前月より${yen(top.diff)}円増えました`, saving: 0,
        body: `${label(previous)}は${yen(top.before)}円、${label(current)}は${yen(top.now)}円（${Math.round((top.diff / top.before) * 100)}%増）。一時的な出費か、習慣の変化かを確かめましょう。`,
        filter: { cat: top.id, month: current },
      });
    }
  }

  /** @type {Map<string, ResolvedRow[]>} */
  const same = new Map();
  for (const r of rows.filter((x) => x.a >= 1000)) {
    const k = `${r.d}|${r.key}|${r.a}`;
    same.set(k, [...(same.get(k) ?? []), r]);
  }
  const dup = [...same.values()].filter((v) => v.length > 1);
  if (dup.length) {
    tips.push({
      kind: 'dup', level: 'info', title: `同じ日・同じ店・同じ金額の決済が${dup.length}組`, saving: 0, body: '二重請求でないか、念のため確かめてください。',
      list: dup.slice(0, 4).map((v) => [`${v[0].d.slice(5).replace('-', '/')} ${v[0].name} ×${v.length}`, yen(v[0].a)]),
    });
  }

  const feeFirst = (/** @type {Tip} */ t) => (t.kind === 'fee' ? 0 : 1);
  return tips.map((t, i) => ({ t, i })).sort((a, b) => feeFirst(a.t) - feeFirst(b.t) || b.t.saving - a.t.saving || a.i - b.i).map((x) => x.t);
}
