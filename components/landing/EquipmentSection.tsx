import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

interface EquipmentSectionProps {
  title: string;
  answer: string;
  body: string;
  product?: { id: string; name: string; price: string; imageUrl: string };
}

function firstImage(imageUrl: string): string {
  // Product imageUrl is either a plain URL or a JSON-encoded array of URLs.
  try {
    const urls = JSON.parse(imageUrl);
    if (Array.isArray(urls) && typeof urls[0] === 'string') return urls[0];
  } catch {}
  return imageUrl;
}

export function EquipmentSection({ title, answer, body, product }: EquipmentSectionProps) {
  const image = product ? firstImage(product.imageUrl) : '';

  return (
    <section className="bg-white px-4 py-14 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-2 font-display text-fluid-h2 font-extrabold leading-tight tracking-[-0.015em]">{title}</h2>
        <p className="mb-4 font-display text-3xl font-extrabold text-seledri">{answer}</p>
        <p className="text-lg leading-relaxed text-kecap/80">{body}</p>

        {product && (
          <Link
            href={`/toko/${product.id}`}
            target="_blank"
            rel="noopener"
            className="mt-8 flex items-center gap-4 rounded-2xl border border-steel-line bg-enamel p-3 pr-4 transition-colors hover:border-steel"
          >
            {image && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white">
                <Image
                  src={image}
                  alt={product.name}
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm text-steel">Rekomendasi Cece, opsional</p>
              <p className="font-bold leading-snug">{product.name}</p>
              <p className="text-sm font-semibold text-kecap/80">{product.price}</p>
            </div>
            <ExternalLink className="h-5 w-5 shrink-0 text-steel" aria-label="Buka di toko" />
          </Link>
        )}
      </div>
    </section>
  );
}
