import { describe, expect, it } from 'vitest';
import { normalizePhone, parseCheckoutBody } from './checkout';

const valid = {
  courseSlug: 'bakso-sapi-premium',
  name: 'Siti',
  email: ' Siti@Gmail.com ',
  phone: '+62 812-3456-7890',
};

describe('parseCheckoutBody', () => {
  it('normalises a valid body', () => {
    expect(parseCheckoutBody(valid)).toEqual({
      courseSlug: 'bakso-sapi-premium',
      name: 'Siti',
      email: 'siti@gmail.com',
      phone: '081234567890',
    });
  });

  it('rejects bad fields', () => {
    expect(parseCheckoutBody(null)).toHaveProperty('error');
    expect(parseCheckoutBody({ ...valid, courseSlug: '' })).toHaveProperty('error');
    expect(parseCheckoutBody({ ...valid, name: 'S' })).toHaveProperty('error');
    expect(parseCheckoutBody({ ...valid, email: 'siti@' })).toHaveProperty('error');
    expect(parseCheckoutBody({ ...valid, phone: '021555123' })).toHaveProperty('error');
  });

  it('ignores a client-sent price', () => {
    expect(parseCheckoutBody({ ...valid, amount: 1 })).not.toHaveProperty('amount');
  });
});

describe('normalizePhone', () => {
  it('turns 62/+62 prefixes into 0', () => {
    expect(normalizePhone('6281234567890')).toBe('081234567890');
    expect(normalizePhone('0812 3456 7890')).toBe('081234567890');
  });
});
