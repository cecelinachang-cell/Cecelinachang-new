import Link from 'next/link';
import { Check } from 'lucide-react';
import { notFound } from 'next/navigation';
import { getAllCourses } from '@/lib/courses';
import { CLASS_BUNDLES, buildClassBundles, formatRupiah } from '@/lib/bundles';
import { getBundleLanding } from '@/app/data/bundle-landing';
import { ViewContentPing } from '@/components/ViewContentPing';
import { BundlePayCta } from './BundlePayCta';
import { BundleStickyBar } from './BundleStickyBar';
import { LandingFooter } from './LandingFooter';
import { GuaranteeBox } from './OfferExtras';
import { ScrollDepthPing } from './ScrollDepthPing';
import { SelfHostedPreview } from './SelfHostedPreview';
import { WhatsAppAsk } from './WhatsAppAsk';

// Same red apron band as the class landing pages.
const apronStripes = {
  backgroundColor: 'var(--color-sambal)',
  backgroundImage:
    'repeating-linear-gradient(90deg, transparent 0 14px, rgba(255,255,255,0.08) 14px 16px)',
};

const h2 = 'font-display text-[1.625rem] font-extrabold leading-tight tracking-[-0.015em] sm:text-3xl';
const waLink =
  'w-full border-0 bg-transparent px-1 text-lg text-seledri underline decoration-seledri/40 underline-offset-4 hover:bg-transparent sm:w-auto';

/** "40 menit" → 40. Null when the catalogue has no usable length. */
function minutes(duration?: string | null): number | null {
  const m = /(\d+)\s*menit/i.exec(duration ?? '');
  return m ? Number(m[1]) : null;
}

/**
 * A bundle's own landing page (/lp/semua-kelas), in the plain layout of
 * PlainLandingBody: for women 40-60 on a phone who have just watched the ad.
 * The first screen says what the bundle is, what it costs against buying the
 * classes one by one, and has the one pay button.
 *
 * Every number is read from the live catalogue (lib/bundles.ts and the
 * courses table): the price, the "kalau beli satuan" total, the class names
 * and each video's length. The guarantee text is the bundle's own.
 */
export async function BundleLandingBody({ slug }: { slug: string }) {
  const copy = getBundleLanding(slug);
  const courses = await getAllCourses();
  const bundle = copy ? buildClassBundles(courses).find((b) => b.key === copy.bundleKey) : undefined;
  const source = copy ? CLASS_BUNDLES.find((b) => b.key === copy.bundleKey) : undefined;
  if (!copy || !bundle || !source) notFound();

  const classes = source.courseSlugs
    .map((s) => courses.find((c) => c.slug === s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));
  // Without every class in the catalogue the page would sell less than the checkout does.
  if (classes.length !== source.courseSlugs.length) notFound();

  const lengths = classes.map((c) => minutes(c.duration));
  const totalMinutes = lengths.every((n): n is number => n !== null) ? lengths.reduce((a, b) => a + b, 0) : null;
  const price = formatRupiah(bundle.price);
  // Keeps "Rp" and the number on one line inside the button.
  const payLabel = `Bayar Sekarang · ${price.replace(' ', '\u00a0')}`;
  const title = `${bundle.title} (${classes.length} kelas)`;
  const pay = { bundleKey: bundle.key, lynkId: bundle.lynkId, title, price: bundle.price };
  const ask = { courseSlug: `bundle-${bundle.key}`, courseTitle: title, price };
  const faq = [
    ...(bundle.guarantee
      ? [{ question: 'Kalau resepnya gagal, bisa refund?', answer: bundle.guarantee.body }]
      : []),
    ...copy.faq,
  ];

  const priceBlock = (
    <>
      {bundle.singlesTotal && (
        <p className="text-lg leading-snug text-kecap/75">
          Kalau beli satuan <s>{formatRupiah(bundle.singlesTotal)}</s>
        </p>
      )}
      <p className="mt-1 text-xl leading-snug">
        <strong className="font-display text-[1.75rem] font-extrabold tracking-[-0.02em]">{price}</strong>
        <span className="ml-2">{copy.priceNote}</span>
      </p>
    </>
  );

  return (
    <div data-lp-plain>
      <ViewContentPing contentId={`bundle-${bundle.key}`} contentName={title} contentType="course" value={bundle.price} />
      <ScrollDepthPing contentId={`bundle-${bundle.key}`} />

      <section id="lp-hero">
        <div style={apronStripes} className="px-4 pb-7 pt-6 text-white sm:px-6 sm:pb-10 sm:pt-10">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-display text-[2.05rem] font-extrabold leading-[1.12] tracking-[-0.03em] text-balance sm:text-5xl sm:leading-[1.08]">
              {copy.hook}
            </h1>
            <p className="mt-4 max-w-[36ch] text-xl font-medium leading-snug">{copy.what}</p>
          </div>
        </div>

        <div className="px-4 pt-6 sm:px-6 sm:pt-8">
          <div className="mx-auto max-w-3xl">
            {priceBlock}
            <BundlePayCta {...pay} label={payLabel} className="mt-4 min-h-16 w-full text-lg sm:w-auto sm:text-xl" />
            <WhatsAppAsk {...ask} label="Tanya Cece dulu lewat WhatsApp" className={`mt-3 ${waLink}`} />
            {bundle.guarantee && (
              <p className="mt-5 max-w-[44ch] text-lg leading-relaxed">
                {bundle.guarantee.short}{' '}
                <Link href="/syarat-ketentuan#refund" className="underline underline-offset-4">
                  Lihat syaratnya
                </Link>
              </p>
            )}

            <h2 className={`mt-9 ${h2}`}>Cara daftar</h2>
            <ol className="mt-4 max-w-[44ch] space-y-4">
              {copy.steps.map((step, i) => (
                <li key={step} className="flex gap-4 text-lg leading-relaxed">
                  <span
                    className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kecap font-display text-lg font-extrabold text-white"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p className="mt-5 max-w-[44ch] text-lg leading-relaxed">{copy.stepsHelp}</p>
          </div>
        </div>
      </section>

      <section className="px-4 pb-12 pt-12 sm:px-6 sm:pb-16 sm:pt-16">
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>{classes.length} kelas yang kamu dapat</h2>
          <ol className="mt-4 divide-y divide-steel-line border-y border-steel-line">
            {classes.map((c, i) => (
              <li key={c.slug} className="flex items-baseline gap-4 py-4 text-lg leading-snug">
                <span className="w-6 shrink-0 font-display font-extrabold text-sambal" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="flex-1 font-bold">{c.title}</span>
                {lengths[i] !== null && <span className="shrink-0 text-kecap/75">video {lengths[i]} menit</span>}
              </li>
            ))}
          </ol>

          <h2 className={`mt-12 ${h2}`}>Yang kamu dapat</h2>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3 text-lg leading-snug">
              <Check className="mt-0.5 h-6 w-6 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
              <span>
                Video {classes.length} kelas{totalMinutes !== null ? `, total ${totalMinutes} menit` : ''}, akses seumur hidup
              </span>
            </li>
            {copy.includes.map((item) => (
              <li key={item} className="flex items-start gap-3 text-lg leading-snug">
                <Check className="mt-0.5 h-6 w-6 shrink-0 text-seledri" strokeWidth={3} aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {bundle.guarantee && <GuaranteeBox guarantee={bundle.guarantee} size="lg" className="mt-6" />}
        </div>
      </section>

      {copy.previewVideo && (
        <section className="px-4 pb-12 sm:px-6 sm:pb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className={`mb-5 ${h2}`}>Kenalan dulu sama Cece</h2>
            <SelfHostedPreview video={copy.previewVideo} title={`Cuplikan ${bundle.title}`} courseSlug={`bundle-${bundle.key}`} />
          </div>
        </section>
      )}

      <section className="px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-3xl">
          <h2 className={h2}>Pertanyaan yang sering masuk</h2>
          <dl className="mt-2 divide-y divide-steel-line">
            {faq.map((item) => (
              <div key={item.question} className="py-5">
                <dt className="text-lg font-bold leading-snug">{item.question}</dt>
                <dd className="mt-2 max-w-[46ch] text-lg leading-relaxed">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* data-sticky-hide: the sticky bar steps aside while this button is on screen. */}
      <section data-sticky-hide className="border-t border-steel-line bg-white px-4 py-10 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className={`mb-3 ${h2}`}>{title}</h2>
          {priceBlock}
          <BundlePayCta {...pay} label={payLabel} className="mt-4 min-h-16 w-full text-lg sm:w-auto sm:text-xl" />
          <WhatsAppAsk {...ask} label="Tanya Cece dulu lewat WhatsApp" className={`mt-3 ${waLink}`} />
        </div>
      </section>

      <LandingFooter />
      <BundleStickyBar {...pay} priceLabel={price} />
    </div>
  );
}
