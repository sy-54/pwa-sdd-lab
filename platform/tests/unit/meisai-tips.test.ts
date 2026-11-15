import { describe, expect, it } from 'vitest';
import { initialState, monthsOf, putFile, resolveRows } from '../../apps/meisai-navi/model.js';
import { buildTips } from '../../apps/meisai-navi/tips.js';

const row = (d: string, n: string, a: number, f = 0, p = '1回払い') => ({ d, n, a, f, p });
const times = (n: number, make: (i: number) => ReturnType<typeof row>) => Array.from({ length: n }, (_, i) => make(i));
function tips(rows: ReturnType<typeof row>[], month = 'all') {
  const s = putFile(initialState(), 'a.csv', rows);
  const all = resolveRows(s);
  return buildTips({ rows: month === 'all' ? all : all.filter((r) => r.ym === month), allRows: all, month, months: monthsOf(all), cats: s.cats });
}
const kinds = (t: ReturnType<typeof tips>) => t.map((x) => x.kind);
const of = (t: ReturnType<typeof tips>, kind: string) => t.find((x) => x.kind === kind);

describe('buildTips', () => {
  it('明細がなければ何も出さない', () => {
    expect(tips([])).toEqual([]);
  });
  it('AC-04 fee：手数料のある明細、リボ・分割の明細で出る。目安額は手数料の月あたり合計', () => {
    const t = tips([row('2026-10-12', 'ﾔﾏﾀﾞﾃﾞﾝｷ', 64800, 1296, '分割6回払い'), row('2026-10-13', 'A', 100)]);
    expect(kinds(t)[0]).toBe('fee');
    expect(of(t, 'fee')?.saving).toBe(1296);
    expect(kinds(tips([row('2026-10-12', 'B', 5000, 0, 'ﾘﾎﾞ払い')]))).toContain('fee');
    expect(kinds(tips([row('2026-10-12', 'B', 5000)]))).not.toContain('fee');
  });
  it('AC-04 全期間では月数で割る', () => {
    const t = tips([row('2026-09-12', 'A', 100, 600, '分割'), row('2026-10-12', 'B', 100, 600, '分割')]);
    expect(of(t, 'fee')?.saving).toBe(600);
    expect(of(tips([row('2026-09-12', 'A', 100, 600, '分割'), row('2026-10-12', 'B', 100, 600, '分割')], '2026-10'), 'fee')?.saving).toBe(600);
  });
  it('AC-04 subs：3件以上なら安い方から3分の1（切り上げ）が目安額。2件以下は目安額なし', () => {
    const four = [row('2026-10-01', 'NETFLIX.COM', 1590), row('2026-10-02', 'SPOTIFY', 980), row('2026-10-03', 'ADOBE', 3280), row('2026-10-04', 'YOUTUBE', 1280)];
    expect(of(tips(four), 'subs')?.saving).toBe(980 + 1280);
    expect(of(tips(four.slice(0, 2)), 'subs')?.saving).toBe(0);
  });
  it('AC-04 conv：月あたり3,000円以上で出て、目安額は3割', () => {
    expect(of(tips(times(5, (i) => row(`2026-10-0${i + 1}`, 'ﾛｰｿﾝ', 600))), 'conv')?.saving).toBe(900);
    expect(kinds(tips(times(4, (i) => row(`2026-10-0${i + 1}`, 'ﾛｰｿﾝ', 700))))).not.toContain('conv');
  });
  it('AC-04 deli は5割、dining はデリバリーを除いて2割', () => {
    const t = tips([row('2026-10-01', 'UBER *EATS', 2000), row('2026-10-02', 'ｶﾞｽﾄ', 16000)]);
    expect(of(t, 'deli')?.saving).toBe(1000);
    expect(of(t, 'dining')?.saving).toBe(3200);
    // 15,000円未満でも合計の15%以上なら出る
    expect(kinds(tips([row('2026-10-02', 'ｶﾞｽﾄ', 2000), row('2026-10-03', 'A', 8000)]))).toContain('dining');
    expect(kinds(tips([row('2026-10-02', 'ｶﾞｽﾄ', 1000), row('2026-10-03', 'A', 9000)]))).not.toContain('dining');
  });
  it('AC-04 tel は月あたり6,000円以上で3割、ec は月あたり6回以上で15%', () => {
    expect(of(tips([row('2026-10-01', 'ﾄﾞｺﾓご利用料金', 7000)]), 'tel')?.saving).toBe(2100);
    expect(kinds(tips([row('2026-10-01', 'ﾄﾞｺﾓご利用料金', 5999)]))).not.toContain('tel');
    expect(of(tips(times(6, (i) => row(`2026-10-0${i + 1}`, 'AMAZON.CO.JP', 2000))), 'ec')?.saving).toBe(1800);
    expect(kinds(tips(times(5, (i) => row(`2026-10-0${i + 1}`, 'AMAZON.CO.JP', 2000))))).not.toContain('ec');
  });
  it('AC-04 small：コンビニ以外の1,000円未満が月あたり12回以上で2割', () => {
    expect(of(tips(times(12, (i) => row(`2026-10-${10 + i}`, `店${i}`, 500))), 'small')?.saving).toBe(1200);
    expect(kinds(tips(times(12, (i) => row(`2026-10-${10 + i}`, 'ﾛｰｿﾝ', 200))))).not.toContain('small');
  });
  it('AC-04 rise：前月より3,000円以上かつ20%以上増えた費目のうち、増加額が最大の1つ', () => {
    const rows = [row('2026-09-01', 'ｶﾞｽﾄ', 5000), row('2026-10-01', 'ｶﾞｽﾄ', 9000), row('2026-09-02', 'ﾗｲﾌ', 10000), row('2026-10-02', 'ﾗｲﾌ', 12500)];
    const t = tips(rows, '2026-10').filter((x) => x.kind === 'rise');
    expect(t).toHaveLength(1);
    expect(t[0].title).toContain('外食・カフェ');
    expect(t[0].saving).toBe(0);
    expect(kinds(tips(rows, '2026-09'))).not.toContain('rise');
  });
  it('AC-04 dup：同じ日・同じ店・同じ金額（1,000円以上）が2件以上', () => {
    expect(kinds(tips([row('2026-10-21', 'B', 1980), row('2026-10-21', 'B', 1980)]))).toContain('dup');
    expect(kinds(tips([row('2026-10-21', 'B', 980), row('2026-10-21', 'B', 980)]))).not.toContain('dup');
    expect(kinds(tips([row('2026-10-21', 'B', 1980), row('2026-10-22', 'B', 1980)]))).not.toContain('dup');
  });
  it('AC-04 並びは fee、続けて目安額の大きい順', () => {
    const t = tips([row('2026-10-01', 'ﾄﾞｺﾓご利用料金', 7000), row('2026-10-02', 'UBER *EATS', 9000), row('2026-10-03', 'A', 50000, 100, '分割'), row('2026-10-04', 'B', 1980), row('2026-10-04', 'B', 1980)]);
    expect(kinds(t)).toEqual(['fee', 'deli', 'tel', 'dup']);
  });
});
