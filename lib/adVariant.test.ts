import { describe, expect, it } from 'vitest';
import { landingPages } from '@/app/data/landing-pages';
import { matchAdVariant } from './adVariant';

const bakso = landingPages['bakso-sapi-premium'].adVariants;

describe('matchAdVariant', () => {
  it('matches the live ad names to their headline', () => {
    expect(matchAdVariant(bakso, 'B-pabrik-18th')).toBe('pabrik');
    expect(matchAdVariant(bakso, 'A-reel-kenyal')).toBe('kenyal');
  });

  it('ignores case', () => {
    expect(matchAdVariant(bakso, 'C-PABRIK-baru')).toBe('pabrik');
  });

  it('keeps the default headline for other ads and organic visits', () => {
    expect(matchAdVariant(bakso, 'H1-testimoni')).toBeNull();
    expect(matchAdVariant(bakso, '')).toBeNull();
    expect(matchAdVariant(bakso, null)).toBeNull();
    expect(matchAdVariant(undefined, 'B-pabrik-18th')).toBeNull();
  });

  it('every variant has a hook and a unique key', () => {
    for (const [slug, copy] of Object.entries(landingPages)) {
      const keys = (copy.adVariants ?? []).map((v) => v.key);
      expect(new Set(keys).size, slug).toBe(keys.length);
      for (const v of copy.adVariants ?? []) {
        expect(v.hook.trim(), `${slug}/${v.key}`).not.toBe('');
        expect(v.key, `${slug}/${v.key}`).toMatch(/^[a-z0-9-]+$/);
      }
    }
  });
});
