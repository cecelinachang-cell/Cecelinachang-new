import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Course } from '@/lib/courses';
import { getLandingCopy, hasPlainPage } from '@/app/data/landing-pages';
import { PlainLandingBody } from './PlainLandingBody';

const copy = getLandingCopy('bakso-sapi-premium');
if (!hasPlainPage(copy)) throw new Error('bakso-sapi-premium has no plain copy');

const course = {
  slug: 'bakso-sapi-premium',
  title: 'Kelas Bakso Sapi Premium',
  price: 'Rp 499.000',
  students: 469,
  imageUrl: '/x.jpg',
  benefits: ['Teknik menggiling dan menguleni daging sapi'],
} as unknown as Course;

const html = renderToStaticMarkup(<PlainLandingBody course={course} copy={copy} hook="Bakso kenyal ala pabrik" />);

describe('PlainLandingBody (arm C)', () => {
  it('says what the class is, the price and the pay button before anything else', () => {
    const what = html.indexOf('Kelas video 40 menit');
    const price = html.indexOf('Rp 499.000');
    const pay = html.indexOf('Bayar Sekarang');
    const proof = html.indexOf('Kata murid yang sudah praktek');
    expect(what).toBeGreaterThan(-1);
    expect(what).toBeLessThan(price);
    expect(price).toBeLessThan(pay);
    expect(pay).toBeLessThan(proof);
  });

  it('tells the buyer what the Lynk form asks for', () => {
    expect(html).toContain('Cara daftar');
    expect(html).toContain('nomor WhatsApp');
    expect(html).toContain('@gmail.com');
  });

  it('shows the FAQ answers without a tap, and the guarantee instead of "no refund"', () => {
    expect(html).not.toContain('<details');
    expect(html).toContain('Saya pemula, bisa ikut?');
    expect(html).not.toContain('dana tidak dapat dikembalikan');
    expect(html).toContain('Garansi Bakso Kenyal');
    expect(html).toContain('uang kelasnya Cece kembalikan penuh');
  });

  it('puts the guarantee on the first screen, before the student quotes', () => {
    const guarantee = html.indexOf('Garansi Bakso Kenyal');
    const proof = html.indexOf('Kata murid yang sudah praktek');
    expect(guarantee).toBeGreaterThan(-1);
    expect(guarantee).toBeLessThan(proof);
  });

  it('leaves out the quiz and the long-page sections', () => {
    expect(html).not.toContain('id="cek"');
    expect(html).not.toContain('Kenapa bakso rumahan sering gagal?');
    expect(html).not.toContain('Dari dapur pabrik');
  });

  it('marks itself so the cookie notice goes compact, and reports as arm C', () => {
    expect(html).toContain('data-lp-plain');
  });
});
