import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { getLandingCopy, isShortLanding } from '@/app/data/landing-pages';
import { CONTACT_EMAIL } from '@/lib/links';
import SyaratKetentuanPage from './page';

const copy = getLandingCopy('bakso-sapi-premium');
if (!copy || isShortLanding(copy) || !copy.guarantee) throw new Error('bakso guarantee missing');
const guarantee = copy.guarantee;

// renderToStaticMarkup escapes quotes and ampersands.
const escape = (text: string) => renderToStaticMarkup(<>{text}</>);
const html = renderToStaticMarkup(<SyaratKetentuanPage />);

describe('Syarat & Ketentuan', () => {
  it('renders the Bakso guarantee from the landing copy under #refund', () => {
    const refund = html.indexOf('id="refund"');
    expect(refund).toBeGreaterThan(-1);
    expect(html.indexOf(escape(guarantee.title))).toBeGreaterThan(refund);
    expect(html).toContain(escape(guarantee.body));
    expect(html).toContain('paling lambat 7 hari kerja');
    expect(html).toContain('akses kelas dan bonusnya dicabut');
    expect(html).toContain('hanya berlaku untuk Kelas Bakso Sapi Premium');
  });

  it('describes Lynk payment, not manual transfer for classes', () => {
    expect(html).toContain('lynk.id');
    expect(html).toContain('QRIS, e-wallet, atau Virtual Account');
    expect(html).not.toContain('info rekening tujuan');
  });

  it('names the seller and how to reach them', () => {
    expect(html).toContain('CeceLinaChang Store');
    expect(html).toContain('Jl. Pulau Dewa I No.26');
    expect(html).toContain('0812-8425-0718');
    expect(html).toContain(CONTACT_EMAIL);
    expect(html).not.toContain('halo@');
  });
});
