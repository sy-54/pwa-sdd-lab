import { describe, expect, it } from 'vitest';
import { channel } from '../../sdk/notify.js';

describe('channel', () => {
  it('AC-07 拒否されていればトースト', () => expect(channel('denied', true)).toBe('toast'));
  it('未対応ならトースト', () => expect(channel('granted', false)).toBe('toast'));
  it('許可済みなら OS 通知', () => expect(channel('granted', true)).toBe('os'));
  it('未回答なら許可を求める', () => expect(channel('default', true)).toBe('ask'));
});
