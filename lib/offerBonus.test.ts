import { describe, expect, it } from 'vitest';
import { activeBonus, getLandingCopy, isShortLanding } from '@/app/data/landing-pages';
import { formatEnd } from '@/components/landing/OfferExtras';

const copy = getLandingCopy('bakso-sapi-premium');
if (!copy || isShortLanding(copy)) throw new Error('bakso copy missing');

describe('Bakso bonus class', () => {
  it('shows until 14 Dec 2026 23:59 WIB and disappears after', () => {
    expect(activeBonus(copy.bonus, new Date('2026-12-14T23:59:00+07:00'))).not.toBeNull();
    expect(activeBonus(copy.bonus, new Date('2026-12-15T00:00:01+07:00'))).toBeNull();
  });

  it('names the end date in WIB', () => {
    expect(formatEnd(copy.bonus!.endsAt)).toBe('14 Desember');
  });

  it('has no "senilai" or made-up total value', () => {
    expect(JSON.stringify(copy)).not.toMatch(/senilai/i);
  });
});

describe('Bakso guarantee', () => {
  it('states the conditions on the first-screen line too', () => {
    expect(copy.guarantee?.short).toBe(
      'Praktik 2 kali dalam 30 hari, sudah dibantu Cece tapi baksonya belum kenyal? Uang kelas kembali penuh.',
    );
  });
});
