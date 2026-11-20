import { Gift, ShieldCheck } from 'lucide-react';
import type { CourseBonus, CourseGuarantee } from '@/app/data/landing-pages';

/**
 * The guarantee and the dated bonus (LandingCopy.guarantee / .bonus), shown
 * next to the price. `size="lg"` is the plain page's large text.
 */
export function GuaranteeBox({
  guarantee,
  size = 'md',
  className = '',
}: {
  guarantee: CourseGuarantee;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const text = size === 'lg' ? 'text-lg' : 'text-base';
  return (
    <div className={`rounded-2xl border-2 border-seledri/40 bg-seledri/5 p-4 sm:p-5 ${className}`} data-guarantee>
      <p className="flex items-center gap-2 font-display text-xl font-extrabold leading-tight text-kecap">
        <ShieldCheck className="h-6 w-6 shrink-0 text-seledri" strokeWidth={2.5} aria-hidden="true" />
        {guarantee.title}
      </p>
      <p className={`mt-2 leading-relaxed text-kecap ${text}`}>{guarantee.body}</p>
    </div>
  );
}

export function BonusBox({
  bonus,
  size = 'md',
  className = '',
}: {
  bonus: CourseBonus;
  size?: 'md' | 'lg';
  className?: string;
}) {
  const text = size === 'lg' ? 'text-lg' : 'text-base';
  return (
    <div className={`rounded-2xl border-2 border-dashed border-sambal/50 bg-mie/15 p-4 sm:p-5 ${className}`} data-bonus>
      <p className="flex items-center gap-2 font-display text-xl font-extrabold leading-tight text-kecap">
        <Gift className="h-6 w-6 shrink-0 text-sambal" strokeWidth={2.5} aria-hidden="true" />
        {bonus.title}
      </p>
      <p className={`mt-2 leading-relaxed text-kecap ${text}`}>{bonus.body}</p>
    </div>
  );
}

/** One line each for the first screen, under the pay button. */
export function OfferShortLines({
  guarantee,
  bonus,
  className = '',
}: {
  guarantee?: CourseGuarantee;
  bonus: CourseBonus | null;
  className?: string;
}) {
  if (!guarantee && !bonus) return null;
  return (
    <ul className={`space-y-2 ${className}`}>
      {bonus && (
        <li className="flex items-start gap-2.5 text-lg leading-snug text-kecap">
          <Gift className="mt-0.5 h-5 w-5 shrink-0 text-sambal" strokeWidth={2.5} aria-hidden="true" />
          <span>
            <strong>{bonus.title.replace(/^Bonus:\s*/, 'Bonus ')}</strong> untuk yang daftar sampai{' '}
            {formatEnd(bonus.endsAt)}
          </span>
        </li>
      )}
      {guarantee && (
        <li className="flex items-start gap-2.5 text-lg leading-snug text-kecap">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-seledri" strokeWidth={2.5} aria-hidden="true" />
          <span>
            <strong>{guarantee.title}.</strong> {guarantee.short}
          </span>
        </li>
      )}
    </ul>
  );
}

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

/** "14 Desember", read in WIB from the ISO time. */
export function formatEnd(iso: string): string {
  const wib = new Date(new Date(iso).getTime() + 7 * 3600 * 1000);
  return `${wib.getUTCDate()} ${MONTHS[wib.getUTCMonth()]}`;
}
