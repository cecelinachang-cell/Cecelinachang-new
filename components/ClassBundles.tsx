"use client";

import { useSyncExternalStore } from 'react';
import { CheckCircle2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Marginalia } from '@/components/Marginalia';
import { trackConversion } from '@/lib/analytics';
import { bundleCheckoutUrl, formatRupiah, type ClassBundleView } from '@/lib/bundles';

// Nothing to subscribe to: the query string is read once per visit.
const subscribeNever = () => () => {};
const readSearch = () => window.location.search;

/** The class bundles at their normal price (lib/bundles.ts). No countdown, no sale. */
export function ClassBundles({ bundles, contained = true }: { bundles: ClassBundleView[]; contained?: boolean }) {
  // Server render and hydration use the plain links; the browser then adds any ad tags.
  const search = useSyncExternalStore(subscribeNever, readSearch, () => '');

  return (
    <section
      id="paket-kelas"
      // `contained={false}` when the page already supplies the max-width and side padding.
      className={contained ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-20' : 'mb-10 sm:mb-16 scroll-mt-20'}
    >
      <div className="rounded-3xl border-2 border-terracotta/30 bg-butter/20 p-5 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="font-serif text-fluid-h2 font-bold text-rust-ink mb-2">Paket Kelas Cece</h2>
          <Marginalia rotate={-1} className="block">
            beberapa kelas sekaligus, lebih hemat daripada beli satuan.
          </Marginalia>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
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
                {b.singlesTotal && (
                  <div className="text-sm text-charcoal-brown/50">
                    Kalau beli satuan <span className="line-through">{formatRupiah(b.singlesTotal)}</span>
                    <span className="ml-2 inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded">
                      Hemat {formatRupiah(b.singlesTotal - b.price)}
                    </span>
                  </div>
                )}
                <div className="font-serif text-3xl font-bold text-rust-ink mb-4">{formatRupiah(b.price)}</div>
                <Button
                  href={bundleCheckoutUrl(b.lynkId, b.key, search)}
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
