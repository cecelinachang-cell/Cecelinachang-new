import Link from 'next/link';

// The site footer is hidden on /lp/* (see app/lp/layout.tsx); this keeps only
// the legal links.
export function LandingFooter() {
  return (
    <footer className="border-t border-steel-line px-4 py-8 text-center text-sm text-steel">
      <nav className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-1" aria-label="Legal">
        <Link href="/syarat-ketentuan" className="inline-flex min-h-11 items-center hover:text-sambal">Syarat &amp; Ketentuan</Link>
        <Link href="/kebijakan-privasi" className="inline-flex min-h-11 items-center hover:text-sambal">Kebijakan Privasi</Link>
      </nav>
      <p>© {new Date().getFullYear()} Cece Lina Chang</p>
    </footer>
  );
}
