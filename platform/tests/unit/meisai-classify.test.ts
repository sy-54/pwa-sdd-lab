import { describe, expect, it } from 'vitest';
import { autoClassify, normalize, shopKey } from '../../apps/meisai-navi/classify.js';

describe('normalize / shopKey', () => {
  it('AC-02 半角カナを全角に、英字を大文字に、小書きのカナを大書きにする', () => {
    expect(normalize('ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ')).toBe('セブン-イレブン');
    expect(normalize('ﾌｧﾐﾘｰﾏｰﾄ')).toBe('フアミリーマート');
    expect(normalize('Netflix.com')).toBe('NETFLIX.COM');
  });
  it('AC-02 shopKey は空白と記号を除く（長音は残す）', () => {
    expect(shopKey('UBER *EATS')).toBe('UBEREATS');
    expect(shopKey('APPLE.COM/BILL')).toBe('APPLECOMBILL');
    expect(shopKey('ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ')).toBe('セブンイレブン');
    expect(shopKey('個人商店 カワムラ')).toBe(shopKey('個人商店カワムラ'));
    expect(shopKey('ｽｰﾊﾟｰ')).toBe('スーパー');
  });
});

describe('autoClassify', () => {
  it.each([
    ['ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ', 'food', 'conv'],
    ['ﾌｱﾐﾘｰﾏｰﾄ', 'food', 'conv'],
    ['ライフ 中野駅前店', 'food', 'super'],
    ['ｶﾞｽﾄ', 'dining', 'rest'],
    ['ｽﾀｰﾊﾞﾂｸｽ ｺｰﾋｰ', 'dining', 'cafe'],
    ['UBER *EATS', 'dining', 'deli'],
    ['AMAZON.CO.JP', 'shop', 'ec'],
    ['ﾏﾂﾓﾄｷﾖｼ', 'shop', 'daily'],
    ['NETFLIX.COM', 'subs', 'subs'],
    ['APPLE.COM/BILL', 'subs', 'subs'],
    ['ﾄﾞｺﾓご利用料金', 'util', 'tel'],
    ['au PAY', 'util', 'tel'],
    ['東京ガス', 'util', 'energy'],
    ['ﾓﾊﾞｲﾙSuica', 'move', 'move'],
    ['楽天トラベル', 'fun', 'fun'],
    ['さくら歯科クリニック', 'life', 'life'],
    ['個人商店カワムラ', 'other', ''],
  ])('AC-02 %s → %s', (name, cat, tag) => {
    expect(autoClassify(name)).toEqual({ cat, tag });
  });
  it('AC-02 複数のキーワードに当たるときは、いちばん長い一致を採る', () => {
    expect(autoClassify('ガスト 新宿店').cat).toBe('dining'); // 「ガス」より「ガスト」
    expect(autoClassify('AMAZON PRIME').cat).toBe('subs'); // 「AMAZON」より「AMAZONPRIME」
    expect(autoClassify('ENEOSでんき').cat).toBe('util'); // 「ENEOS」より「ENEOSでんき」
    expect(autoClassify('ｲｵﾝｼﾈﾏ').cat).toBe('fun'); // 「イオン」より「イオンシネマ」
  });
  it('AC-02 短い英字は単語として一致したときだけ採る', () => {
    expect(autoClassify('RESTAURANT ABC').cat).toBe('other'); // AU を含むが単語ではない
  });
});
