import { describe, expect, it } from 'vitest';
import { POLICIES } from './policies';

describe('course refund wording', () => {
  it('keeps "no refund" but leaves room for a class with a guarantee', () => {
    expect(POLICIES.COURSE_REFUND).toContain('tidak dapat dikembalikan');
    expect(POLICIES.COURSE_REFUND).toContain('kecuali');
    expect(POLICIES.COURSE_REFUND).toContain('Syarat & Ketentuan');
    expect(POLICIES.COURSE_REFUND_SHORT).toContain('kecuali kelas bergaransi');
  });
});
