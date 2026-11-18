import { describe, expect, it } from 'vitest';
import { armPath, chooseArm, isSplitActive } from './lpSplit';

describe('chooseArm', () => {
  it('splits new visitors by the coin flip and saves the arm', () => {
    expect(chooseArm(null, null, () => 0.2)).toEqual({ arm: 'a', fresh: true });
    expect(chooseArm(null, null, () => 0.7)).toEqual({ arm: 'b', fresh: true });
  });

  it('keeps a returning visitor in the same arm', () => {
    expect(chooseArm(null, 'b', () => 0.1)).toEqual({ arm: 'b', fresh: false });
    expect(chooseArm(null, 'a', () => 0.9)).toEqual({ arm: 'a', fresh: false });
  });

  it('lets ?lp= force an arm, and only rewrites the cookie when it changes', () => {
    expect(chooseArm('b', 'a')).toEqual({ arm: 'b', fresh: true });
    expect(chooseArm('B', 'b')).toEqual({ arm: 'b', fresh: false });
  });

  it('ignores junk values', () => {
    expect(chooseArm('z', 'x', () => 0.9)).toEqual({ arm: 'b', fresh: true });
  });

  it('shows the plain page C only when asked for, never by the coin flip', () => {
    expect(chooseArm('c', null)).toEqual({ arm: 'c', fresh: true });
    expect(chooseArm(null, 'c', () => 0.1)).toEqual({ arm: 'c', fresh: false });
    for (const r of [0, 0.25, 0.49, 0.5, 0.75, 0.999999]) {
      expect(['a', 'b']).toContain(chooseArm(null, null, () => r).arm);
    }
  });
});

describe('armPath', () => {
  it('maps arm and ad headline to the internal route', () => {
    expect(armPath('bakso-sapi-premium', 'a', null)).toBe('/lp/bakso-sapi-premium');
    expect(armPath('bakso-sapi-premium', 'a', 'ibu')).toBe('/lp/bakso-sapi-premium/v/ibu');
    expect(armPath('bakso-sapi-premium', 'b', null)).toBe('/lp/bakso-sapi-premium/b');
    expect(armPath('bakso-sapi-premium', 'b', 'kenyal')).toBe('/lp/bakso-sapi-premium/b/v/kenyal');
    expect(armPath('bakso-sapi-premium', 'c', null)).toBe('/lp/bakso-sapi-premium/c');
    expect(armPath('bakso-sapi-premium', 'c', 'ibu')).toBe('/lp/bakso-sapi-premium/c/v/ibu');
  });
});

describe('isSplitActive', () => {
  it('runs on the Bakso page only', () => {
    expect(isSplitActive('bakso-sapi-premium')).toBe(true);
    expect(isSplitActive('otak-otak')).toBe(false);
  });
});
