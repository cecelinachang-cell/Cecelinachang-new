'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Star, ShoppingBag, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { motion } from 'motion/react';
import { notFound } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import { POLICIES } from '@/lib/policies';

interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  category: string;
  rating: number;
  reviews: number;
  imageUrl: string;
  isBundle?: boolean;
  description?: string;
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

import DOMPurify from 'dompurify';

export default function ProductDetail({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sanitizedDescription, setSanitizedDescription] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!isSupabaseConfigured()) {
          const { products: fallbackProducts } = await import("@/app/data/products");
          const found = fallbackProducts.find((p: any) => p.id === slug);
          if (found) {
            setProduct(found as unknown as Product);
            if (found.description) {
              setSanitizedDescription(DOMPurify.sanitize(found.description));
            }
            const parsedImages = parseImageUrls(found.imageUrl);
            if (parsedImages.length > 0) {
              setSelectedImage(parsedImages[0]);
            }
          } else {
            setError(true);
          }
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.from('items').select('*').eq('id', slug).single();
        if (error) {
           const errMsg = error?.message || (error as any)?.toString() || '';
           if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
             console.error("Error fetching product detail:", errMsg);
           }
           // Try to recover with fallback
           const { products: fallbackProducts } = await import("@/app/data/products");
           const found = fallbackProducts.find((p: any) => p.id === slug);
           if (found) {
             setProduct(found as unknown as Product);
             if (found.description) {
               setSanitizedDescription(DOMPurify.sanitize(found.description));
             }
             const parsedImages = parseImageUrls(found.imageUrl);
             if (parsedImages.length > 0) {
               setSelectedImage(parsedImages[0]);
             }
           } else {
             setError(true);
           }
        } else if (data) {
           setProduct(data as Product);
           if (data.description) {
             setSanitizedDescription(DOMPurify.sanitize(data.description));
           }
           const parsedImages = parseImageUrls(data.imageUrl);
           if (parsedImages.length > 0) {
             setSelectedImage(parsedImages[0]);
           }
        }
      } catch (err: any) {
        const errMsg = err?.message || err?.toString() || '';
        if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
          console.error("Unexpected error fetching product detail:", err);
        }
        // Try fallback on catch
        try {
          const { products: fallbackProducts } = await import("@/app/data/products");
          const found = fallbackProducts.find((p: any) => p.id === slug);
          if (found) {
            setProduct(found as unknown as Product);
            if (found.description) {
              setSanitizedDescription(DOMPurify.sanitize(found.description));
            }
            const parsedImages = parseImageUrls(found.imageUrl);
            if (parsedImages.length > 0) {
              setSelectedImage(parsedImages[0]);
            }
          } else {
            setError(true);
          }
        } catch (_) {
          setError(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="w-32 h-6 bg-stone-200 rounded mb-8"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <div className="h-96 sm:h-[500px] bg-stone-200 rounded-3xl"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 sm:h-32 bg-stone-200 rounded-xl"></div>
              ))}
            </div>
          </div>
          <div className="flex flex-col space-y-6">
            <div className="h-12 bg-stone-200 rounded w-3/4"></div>
            <div className="flex gap-4">
              <div className="h-6 bg-stone-200 rounded w-24"></div>
              <div className="h-6 bg-stone-200 rounded w-24"></div>
            </div>
            <div className="h-10 bg-stone-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-stone-200 rounded w-full"></div>
              <div className="h-4 bg-stone-200 rounded w-full"></div>
              <div className="h-4 bg-stone-200 rounded w-5/6"></div>
            </div>
            <div className="h-16 bg-stone-200 rounded-2xl w-full mt-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    notFound();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <Link href="/toko" className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium mb-8 hover:translate-x-[-4px] transition-transform">
        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Toko
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="relative aspect-square sm:aspect-auto sm:h-[500px] rounded-3xl overflow-hidden shadow-lg border border-orange-100 bg-white flex items-center justify-center group">
            <Image
              src={selectedImage || 'https://picsum.photos/seed/placeholder/800/800'}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-8 group-hover:scale-110 transition-transform duration-500"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold text-orange-800 shadow-sm flex items-center">
              <Star className="w-4 h-4 text-yellow-500 fill-current mr-2" />
              Dipakai di video saya
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {parseImageUrls(product.imageUrl).map((imgObj, i) => (
              <div
                key={i}
                onClick={() => setSelectedImage(imgObj)}
                className={`relative h-20 sm:h-32 rounded-xl overflow-hidden cursor-pointer border-2 transition-colors bg-white flex items-center justify-center ${selectedImage === imgObj ? 'border-orange-500' : 'border-transparent hover:border-orange-300'}`}
              >
                <Image
                  src={imgObj}
                  alt={`Thumbnail ${i}`}
                  fill
                  className="object-contain p-2"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col"
        >
          <div className="mb-6">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-orange-900 mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-stone-600 mb-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-bold text-stone-800 ml-1.5">{product.rating}</span>
                <span className="ml-1">({product.reviews} Ulasan)</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-stone-300"></div>
              <div className="text-green-600 font-medium">Stok Tersedia</div>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="font-serif text-4xl text-orange-800 font-bold">
                {product.price}
              </div>
              {product.originalPrice && (
                <div className="text-xl text-stone-400 line-through font-medium">
                  {product.originalPrice}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-orange-50 rounded-2xl p-6 sm:p-8 border border-orange-100 mb-8 text-stone-700 space-y-4">
            {sanitizedDescription ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizedDescription }} className="prose prose-orange max-w-none" />
            ) : (
              <p>Deskripsi produk belum tersedia.</p>
            )}
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center p-4 bg-white border border-stone-200 rounded-xl">
              <ShieldCheck className="w-8 h-8 text-orange-600 mr-3" />
              <div className="text-sm font-medium text-stone-700">{POLICIES.PRODUCT_WARRANTY_SHORT}</div>
            </div>
            <div className="flex items-center p-4 bg-white border border-stone-200 rounded-xl">
              <Truck className="w-8 h-8 text-orange-600 mr-3" />
              <div className="text-sm font-medium text-stone-700">Pengiriman Aman</div>
            </div>
          </div>

          {/* Buy Action */}
          <div className="mt-auto">
            <p className="text-sm text-stone-500 mb-4 text-center">
              Pembelian langsung via WhatsApp. Tidak perlu daftar akun.
            </p>
            <p className="text-xs text-stone-500 mb-4 text-center">
              {POLICIES.PRODUCT_RETURN_SHORT}
            </p>
            <a
              href={`https://wa.me/6281284250718?text=Halo%20Admin,%20saya%20mau%20beli%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center px-8 py-5 text-xl font-bold rounded-full text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] active:scale-95"
            >
              <ShoppingBag className="w-6 h-6 mr-3" /> Beli Sekarang via WhatsApp
            </a>
          </div>
        </motion.div>
      </div>

      {/* Testimonials */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="border-t border-orange-100 pt-16"
      >
        <TestimonialCarousel />
      </motion.div>
    </motion.div>
  );
}
