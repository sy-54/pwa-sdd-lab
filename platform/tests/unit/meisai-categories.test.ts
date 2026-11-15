import { describe, expect, it } from 'vitest';
import { shopKey } from '../../apps/meisai-navi/classify.js';
import { addCategory, deleteCategory, initialState, putFile, renameCategory, resolveRows, setRule } from '../../apps/meisai-navi/model.js';

const row = (d: string, n: string, a: number) => ({ d, n, a, f: 0, p: '1回払い' });
const loaded = () => putFile(initialState(), 'a.csv', [row('2026-10-01', 'ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ', 1234), row('2026-10-02', 'ｶﾞｽﾄ', 980)]);
const names = (s: ReturnType<typeof initialState>) => s.cats.map((c) => c.name);

describe('addCategory', () => {
  it('AC-10 追加した費目は ID が c と連番、色は空いている最小の番号', () => {
    const a = addCategory(initialState(), 'ペット');
    expect(a.ok && a.state.cats.at(-1)).toEqual({ id: 'c1', name: 'ペット', color: 9 });
    const b = addCategory(a.state, ' 推し活 ');
    expect(b.ok && b.state.cats.at(-1)).toEqual({ id: 'c2', name: '推し活', color: 10 });
    // 削除で空いた色と、使われていない ID を使う
    const c = addCategory(deleteCategory(b.state, 'c1').state, '園芸');
    expect(c.ok && c.state.cats.at(-1)).toEqual({ id: 'c3', name: '園芸', color: 9 });
  });
  it('AC-10 追加した費目を店に割り当てられる', () => {
    const s = setRule(addCategory(loaded(), 'ペット').state, shopKey('ｶﾞｽﾄ'), 'c1');
    expect(resolveRows(s).find((r) => r.name === 'ガスト')?.cat).toBe('c1');
  });
  it('AC-10 全部で12を超えては追加できない', () => {
    let s = initialState();
    for (const n of ['A', 'B', 'C']) s = addCategory(s, n).state;
    expect(s.cats).toHaveLength(12);
    expect(addCategory(s, 'D')).toMatchObject({ ok: false, reason: 'limit' });
  });
  it.each([['', 'empty'], ['   ', 'empty'], ['　', 'empty'], ['食料品', 'duplicate'], [' その他 ', 'duplicate']])('AC-15 「%s」は追加しない（%s）', (name, reason) => {
    const r = addCategory(initialState(), name);
    expect(r).toMatchObject({ ok: false, reason });
    expect(r.state.cats).toHaveLength(9);
  });
  it('AC-15 20文字を超える分は切り捨てる', () => {
    const r = addCategory(initialState(), 'あ'.repeat(25));
    expect(r.ok && r.state.cats.at(-1)?.name).toBe('あ'.repeat(20));
  });
});

describe('renameCategory', () => {
  it('AC-11 改名する。ID と色は変わらない', () => {
    const r = renameCategory(initialState(), 'food', '食費');
    expect(r.ok).toBe(true);
    expect(r.state.cats[0]).toEqual({ id: 'food', name: '食費', color: 0 });
  });
  it('AC-15 空・空白だけ・他の費目との重複は改名しない。同じ名前のままは何もしない', () => {
    for (const n of ['', '  ', 'その他']) {
      const r = renameCategory(initialState(), 'food', n);
      expect(r.ok).toBe(false);
      expect(names(r.state)[0]).toBe('食料品');
    }
    expect(renameCategory(initialState(), 'food', '食料品').ok).toBe(true);
    expect(renameCategory(initialState(), 'nope', 'X')).toMatchObject({ ok: false, reason: 'missing' });
  });
});

describe('deleteCategory', () => {
  it('AC-16 自動分類先が削除済みなら other になる', () => {
    const r = deleteCategory(loaded(), 'food');
    expect(r.ok).toBe(true);
    expect(r.state.cats).toHaveLength(8);
    expect(resolveRows(r.state).find((x) => x.name === 'セブン-イレブン')).toMatchObject({ cat: 'other', tag: '' });
  });
  it('AC-16 その費目への修正は消え、店は自動分類に戻る', () => {
    const s = setRule(addCategory(loaded(), 'ペット').state, shopKey('ｶﾞｽﾄ'), 'c1');
    const r = deleteCategory(s, 'c1');
    expect(r.state.rules).toEqual({});
    expect(resolveRows(r.state).find((x) => x.name === 'ガスト')?.cat).toBe('dining');
  });
  it('AC-16 other は削除できない', () => {
    expect(deleteCategory(initialState(), 'other')).toMatchObject({ ok: false, reason: 'other' });
    expect(deleteCategory(initialState(), 'other').state.cats).toHaveLength(9);
  });
});
