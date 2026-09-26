import { describe, expect, it } from 'vitest';
import { fitImageWithin } from '../../../../src/lib/image';

describe('fitImageWithin', () => {
  it('preserves portrait, landscape, panoramic, and small-image aspect ratios without cropping', () => {
    expect(fitImageWithin(1200, 2400, 2560, 2560)).toEqual({ width: 1200, height: 2400 });
    expect(fitImageWithin(6000, 4000, 2560, 2560)).toEqual({ width: 2560, height: 1707 });
    expect(fitImageWithin(12000, 1000, 2560, 2560)).toEqual({ width: 2560, height: 213 });
    expect(fitImageWithin(320, 180, 2560, 2560)).toEqual({ width: 320, height: 180 });
  });

  it('rejects invalid source dimensions', () => {
    expect(() => fitImageWithin(0, 800, 2560, 2560)).toThrow('positive numbers');
  });
});
