import { describe, expect, it } from 'vitest';
import { monthLabel, share, yen } from '../../apps/meisai-navi/format.js';

describe('format', () => {
  it('AC-01 金額は数字と3桁区切りのカンマのみ', () => {
    expect(yen(3804)).toBe('3,804');
    expect(yen(0)).toBe('0');
    expect(yen(1234567.4)).toBe('1,234,567');
    expect(yen(-1200)).toBe('-1,200');
  });
  it('AC-02 割合は小数1桁と %', () => {
    expect(share(1234, 3804)).toBe('32.4%');
    expect(share(1, 3)).toBe('33.3%');
    expect(share(5, 5)).toBe('100.0%');
    expect(share(5, 0)).toBe('0.0%');
  });
  it('月の表示名', () => {
    expect(monthLabel('2026-09')).toBe('9月');
    expect(monthLabel('2026-10', true)).toBe('2026年10月');
  });
});
