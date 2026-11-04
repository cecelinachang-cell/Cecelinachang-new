"use client";

import { useSyncExternalStore } from 'react';
import { CheckCircle2, Clock, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Marginalia } from '@/components/Marginalia';
import { trackConversion } from '@/lib/analytics';
import { formatRupiah, isPromoActive, promoCheckoutUrl, type PromoBundleView } from '@/lib/promo1111';

// Nothing to subscribe to: the page is read once per visit.
const subscribeNever = () => () => {};

function readPromoSearch(): string | null {
  const query = window.location.search;
  return isPromoActive(Date.now(), query) ? query : null;
}

/**
 * The 11.11 bundle offer. Rendered only in the browser and only inside the
 * promo window (lib/promo1111.ts), so cached pages built before or after the
 * promo never show a stale offer.
 */
export function Promo1111({ bundles, contained = true }: { bundles: PromoBundleView[]; contained?: boolean }) {
  // The visitor's query string (ad tags) while the promo is on, else null.
  // Server render and hydration see null; the browser then reads the clock.
  const search = useSyncExternalStore(subscribeNever, readPromoSearch, () => null);

  if (search === null) return null;

  return (
    <section
      id="promo-1111"
      // `contained={false}` when the page already supplies the max-width and side padding.
      className={contained ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20' : 'mb-10 sm:mb-16 scroll-mt-20'}
    >
      <div className="rounded-3xl border-2 border-terracotta/40 bg-butter/20 p-5 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 bg-terracotta text-white px-3 py-1 rounded-full text-xs sm:text-sm font-bold mb-3">
            <Clock className="w-4 h-4" /> Promo 11.11 · cuma 3 hari
          </div>
          <h2 className="font-serif text-fluid-h2 font-bold text-rust-ink mb-2">Paket Kelas Cece</h2>
          <Marginalia rotate={-1} className="block">
            berakhir Jumat 13 November, jam 23.59. setelah itu harga kembali normal.
          </Marginalia>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {bundles.map((b) => (
            <div key={b.key} className="flex flex-col bg-white rounded-2xl shadow-sm border border-butter/40 p-5 sm:p-6">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-1">{b.title}</h3>
              <p className="text-sm text-charcoal-brown/70 mb-4">{b.pitch}</p>
              <ul className="space-y-1.5 mb-5 text-sm text-charcoal-brown/80">
                {b.classTitles.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                {b.normalPrice && (
                  <div className="text-sm text-charcoal-brown/50">
                    <span className="line-through">{formatRupiah(b.normalPrice)}</span>
                    <span className="ml-2 inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                      Hemat {formatRupiah(b.normalPrice - b.price)}
                    </span>
                  </div>
                )}
                <div className="font-serif text-3xl font-bold text-rust-ink mb-4">{formatRupiah(b.price)}</div>
                <Button
                  href={promoCheckoutUrl(b.lynkId, b.key, search)}
                  external
                  size="lg"
                  fullWidth
                  onClick={() =>
                    trackConversion('checkout_open', `bundle-${b.key}`, {
                      contentName: b.title,
                      contentType: 'course',
                      value: b.price,
                    })
                  }
                >
                  <Lock className="w-5 h-5 mr-2" /> Beli Paket
                </Button>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-charcoal-brown/60 text-center mt-5">
          Bayar via QRIS, e-wallet, atau Virtual Account. Akses kelas langsung masuk ke Gmail yang kamu isi. Termasuk konsultasi dengan Cece.
        </p>
      </div>
    </section>
  );
}
