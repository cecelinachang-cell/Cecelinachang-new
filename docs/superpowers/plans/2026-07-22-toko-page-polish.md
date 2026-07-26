# /toko Page Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the `/toko` product listing page for conversion (card ratings, discount pricing, quick WhatsApp buy button), copy, and mobile usability (1-column grid).

**Architecture:** Extract the product card markup from `app/toko/page.tsx` into a new `components/ProductCard.tsx`, add optional `rating`/`reviews`/`originalPrice` fields to its `Product` type, add a second CTA (direct WhatsApp buy link) alongside the existing detail-page link, switch the page's grid to 1-column below `sm`, and tighten hero/promo copy.

**Tech Stack:** Next.js App Router, React (client components), Tailwind CSS, `motion/react` (Framer Motion), `lucide-react` icons. No test runner is configured in this repo (`package.json` has no `test` script) — verification is `npm run lint` plus manual checks against the local dev server (`npm run dev`).

## Global Constraints

- WhatsApp number for all buy links: `6281284250718` (from `components/ProductDetail.tsx`), message format: `Halo Admin, saya mau beli {product name}` (URL-encoded).
- Color tokens: `rust-ink`, `terracotta`, `butter`, `charcoal-brown` (custom Tailwind theme colors already used throughout `app/toko/page.tsx` and `components/ProductDetail.tsx`) — do not introduce new colors.
- Card shell shape stays: `rounded-[1.25rem_0.5rem_1.25rem_0.5rem]`, `border-butter/30`, `shadow-sm hover:shadow-md`.
- Grid breakpoints: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` (1-col mobile is the change from today's `grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
- `rating`/`reviews`/`originalPrice` are optional fields — Supabase `items` rows always have `rating`/`reviews` (schema defaults `5.0`/`0`, see `supabase_schema.sql`) but never `originalPrice` (no such column); fallback data (`app/data/products.ts`) has all three. UI must render correctly whether or not `originalPrice`/`rating` are present.
- Scope is `app/toko/page.tsx` and the new `components/ProductCard.tsx` only. Do not touch `app/toko/[slug]/page.tsx`, `components/ProductDetail.tsx`, `components/Faq.tsx`, or Supabase fetch logic.

---

### Task 1: Create `ProductCard` component

**Files:**
- Create: `components/ProductCard.tsx`

**Interfaces:**
- Produces: `export interface Product { id: string; name: string; price: string; originalPrice?: string; imageUrl: string; category?: string; description?: string; rating?: number; reviews?: number; createdAt?: string; }` and `export default function ProductCard({ product }: { product: Product })` — a React component rendering one product card. Task 2 imports both.

- [ ] **Step 1: Write the component**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Star, ShoppingBag } from "lucide-react";

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
  const waHref = `https://wa.me/6281284250718?text=${encodeURIComponent(
    `Halo Admin, saya mau beli ${product.name}`
  )}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-[1.25rem_0.5rem_1.25rem_0.5rem] shadow-sm border border-butter/30 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
    >
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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </Link>
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <Link href={`/toko/${product.id}`}>
          <h3 className="font-serif text-lg sm:text-xl font-bold text-charcoal-brown mb-1 group-hover:text-terracotta transition-colors line-clamp-2">
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
          <div className="flex items-center gap-2 mb-4">
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
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-green-500 text-white text-sm sm:text-base font-bold rounded-xl hover:bg-green-600 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" /> Beli via WA
            </a>
            <Link
              href={`/toko/${product.id}`}
              className="block w-full text-center py-2 sm:py-2.5 px-4 bg-butter/20 text-rust-ink text-sm font-medium rounded-xl hover:bg-butter/35 transition-colors"
            >
              Lihat Detail
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck / lint**

Run: `npx eslint components/ProductCard.tsx`
Expected: no errors (the file is unused so far — that's fine, it's not imported anywhere yet in this task).

- [ ] **Step 3: Commit**

```bash
git add components/ProductCard.tsx
git commit -m "feat(toko): add ProductCard component with rating, discount price, WA quick-buy"
```

---

### Task 2: Wire `ProductCard` into `app/toko/page.tsx`, switch grid to 1-column mobile

**Files:**
- Modify: `app/toko/page.tsx`

**Interfaces:**
- Consumes: `Product` type and `ProductCard` default export from `components/ProductCard.tsx` (Task 1).

- [ ] **Step 1: Update imports and the local `Product` interface**

In `app/toko/page.tsx`, replace the top of the file (lines 1–32) with:

```tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { products as fallbackProducts } from "@/app/data/products";
import { motion, AnimatePresence } from "motion/react";

import { ShoppingBag } from "lucide-react";
import Faq from "@/components/Faq";
import ProductCard, { type Product } from "@/components/ProductCard";
```

This drops the now-unused `Image`, `Link`, the local `Product` interface, and the local `parseImageUrls` helper (all now live in `components/ProductCard.tsx`), and drops the `motion` import usage change — `motion`/`AnimatePresence` stay since the promo banner and grid-item wrapper still use them indirectly via `AnimatePresence` (see Step 3).

- [ ] **Step 2: Update the two grid `className`s to 1-column mobile**

Find (product grid, currently around line 141):

```tsx
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          <AnimatePresence mode="popLayout">
```

Replace with:

```tsx
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          <AnimatePresence mode="popLayout">
```

(The loading-skeleton grid's classes are handled in Task 3.)

- [ ] **Step 3: Replace the inline card markup with `ProductCard`**

Find the whole `{filteredProducts.map(...)}` block (from `{filteredProducts.map((product, index) => (` through its closing `))}`, currently lines 143–186) and replace with:

```tsx
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
```

- [ ] **Step 4: Run dev server and verify manually**

Run: `npm run dev`

In a browser, visit `http://localhost:3000/toko` and confirm:
- Cards render one per row below `640px` width, 2/3/4 per row at wider breakpoints.
- Each card shows a rating row when the underlying data has `rating` (fallback data always does).
- Each card shows two stacked buttons: green "Beli via WA" and outline "Lihat Detail".
- Clicking "Beli via WA" opens `https://wa.me/6281284250718?text=Halo%20Admin%2C%20saya%20mau%20beli%20<product name>` in a new tab (inspect the link's `href` via browser dev tools if you don't want to actually open WhatsApp).
- Clicking the image, name, or "Lihat Detail" navigates to `/toko/<id>`.
- Category filter still works (switching categories still filters the grid).

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors in `app/toko/page.tsx` or `components/ProductCard.tsx` (no unused-import warnings).

- [ ] **Step 6: Commit**

```bash
git add app/toko/page.tsx
git commit -m "refactor(toko): use ProductCard in listing grid, switch to 1-col mobile grid"
```

---

### Task 3: Update loading skeleton to match the new card shape

**Files:**
- Modify: `app/toko/page.tsx`

- [ ] **Step 1: Replace the skeleton grid**

Find (currently around line 125):

```tsx
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-pulse flex flex-col"
            >
              <div className="w-full aspect-square sm:h-64 bg-stone-200"></div>
              <div className="p-4 sm:p-6 flex flex-col flex-grow space-y-3 sm:space-y-4">
                <div className="h-4 sm:h-6 bg-stone-200 rounded w-3/4"></div>
                <div className="h-4 sm:h-6 bg-stone-200 rounded w-1/2"></div>
                <div className="h-10 sm:h-12 bg-stone-200 rounded-xl w-full mt-auto"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
```

Replace with:

```tsx
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-pulse flex flex-col"
            >
              <div className="w-full aspect-square sm:h-64 bg-stone-200"></div>
              <div className="p-4 sm:p-6 flex flex-col flex-grow space-y-3">
                <div className="h-6 bg-stone-200 rounded w-3/4"></div>
                <div className="h-4 bg-stone-200 rounded w-1/3"></div>
                <div className="h-6 bg-stone-200 rounded w-1/2 mt-auto"></div>
                <div className="h-10 bg-stone-200 rounded-xl w-full"></div>
                <div className="h-10 bg-stone-200 rounded-xl w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
```

(Added a rating-row placeholder bar and a second button placeholder to match the two CTAs now on each real card.)

- [ ] **Step 2: Verify manually**

Run `npm run dev` if not already running. Throttle network in browser dev tools (e.g. Chrome DevTools → Network → Slow 3G) and reload `http://localhost:3000/toko`, or temporarily add `await new Promise(r => setTimeout(r, 2000))` before `setLoading(false)` in `fetchItems` to force the loading state visible, confirm the skeleton grid is 1-column on mobile widths and shows 2 button-shaped placeholders per card, then remove the temporary delay.

- [ ] **Step 3: Commit**

```bash
git add app/toko/page.tsx
git commit -m "style(toko): update loading skeleton to match 1-col grid and dual-CTA card"
```

---

### Task 4: Copy pass — hero, subheading, promo banner, empty state

**Files:**
- Modify: `app/toko/page.tsx`

- [ ] **Step 1: Update the hero heading and subheading**

Find (currently around line 96):

```tsx
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-4">
          Toko Alat Masak Signora
        </h1>
        <p className="text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
          Peralatan baking pilihan dari Signora yang saya gunakan sendiri di
          setiap video. Kualitas terjamin untuk hasil baking yang maksimal dan
          anti gagal.
        </p>
```

Replace with:

```tsx
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-4">
          Toko Alat Baking Signora
        </h1>
        <p className="text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
          Alat yang saya pakai sendiri di setiap video, biar hasil baking Anda
          anti gagal juga.
        </p>
```

- [ ] **Step 2: Tighten the promo banner body copy**

Find (currently around line 220):

```tsx
            <p className="text-butter/90 text-lg mb-8">
              Jangan bingung memilih. Chat admin kami via WhatsApp untuk
              konsultasi alat baking yang paling cocok untuk kebutuhan Anda.
            </p>
```

Replace with:

```tsx
            <p className="text-butter/90 text-lg mb-8">
              Jangan bingung memilih. Chat admin kami via WhatsApp — respon
              cepat, gratis konsultasi alat baking yang cocok untuk kebutuhan
              Anda.
            </p>
```

- [ ] **Step 3: Tighten the empty-state copy**

Find (currently around line 194):

```tsx
          <h2 className="text-2xl font-bold text-charcoal-brown mb-2">
            Belum Ada Produk
          </h2>
          <p className="text-charcoal-brown/60 max-w-md mx-auto">
            {selectedCategory === "Semua"
              ? "Produk sedang dalam proses pembaruan. Silakan kembali lagi nanti."
              : `Belum ada produk untuk kategori "${selectedCategory}".`}
          </p>
```

Replace with:

```tsx
          <h2 className="text-2xl font-bold text-charcoal-brown mb-2">
            Belum Ada Produk
          </h2>
          <p className="text-charcoal-brown/60 max-w-md mx-auto">
            {selectedCategory === "Semua"
              ? "Produk sedang diperbarui. Kembali lagi sebentar lagi, ya."
              : `Belum ada produk di kategori "${selectedCategory}".`}
          </p>
```

- [ ] **Step 4: Verify manually**

Run `npm run dev` if not already running. Visit `http://localhost:3000/toko` and confirm the new hero heading/subheading and promo banner copy render correctly. Switch to a category with no products (or temporarily filter to a nonexistent category in dev tools) to confirm the empty-state copy.

- [ ] **Step 5: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app/toko/page.tsx
git commit -m "copy(toko): sharpen hero, promo banner, and empty-state copy"
```
