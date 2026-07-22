# /toko Page Polish — Design Spec

## Goal

Polish `/toko` (product listing page) and its `ProductCard` for conversion, copy, and mobile usability. Out of scope: `/toko/[slug]` detail page (already has ratings, trust badges, testimonials), checkout flow, admin, other pages.

## Context

- `/toko` (`app/toko/page.tsx`) is a client-rendered grid of baking-tool products (oven, mixer, loyang, etc.) pulled from Supabase `items` table, falling back to `app/data/products.ts`.
- The `Product` interface in `page.tsx` is missing `rating`, `reviews`, `originalPrice` fields that already exist on the underlying data (`app/data/products.ts`) and are already used on `/toko/[slug]` via `components/ProductDetail.tsx`.
- Purchase flow is WhatsApp deep-link (`wa.me/6281284250718?text=...`), no cart/checkout. `ProductDetail.tsx` already has this exact pattern for the per-product buy button.
- Palette/typography conventions: `font-serif` for headings, `rust-ink`/`terracotta`/`butter`/`charcoal-brown` custom Tailwind colors, rounded-corner "sketchy" card shape (`rounded-[1.25rem_0.5rem_1.25rem_0.5rem]`).

## Approach

Extract the product card markup out of `page.tsx` into a new `components/ProductCard.tsx`. Rationale: the card is growing more complex (rating row, dual CTAs, discount price) and pulling it into its own component keeps `page.tsx` focused on data-fetching/filtering, and makes the card reusable later (e.g. a "related products" section on the detail page). Not a bundled architectural rewrite — plain 1:1 extraction plus the changes below.

## Changes

### 1. Data model
Add `rating?: number`, `reviews?: number`, `originalPrice?: string` to the `Product` interface in `app/toko/page.tsx` (and the new `ProductCard.tsx`). All three are optional — Supabase `items` rows or fallback data may omit them; the UI must degrade gracefully (omit the rating row / strikethrough price when absent).

### 2. `ProductCard` component (new: `components/ProductCard.tsx`)
Props: `product: Product`.

Layout:
- Full-width image (link to `/toko/{id}`), same hover-scale treatment as today.
- Product name (link to `/toko/{id}`), `line-clamp-2`.
- Rating row (new): star icon + `{rating}` + `({reviews} Ulasan)`, same visual pattern as `ProductDetail.tsx` lines ~230-238. Rendered only when `rating` is present.
- Price row: `price` in terracotta bold, plus `originalPrice` (if present) shown strikethrough next to it in muted stone, matching `ProductDetail.tsx`'s price treatment.
- Two actions, stacked or side-by-side depending on width:
  - **"Beli via WA"** — primary, green (WhatsApp-brand), links directly to `https://wa.me/6281284250718?text=Halo%20Admin,%20saya%20mau%20beli%20{encoded product.name}` (same URL pattern as `ProductDetail.tsx`), opens in new tab.
  - **"Lihat Detail"** — secondary, outline/muted style (today's butter-tinted button), links to `/toko/{id}`.

Card shell (shadow, border, rounded corners) stays as-is.

### 3. Responsive grid
`app/toko/page.tsx` grid classes change from `grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` to `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`. Below `sm`, cards are full-width — drop the mobile font/padding shrinking (`text-xs sm:text-base` etc.) in favor of the same sizing used at `sm`+, since cramped-mobile is no longer a constraint.

Loading skeleton grid (currently hardcoded `grid-cols-2 sm:grid-cols-2 ...`) gets the same `grid-cols-1` change, and its placeholder block heights adjust to the new full-width card proportions (no longer needs the sm/mobile-specific split it has today).

### 4. Copy changes (`app/toko/page.tsx`)
- H1: `"Toko Alat Masak Signora"` → `"Toko Alat Baking Signora"` (products are baking-specific; "Alat Masak" over-generalizes).
- Subheading: → `"Alat yang saya pakai sendiri di setiap video, biar hasil baking Anda anti gagal juga."`
- Promo banner heading stays (`"Butuh Rekomendasi Alat?"`); body copy tightens to include a concrete reassurance line, e.g. `"Jangan bingung memilih. Chat admin kami via WhatsApp — respon cepat, gratis konsultasi alat baking yang cocok untuk kebutuhan Anda."`
- Empty-state copy: keep current structure/tone, minor tightening pass for concision (no structural change).

### 5. Not changed
- Category filter behavior/logic, `Faq` section, promo banner image/structure, Supabase fetch logic, `/toko/[slug]` page.

## Testing
- Manual check in browser at mobile (`375px`), tablet (`768px`), and desktop (`1280px`) widths: 1-col → 2-col → 3-col → 4-col grid transitions correctly, cards aren't cramped, both CTAs are tappable without overlap.
- Verify rating row and strikethrough price render correctly when present and are cleanly omitted when absent (test against both a fallback product, which always has rating/reviews, and a manually-trimmed mock item without them).
- Verify WA quick-buy link on card produces the same `wa.me` URL format/phone number as the existing detail-page buy button, with correct product-name encoding.
- Existing category filter + empty-state + FAQ sections still render correctly after the extraction (no regression from moving card markup into `ProductCard.tsx`).
