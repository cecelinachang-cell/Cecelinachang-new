"use client";

import { Check } from "lucide-react";
import { trackConversion } from "@/lib/analytics";
import { bundleCheckoutUrl, formatRupiah, type ClassBundleView } from "@/lib/bundles";
import { useAdSearch } from "@/lib/useAdSearch";

/**
 * One class bundle that includes the course on this page, offered after the
 * price card as the bigger option. Same numbers as /kursus (lib/bundles.ts):
 * the bundle's normal price, and the live sum of the single prices as the
 * only reference price. The button is the quiet one, so "Bayar Sekarang"
 * for the single class stays the main action on the page.
 */
export function BundleUpsell({ bundle, courseTitle }: { bundle: ClassBundleView; courseTitle: string }) {
  // Server render and hydration use the plain link; the browser then adds any ad tags.
  const search = useAdSearch();

  return (
    <section className="px-4 pb-12 sm:px-6 sm:pb-16" aria-labelledby="paket-title">
      <div className="mx-auto max-w-xl rounded-3xl border border-steel-line bg-mie/25 p-6 sm:p-8">
        <p className="mb-1 text-base font-bold text-rust-ink">Mau belajar lebih dari satu kelas?</p>
        <h2 id="paket-title" className="font-display text-2xl font-extrabold leading-tight tracking-[-0.015em] sm:text-3xl">
          {bundle.title}: {bundle.classTitles.length} kelas sekaligus
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-kecap/80">
          {courseTitle} sudah termasuk di paket ini, bersama {bundle.classTitles.length - 1} kelas lainnya.
        </p>
        <ul className="mt-5 space-y-2.5">
          {bundle.classTitles.map((title) => (
            <li key={title} className="flex items-start gap-3 text-lg leading-snug">
              <Check className="mt-0.5 h-6 w-6 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
              <span>{title}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 border-t border-dashed border-kecap/20 pt-5">
          {bundle.singlesTotal && (
            <p className="text-kecap/70">
              Kalau beli satuan <s>{formatRupiah(bundle.singlesTotal)}</s>
            </p>
          )}
          <p className="font-display text-3xl font-extrabold tracking-[-0.02em]">{formatRupiah(bundle.price)}</p>
        </div>
        <a
          href={bundleCheckoutUrl(bundle.lynkId, bundle.key, search)}
          rel="noopener"
          onClick={() =>
            trackConversion("checkout_open", `bundle-${bundle.key}`, {
              contentName: bundle.title,
              contentType: "course",
              value: bundle.price,
            })
          }
          className="tap-target mt-5 inline-flex min-h-14 w-full items-center justify-center rounded-xl border-2 border-kecap bg-white px-6 py-4 text-center text-base font-bold text-kecap transition-colors duration-150 hover:bg-kecap hover:text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-mie motion-reduce:transition-none sm:text-lg"
        >
          Beli Paket · {formatRupiah(bundle.price)}
        </a>
        <p className="mt-4 text-sm leading-relaxed text-kecap/70">
          Cara bayar dan cara akses kelasnya sama: lewat Gmail yang kamu isi waktu bayar.
        </p>
      </div>
    </section>
  );
}
