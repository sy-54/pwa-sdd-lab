import { describe, expect, it } from 'vitest';
import { fitSize } from '../../sdk/camera.js';

describe('fitSize', () => {
  it('AC-08 長辺を max に合わせ、縦横比を保つ', () => {
    expect(fitSize(3000, 2000, 1280)).toEqual({ width: 1280, height: 853 });
    expect(fitSize(2000, 3000, 1280)).toEqual({ width: 853, height: 1280 });
  });
  it('max 以下なら拡大しない', () => expect(fitSize(800, 600, 1280)).toEqual({ width: 800, height: 600 }));
  it('極端に細長くても 1px 未満にしない', () => expect(fitSize(10000, 2, 1000)).toEqual({ width: 1000, height: 1 }));
});
