import Link from 'next/link';
import { SITE_NAME } from '@/lib/seo';

// The site footer is hidden on /lp/* (see app/lp/layout.tsx); this keeps only
// the legal links.
export function LandingFooter() {
  return (
    <footer className="border-t border-steel-line px-4 py-8 text-center text-sm text-steel">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-1" aria-label="Legal">
        <Link href="/syarat-ketentuan" className="inline-flex min-h-11 items-center hover:text-sambal">Syarat &amp; Ketentuan</Link>
        <Link href="/kebijakan-privasi" className="inline-flex min-h-11 items-center hover:text-sambal">Kebijakan Privasi</Link>
        <Link href="/pengembalian-dana" className="inline-flex min-h-11 items-center hover:text-sambal">Pengembalian Dana</Link>
      </nav>
      <p>© {new Date().getFullYear()} {SITE_NAME}</p>
    </footer>
  );
}
