import { describe, expect, it } from 'vitest';
import { backupFileName, buildBackup, parseBackup } from '../../launcher/backup.js';

const at = new Date(2026, 10, 14, 9, 30);

describe('buildBackup', () => {
  it('AC-09 全アプリのデータを所定の形にまとめる', async () => {
    const b = await buildBackup({ demo: { memo: '牛乳' } }, at);
    expect(b).toEqual({ format: 'pwa-backup', version: 1, exportedAt: at.toISOString(), apps: { demo: { memo: '牛乳' } } });
  });
  it('AC-09 Blob は深い位置にあっても $blob（dataURL）に変換する', async () => {
    const b = await buildBackup({ demo: { photos: [{ id: 1, image: new Blob(['abc'], { type: 'image/jpeg' }) }] } }, at);
    expect(b.apps.demo.photos[0]).toEqual({ id: 1, image: { $blob: 'data:image/jpeg;base64,YWJj' } });
  });
  it('ファイル名は pwa-backup-YYYYMMDD.json', () => expect(backupFileName(at)).toBe('pwa-backup-20261114.json'));
});

describe('parseBackup', () => {
  it('AC-10 書き出したものを読み戻すと同じ値に戻る（Blob を含む）', async () => {
    const apps = { demo: { memo: '牛乳', n: 0, flag: false, none: null, photo: new Blob([new Uint8Array([0, 255, 10])], { type: 'image/jpeg' }) } };
    const back = parseBackup(JSON.stringify(await buildBackup(apps, at)));
    expect({ ...back.demo, photo: undefined }).toEqual({ ...apps.demo, photo: undefined });
    expect(back.demo.photo.type).toBe('image/jpeg');
    expect([...new Uint8Array(await back.demo.photo.arrayBuffer())]).toEqual([0, 255, 10]);
  });
  it.each([
    ['JSON でない', 'これはJSONではない'],
    ['オブジェクトでない', '[1]'],
    ['format が違う', JSON.stringify({ format: 'other', version: 1, apps: {} })],
    ['version が違う', JSON.stringify({ format: 'pwa-backup', version: 2, apps: {} })],
    ['apps がない', JSON.stringify({ format: 'pwa-backup', version: 1 })],
    ['appId が不正', JSON.stringify({ format: 'pwa-backup', version: 1, apps: { 'Bad/Id': {} } })],
    ['アプリのデータがオブジェクトでない', JSON.stringify({ format: 'pwa-backup', version: 1, apps: { demo: [1] } })],
  ])('AC-11 %s は拒否する', (_n, text) => expect(() => parseBackup(text)).toThrow('読み込めないファイルです'));
});
