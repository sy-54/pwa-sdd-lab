import { describe, expect, it } from 'vitest';
import { validateManifest } from '../../scripts/manifest.ts';

const html = '<main data-testid="app-root"></main>';
const ok = { id: 'demo', name: 'SDKデモ', icon: '🧪' };
const v = (m: unknown, folder = 'demo', indexHtml: string | null = html) => validateManifest(m, folder, indexHtml);

describe('validateManifest', () => {
  it('AC-01 正しい manifest は通る', () => {
    expect(v(ok)).toEqual([]);
    expect(v({ ...ok, description: '実機確認用' })).toEqual([]);
  });
  it('AC-13 name がないと name を含むエラーになる', () => {
    expect(v({ id: 'demo', icon: '🧪' }).join()).toContain('name');
  });
  it.each([
    ['オブジェクトでない', [1, 2], 'demo', html, 'manifest'],
    ['id とフォルダ名の不一致', { ...ok, id: 'other' }, 'demo', html, 'id'],
    ['id に使えない文字', { ...ok, id: 'Demo_1' }, 'Demo_1', html, 'id'],
    ['name が21文字', { ...ok, name: 'あ'.repeat(21) }, 'demo', html, 'name'],
    ['icon が2文字', { ...ok, icon: 'ab' }, 'demo', html, 'icon'],
    ['description が文字列でない', { ...ok, description: 1 }, 'demo', html, 'description'],
    ['index.html がない', ok, 'demo', null, 'index.html'],
    ['app-root がない', ok, 'demo', '<main></main>', 'app-root'],
  ])('%s', (_n, m, folder, h, word) => {
    const errs = v(m, folder as string, h as string | null);
    expect(errs.length).toBeGreaterThan(0);
    expect(errs.join()).toContain(word);
  });
  it('複合絵文字1つは icon として通る', () => {
    expect(v({ ...ok, icon: '👨‍👩‍👧' })).toEqual([]);
  });
});
