import { describe, expect, it } from 'vitest';
import { shopKey } from '../../apps/meisai-navi/classify.js';
import { initialState, monthsOf, putFile, removeFile, repairState, resolveRows, setRule, summarize } from '../../apps/meisai-navi/model.js';

const row = (d: string, n: string, a: number, f = 0, p = '1回払い') => ({ d, n, a, f, p });
const OCT = [row('2026-10-01', 'ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ', 1234), row('2026-10-02', 'ｶﾞｽﾄ', 980), row('2026-10-03', 'NETFLIX.COM', 1590)];
const loaded = () => putFile(initialState(), 'enavi202610.csv', OCT);

describe('initialState / repairState', () => {
  it('初期状態は明細0件、費目は9つで other を含む', () => {
    const s = initialState();
    expect(s.files).toEqual([]);
    expect(s.cats.map((c) => c.id)).toEqual(['food', 'dining', 'shop', 'subs', 'util', 'move', 'fun', 'life', 'other']);
    expect(s.cats.map((c) => c.color)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
  });
  it('AC-06 正常な値はそのまま返す', () => {
    const s = setRule(loaded(), shopKey('ｶﾞｽﾄ'), 'food');
    expect(repairState(JSON.parse(JSON.stringify(s)))).toEqual(s);
  });
  it.each([null, 'x', 42, [], { files: 'x' }, { files: [], cats: [{ id: 'food', name: '食料品', color: 0 }], rules: {} }])('壊れた値 %j は初期状態にする', (v) => {
    expect(repairState(v)).toEqual(initialState());
  });
  it('形の違う明細の行と、存在しない費目を指す修正は捨てる', () => {
    const s = repairState({ ...loaded(), files: [{ name: 'a.csv', rows: [OCT[0], { d: 'x' }, null] }], rules: { A: 'food', B: 'nope' } });
    expect(s.files[0].rows).toEqual([OCT[0]]);
    expect(s.rules).toEqual({ A: 'food' });
  });
});

describe('putFile / removeFile', () => {
  it('AC-07 同じファイル名は置き換える', () => {
    const s = putFile(loaded(), 'enavi202610.csv', OCT);
    expect(s.files).toHaveLength(1);
    expect(summarize(resolveRows(s), s.cats).total).toBe(3804);
    expect(putFile(s, 'enavi202609.csv', [row('2026-09-01', 'A', 500)]).files).toHaveLength(2);
  });
  it('AC-08 ファイルを削除する', () => {
    expect(removeFile(loaded(), 0).files).toEqual([]);
    expect(removeFile(loaded(), 5).files).toHaveLength(1);
  });
});

describe('resolveRows / summarize', () => {
  it('AC-02 費目別の合計を金額の大きい順に出し、0円の費目は出さない', () => {
    const s = loaded();
    const sum = summarize(resolveRows(s), s.cats);
    expect(sum.total).toBe(3804);
    expect(sum.count).toBe(3);
    expect(sum.byCat.map((c) => [c.id, c.total, c.count])).toEqual([['subs', 1590, 1], ['food', 1234, 1], ['dining', 980, 1]]);
  });
  it('明細は利用日の新しい順。表示名は全角にそろえる', () => {
    const rows = resolveRows(loaded());
    expect(rows.map((r) => r.name)).toEqual(['NETFLIX.COM', 'ガスト', 'セブン-イレブン']);
    expect(rows[2]).toMatchObject({ cat: 'food', tag: 'conv', ym: '2026-10', key: 'セブンイレブン' });
  });
  it('AC-03 月の一覧と月ごとの合計', () => {
    const s = putFile(loaded(), 'enavi202609.csv', [row('2026-09-10', 'A', 500), row('2026-08-10', 'B', 300)]);
    const rows = resolveRows(s);
    expect(monthsOf(rows)).toEqual(['2026-08', '2026-09', '2026-10']);
    expect(summarize(rows, s.cats).byMonth).toEqual([{ ym: '2026-08', total: 300 }, { ym: '2026-09', total: 500 }, { ym: '2026-10', total: 3804 }]);
    expect(summarize(rows.filter((r) => r.ym === '2026-09'), s.cats).total).toBe(500);
  });
  it('返金は合計から引く。よく使った店は金額順に5件まで', () => {
    const s = putFile(initialState(), 'a.csv', [row('2026-10-01', 'A', 1000), row('2026-10-02', 'A', -400), ...'BCDEFG'.split('').map((n, i) => row('2026-10-03', n, 100 * (i + 1)))]);
    const sum = summarize(resolveRows(s), s.cats);
    expect(sum.total).toBe(600 + 2100);
    expect(sum.shops.map((x) => x.name)).toEqual(['G', 'A', 'F', 'E', 'D']);
    expect(sum.shops[1]).toEqual({ name: 'A', total: 600, count: 2 });
  });
});

describe('setRule', () => {
  const two = () => putFile(initialState(), 'a.csv', [row('2026-10-01', '個人商店カワムラ', 600), row('2026-10-05', '個人商店 ｶﾜﾑﾗ', 900), row('2026-10-06', 'ｶﾞｽﾄ', 980)]);
  it('AC-05 同じ店の明細すべてに効き、自動分類より優先する', () => {
    const s = setRule(two(), shopKey('個人商店カワムラ'), 'food');
    expect(resolveRows(s).map((r) => r.cat)).toEqual(['dining', 'food', 'food']);
    expect(resolveRows(s)[1].tag).toBe('');
  });
  it('AC-05 自動分類と同じ費目を選ぶと修正は消える', () => {
    const s = setRule(setRule(two(), shopKey('ｶﾞｽﾄ'), 'food'), shopKey('ｶﾞｽﾄ'), 'dining');
    expect(s.rules).toEqual({});
  });
  it('存在しない費目は無視する', () => {
    expect(setRule(two(), 'X', 'nope').rules).toEqual({});
  });
});
