"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { waLink, shopeeLink } from "@/lib/links";
import { trackConversion } from "@/lib/analytics";
import { parseIdr } from "@/lib/pixels";

export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  imageUrl: string;
  category?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  createdAt?: string;
  shopeeUrl?: string | null;
}

const parseImageUrls = (url: string | undefined): string[] => {
  if (!url) return [];
  try {
    const urls = JSON.parse(url);
    if (Array.isArray(urls)) return urls;
  } catch (e) {
    //
  }
  return [url];
};

export default function ProductCard({ product }: { product: Product }) {
  const waHref = waLink(`Halo Admin, saya mau beli ${product.name}`);
  const shopeeHref = shopeeLink(product.shopeeUrl);
  const pixelExtra = {
    contentId: product.id,
    contentName: product.name,
    contentType: "product" as const,
    value: parseIdr(product.price),
  };

  return (
    <div className="animate-in fade-in duration-300 bg-white rounded-[1.25rem_0.5rem_1.25rem_0.5rem] shadow-sm border border-butter/30 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <Link
        href={`/toko/${product.id}`}
        className="block relative aspect-square sm:h-64 bg-stone-50 overflow-hidden"
      >
        <Image
          src={
            parseImageUrls(product.imageUrl)[0] ||
            "https://picsum.photos/seed/placeholder/400/400"
          }
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </Link>
      <div className="p-3 sm:p-6 flex flex-col flex-grow">
        <Link href={`/toko/${product.id}`}>
          <h3 className="font-serif text-base sm:text-xl font-bold text-charcoal-brown mb-1 group-hover:text-terracotta transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {typeof product.rating === "number" && (
          <div className="flex items-center text-sm text-stone-600 mb-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
            <span className="font-bold text-stone-800 mr-1">{product.rating}</span>
            <span>({product.reviews ?? 0} Ulasan)</span>
          </div>
        )}

        <div className="mt-auto">
          <div className="flex items-center gap-2 mb-3 sm:mb-4">
            <span className="text-terracotta font-bold text-base sm:text-lg">
              {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-stone-400 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversion("whatsapp_open", undefined, pixelExtra)}
                className="tap-target flex items-center justify-center gap-1.5 w-full px-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" /> <span className="truncate">WA</span>
              </a>
              <a
                href={shopeeHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackConversion("shopee_open", undefined, pixelExtra)}
                className="tap-target flex items-center justify-center gap-1.5 w-full px-2 bg-[#EE4D2D] text-white text-sm font-bold rounded-xl hover:bg-[#d8431f] transition-colors"
              >
                <ShoppingBag className="w-4 h-4 shrink-0" /> <span className="truncate">Shopee</span>
              </a>
            </div>
            <Link
              href={`/toko/${product.id}`}
              className="hidden sm:flex tap-target items-center justify-center w-full text-center px-4 bg-butter/20 text-rust-ink text-sm font-medium rounded-xl hover:bg-butter/35 transition-colors"
            >
              Lihat Detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
