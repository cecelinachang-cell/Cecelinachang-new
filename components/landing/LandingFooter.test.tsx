import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LandingFooter } from './LandingFooter';

const html = renderToStaticMarkup(<LandingFooter />);

describe('LandingFooter', () => {
  it('links to the about, contact, refund and legal pages', () => {
    for (const href of ['/tentang', '/kontak', '/syarat-ketentuan', '/syarat-ketentuan#refund', '/kebijakan-privasi']) {
      expect(html).toContain(`href="${href}"`);
    }
  });

  it('says who is selling, where, and the WhatsApp number', () => {
    expect(html).toContain('CeceLinaChang Store · Jl. Pulau Dewa I No.26, Kota Tangerang · WhatsApp 0812-8425-0718');
  });
});
