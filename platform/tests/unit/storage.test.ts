import { describe, expect, it } from 'vitest';
import { createStorage, currentAppId, dumpAll, memoryBackend, restoreApps } from '../../sdk/storage.js';

describe('createStorage', () => {
  it('AC-03 set した値を get で読める', async () => {
    const s = createStorage('demo', memoryBackend());
    await s.set('memo', '牛乳');
    await s.set('list', [{ id: 1, done: false }]);
    expect(await s.get('memo')).toBe('牛乳');
    expect(await s.get('list')).toEqual([{ id: 1, done: false }]);
  });
  it('未設定のキーは既定値（省略時 null）を返す', async () => {
    const s = createStorage('demo', memoryBackend());
    expect(await s.get('x')).toBeNull();
    expect(await s.get('x', 0)).toBe(0);
  });
  it('AC-04 appId が違えば見えない', async () => {
    const b = memoryBackend();
    await createStorage('a', b).set('k', 1);
    expect(await createStorage('b', b).get('k', 'なし')).toBe('なし');
    expect(await createStorage('b', b).keys()).toEqual([]);
    expect(await createStorage('a', b).keys()).toEqual(['k']);
  });
  it('接頭辞が同じ別アプリ（a と a-b）も混ざらない', async () => {
    const b = memoryBackend();
    await createStorage('a-b', b).set('k', 1);
    expect(await createStorage('a', b).keys()).toEqual([]);
  });
  it('remove で消える', async () => {
    const s = createStorage('demo', memoryBackend());
    await s.set('k', 1);
    await s.remove('k');
    expect(await s.get('k', 'なし')).toBe('なし');
  });
  it('保存後に元のオブジェクトを書き換えても保存値は変わらない', async () => {
    const s = createStorage('demo', memoryBackend());
    const v = { n: 1 };
    await s.set('k', v);
    v.n = 2;
    expect(await s.get('k')).toEqual({ n: 1 });
  });
  it('不正な appId・キーは例外', async () => {
    expect(() => createStorage('Bad/Id', memoryBackend())).toThrow();
    await expect(createStorage('demo', memoryBackend()).set('', 1)).rejects.toThrow();
  });
});

describe('currentAppId', () => {
  it.each([
    ['/apps/demo/', 'demo'],
    ['/pwa-sdd-lab/apps/habit-tracker/index.html', 'habit-tracker'],
    ['/pwa-sdd-lab/', null],
  ])('%s → %s', (path, id) => expect(currentAppId(path)).toBe(id));
});

describe('dumpAll / restoreApps', () => {
  it('全アプリを appId ごとにまとめる', async () => {
    const b = memoryBackend();
    await createStorage('a', b).set('k', 1);
    await createStorage('b', b).set('x', 'y');
    expect(await dumpAll(b)).toEqual({ a: { k: 1 }, b: { x: 'y' } });
  });
  it('ファイルにあるアプリは丸ごと置き換え、ないアプリは変えない', async () => {
    const b = memoryBackend();
    await createStorage('a', b).set('old', 1);
    await createStorage('b', b).set('keep', 2);
    await restoreApps({ a: { new: 3 } }, b);
    expect(await dumpAll(b)).toEqual({ a: { new: 3 }, b: { keep: 2 } });
  });
});
