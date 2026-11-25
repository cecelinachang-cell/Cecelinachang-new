import Link from 'next/link';
import { STORE } from '@/lib/localStore';

// The site footer is hidden on /lp/* (see app/lp/layout.tsx); this keeps the
// legal links plus who is selling: store name, address and WhatsApp.
export function LandingFooter() {
  return (
    <footer className="border-t border-steel-line px-4 py-8 text-center text-sm text-steel">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-1" aria-label="Legal">
        <Link href="/tentang" className="inline-flex min-h-11 items-center hover:text-sambal">Tentang Cece</Link>
        <Link href="/kontak" className="inline-flex min-h-11 items-center hover:text-sambal">Kontak</Link>
        <Link href="/syarat-ketentuan" className="inline-flex min-h-11 items-center hover:text-sambal">Syarat &amp; Ketentuan</Link>
        <Link href="/syarat-ketentuan#refund" className="inline-flex min-h-11 items-center hover:text-sambal">Kebijakan Refund</Link>
        <Link href="/kebijakan-privasi" className="inline-flex min-h-11 items-center hover:text-sambal">Kebijakan Privasi</Link>
      </nav>
      <p className="mb-2">
        {STORE.name} · {STORE.streetShort}, {STORE.city} · WhatsApp {STORE.phoneDisplay}
      </p>
      <p>© {new Date().getFullYear()} Cece Lina Chang</p>
    </footer>
  );
}
