import { describe, expect, it } from 'vitest';
import { decodeText, parseCsv, readStatement } from '../../apps/meisai-navi/csv.js';

const HEAD = '"利用日","利用店名・商品名","利用者","支払方法","利用金額","支払手数料","支払総額","11月支払金額","12月繰越残高","新規サイン"';
const line = (d: string, n: string, a: string, pay = '1回払い', fee = '0') => `"${d}","${n}","本人","${pay}","${a}","${fee}","${a}","${a}","0","*"`;

describe('parseCsv', () => {
  it('AC-01 引用符の中のカンマ・改行・二重引用符、BOM、CRLF を扱う', () => {
    expect(parseCsv('﻿a,"b,c","d""e"\r\n"x\ny",z\r\n')).toEqual([['a', 'b,c', 'd"e'], ['x\ny', 'z']]);
  });
});

describe('readStatement', () => {
  it('AC-01 明細を読み、日付でない行を飛ばす', () => {
    const text = [HEAD, line('2026/10/01', 'ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ', '1,234'), '"","分割の内訳","","","","","","","",""', line('2026/10/12', 'ﾔﾏﾀﾞﾃﾞﾝｷ', '64800', '分割6回払い', '1,296')].join('\n');
    expect(readStatement(text)).toEqual([
      { d: '2026-10-01', n: 'ｾﾌﾞﾝ-ｲﾚﾌﾞﾝ', a: 1234, f: 0, p: '1回払い' },
      { d: '2026-10-12', n: 'ﾔﾏﾀﾞﾃﾞﾝｷ', a: 64800, f: 1296, p: '分割6回払い' },
    ]);
  });
  it('AC-01 見出しの前に余計な行があってもよく、列は部分一致で探す。返金は負の金額', () => {
    const text = 'カード利用明細\n利用日,ご利用店名,利用金額(円)\n2026/9/3,返金 ABC,"-1,500"\n';
    expect(readStatement(text)).toEqual([{ d: '2026-09-03', n: '返金 ABC', a: -1500, f: 0, p: '' }]);
  });
  it('AC-12 利用日の列がなければ「利用日」を含む理由で失敗する', () => {
    expect(() => readStatement('日付,内容,金額\n2026/10/01,A,100\n')).toThrow(/利用日/);
  });
  it('AC-12 利用店名・利用金額の列がない、明細が0行でも失敗する', () => {
    expect(() => readStatement('利用日,メモ\n2026/10/01,A\n')).toThrow(/利用店名/);
    expect(() => readStatement(HEAD + '\n')).toThrow(/1件も/);
  });
});

describe('decodeText', () => {
  it('AC-13 UTF-8 はそのまま読む', () => {
    expect(decodeText(new TextEncoder().encode('利用日,ｾﾌﾞﾝ'))).toBe('利用日,ｾﾌﾞﾝ');
  });
  it('AC-13 Shift_JIS のバイト列を読む', () => {
    // 「利用日」= 97 98 97 70 93 FA
    expect(decodeText(new Uint8Array([0x97, 0x98, 0x97, 0x70, 0x93, 0xfa, 0x2c, 0x41]))).toBe('利用日,A');
  });
});
