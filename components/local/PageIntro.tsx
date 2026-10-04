import Link from 'next/link';
import { Marginalia } from '@/components/Marginalia';

export default function PageIntro({
  crumbs,
  title,
  note,
  lede,
}: {
  crumbs: { name: string; path: string }[];
  title: string;
  note: string;
  lede: string;
}) {
  return (
    <header className="max-w-3xl mb-8 sm:mb-10">
      <nav aria-label="Breadcrumb" className="text-sm text-charcoal-brown/60 mb-4">
        <ol className="flex flex-wrap gap-x-2 gap-y-1">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {last ? (
                  <span className="text-charcoal-brown">{crumb.name}</span>
                ) : (
                  <Link href={crumb.path} className="hover:text-terracotta">
                    {crumb.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <h1 className="text-fluid-h1 font-serif font-bold text-rust-ink mb-3">{title}</h1>
      <Marginalia rotate={-2} className="block mb-4">
        {note}
      </Marginalia>
      <p className="text-base sm:text-lg text-charcoal-brown/80 leading-relaxed">{lede}</p>
    </header>
  );
}
