# Trust & Credibility Copy Improvements — Design

## Goal

Fix credibility gaps on cecelinachang.com that create purchase hesitation: no refund/return policy stated anywhere, inconsistent student-count claims across pages, the strongest credibility marker (28 years running a bakso factory) buried in one course description instead of surfaced where visitors actually look, and fragmented/non-overlapping FAQ blocks on kontak and kursus pages with none at all on toko.

This is a content/copy change only. A separate agent owns UI/UX redesign — no layout, styling, or component visual changes beyond extracting existing FAQ markup into a shared component (same visual output, no restyling).

## Background

Audit findings (full detail from prior research, summarized):
- Only "guarantee" text sitewide is `components/ProductDetail.tsx`'s "Garansi Original" badge — that means product authenticity, not a return/refund policy or warranty period. No refund/return/cancellation policy exists anywhere in the codebase for products or courses.
- Homepage (`app/page.tsx:161,179`) claims "10.000+ Murid Bergabung" / "Sudah 10.000+ ibu berhasil...". About page (`app/tentang/page.tsx:104`) claims "2000+ Murid Kelas Online". Per-course student counts in `app/data/courses.ts` sum to ~12,280 across all 8 courses. These numbers are inconsistent and unreconciled anywhere on the site.
- The bakso course description (`app/data/courses.ts:7`) states "pengalaman mengelola pabrik bakso sejak 1998" (28 years running a bakso factory) — the single strongest, most specific credibility marker on the entire site — but it appears nowhere else: not on the About page founder story, not on the homepage hero.
- FAQ content is duplicated inline with no overlap: `app/kontak/page.tsx:105-109` has 4 Q&As (buying process, shipping safety, course signup, free recipes). `app/kursus/page.tsx:114-130` has a different 4 Q&As (beginner-friendly, video access, access duration, consultation). `app/toko/page.tsx` has no FAQ block at all. Neither existing FAQ set covers refund/return policy, warranty, or payment methods.

## Resolved decisions (from brainstorming)

- **Refund/return policy (real, not placeholder):** Products — no change-of-mind returns; replacement only for damaged/wrong/defective items, reported with photo proof within 24–48 hours of receipt. Courses — no refund once the WhatsApp access link has been sent (digital good).
- **Warranty:** Signora kitchenware carries a 1-year official distributor warranty ("Garansi resmi distributor 1 tahun").
- **Student count:** "10.000+" is accurate as a combined community/platform figure (students + followers), not specifically course students. Homepage copy will be reworded so it no longer claims "10.000+ Murid" (students) specifically, removing the conflict with About page's narrower, accurate "2.000+ Murid Kelas Online". About page numbers are not changed.
- **Credential surfacing:** the 28-year bakso-industry background is added to both the About page founder story and a short line near the homepage hero.
- **FAQ structure:** one shared data source with categories, rendered as page-specific subsets via one shared component — not duplicated content, not one giant undifferentiated list.
- **Policy placement:** policy text appears both in FAQ answers (for visitors who look) and as short lines directly on product/course detail pages near the CTA (for visitors who don't navigate away).
- **Architecture:** matches existing codebase conventions — `app/data/*.ts` for structured content data (mirrors `app/data/courses.ts`, `app/data/products.ts`), `lib/*.ts` for shared constants (mirrors `lib/supabase.ts`), `components/*.tsx` for shared rendering logic.

## Design

### 1. `lib/policies.ts` (new file)

Exports a `POLICIES` object of plain-string constants, so the exact wording for refund/return/warranty terms lives in exactly one place and is reused verbatim by both the FAQ answers and the detail-page snippets (no drift between the two).

```ts
export const POLICIES = {
  PRODUCT_RETURN: 'Kami tidak menerima pengembalian karena perubahan pikiran. Jika barang yang Anda terima rusak, salah kirim, atau cacat produksi, laporkan ke admin dalam 24–48 jam setelah barang diterima disertai foto/video bukti, dan kami akan proses penggantian.',
  PRODUCT_RETURN_SHORT: 'Penggantian untuk barang rusak/salah kirim (lapor 24–48 jam + bukti foto). Tidak ada pengembalian karena perubahan pikiran.',
  PRODUCT_WARRANTY: 'Garansi resmi distributor 1 tahun untuk seluruh produk Signora.',
  PRODUCT_WARRANTY_SHORT: 'Garansi Resmi 1 Tahun',
  COURSE_REFUND: 'Karena kelas online adalah produk digital, dana tidak dapat dikembalikan setelah link akses video dikirimkan.',
  COURSE_REFUND_SHORT: 'Kelas digital: tidak ada refund setelah link akses dikirim.',
} as const;
```

`*_SHORT` variants exist for the compact detail-page placements (badge/small-text) where the full sentence would not fit the existing layout; the long-form variant is used in FAQ answers.

### 2. `app/data/faq.ts` (new file)

```ts
export type FaqCategory = 'general' | 'shipping' | 'course' | 'refund';

export interface FaqItem {
  q: string;
  a: string;
  category: FaqCategory;
}
```

`faqs: FaqItem[]` consolidates the existing kontak + kursus entries (deduped — both currently have no overlapping questions, so all 8 existing Q&As are kept, recategorized) plus new entries built from `lib/policies.ts`:

- Existing kontak Q&As (`app/kontak/page.tsx:106-109`) → category `general`/`shipping`:
  - "Bagaimana cara membeli alat masak?" → `general`
  - "Apakah pengiriman aman ke luar kota?" → `shipping`
  - "Bagaimana cara ikut kelas online?" → `course`
  - "Apakah resep di website ini gratis?" → `general`
- Existing kursus Q&As (`app/kursus/page.tsx:116-129`) → category `course`:
  - "Apakah kelas ini cocok untuk pemula...?" → `course`
  - "Bagaimana cara mengakses video kelasnya?" → `course`
  - "Apakah ada batas waktu untuk menonton video?" → `course`
  - "Kalau ada yang bingung, apakah bisa bertanya?" → `course`
- New entries:
  - `{ q: 'Apakah bisa mengembalikan produk yang sudah dibeli?', a: POLICIES.PRODUCT_RETURN, category: 'refund' }`
  - `{ q: 'Berapa lama garansi alat masaknya?', a: POLICIES.PRODUCT_WARRANTY, category: 'shipping' }`
  - `{ q: 'Apakah biaya kelas online bisa dikembalikan (refund)?', a: POLICIES.COURSE_REFUND, category: 'refund' }`
  - `{ q: 'Metode pembayaran apa saja yang tersedia?', a: 'Pembayaran dilakukan via transfer bank, dikonfirmasi langsung oleh admin melalui WhatsApp setelah Anda checkout.', category: 'general' }`

### 3. `components/Faq.tsx` (new client component)

```tsx
'use client';
import { faqs, type FaqCategory } from '@/app/data/faq';

export default function Faq({ categories, title }: { categories: FaqCategory[]; title?: string }) {
  const filtered = faqs.filter(f => categories.includes(f.category));
  // renders the same card-grid markup currently in app/kontak/page.tsx:104-116
  // (grid grid-cols-1 md:grid-cols-2 gap-8, bg-white p-8 rounded-2xl shadow-sm border border-orange-100 cards)
  // title defaults to 'Pertanyaan yang Sering Diajukan (FAQ)'
}
```

Visual output matches what's already on the kontak page exactly — this is an extraction, not a redesign.

**Usage:**
- `app/kontak/page.tsx`: replace inline FAQ block (lines 101-117) with `<Faq categories={['general', 'shipping', 'course', 'refund']} />`
- `app/kursus/page.tsx`: replace inline FAQ block (lines 108-141) with `<Faq categories={['course', 'refund']} title="Pertanyaan Sering Diajukan" />`
- `app/toko/page.tsx`: add new `<Faq categories={['shipping', 'refund']} />` block (toko currently has no FAQ section)

### 4. Detail-page policy snippets

**`components/ProductDetail.tsx`** (trust badges area, ~lines 259-269):
- Add a third trust badge alongside the existing "Garansi Original" / "Pengiriman Aman" pair, using `POLICIES.PRODUCT_WARRANTY_SHORT` as its label.
- Add a short text line near the WhatsApp CTA (mirroring the pattern at kursus detail's line 285-287) using `POLICIES.PRODUCT_RETURN_SHORT`.

**`app/kursus/[slug]/page.tsx`** (~lines 285-287, alongside the existing "Pembayaran aman via transfer bank..." line):
- Add `POLICIES.COURSE_REFUND_SHORT` as an additional small text line.

### 5. Student-count consistency

**`app/page.tsx`:**
- Line 161: `"Lebih dari 10.000+ Murid Bergabung"` → `"10.000+ Komunitas Cece Lina Chang"`
- Line 179: `"Sudah 10.000+ ibu berhasil bikin lapis legit, otak otak, dan bakso sendiri di rumah tanpa pernah masak sebelumnya"` → `"Sudah ribuan ibu berhasil bikin lapis legit, otak otak, dan bakso sendiri di rumah tanpa pernah masak sebelumnya"`

**`app/tentang/page.tsx`:** no changes to the existing "2000+ Murid Kelas Online" / "50k+ Pengikut Setia" stats — these remain the specific, defensible numbers; they no longer conflict with homepage copy once the homepage claim is reworded to be a general community figure rather than a specific student count.

### 6. Credential surfacing (28-year bakso-industry background)

**`app/tentang/page.tsx`:** add one sentence to the founder story referencing the 28-year bakso-industry background, in the existing first-person narrative voice, placed in or near the existing paragraph block at lines 70-78 (before the "Misi Saya" heading at line 79) so it reads as part of her personal history rather than an inserted stat.

**`app/page.tsx`:** add a short credibility line near the hero — a second small badge-style text element directly below the existing "10.000+ Komunitas Cece Lina Chang" badge (after line 163, same `inline-flex items-center space-x-2 ... rounded-full` badge pattern, reusing the `Star` icon already imported on this page), reading: `"28 Tahun Pengalaman di Industri Bakso"`.

## Out of Scope

Confirmed deferred to future, separate specs:
- Testimonials data-model overhaul (currently image-only, no name/quote/rating fields, broken fallback reusing course photos)
- Course/product bundle or comparison features
- Email capture / newsletter / lead magnet
- Any UI/UX layout, styling, or visual redesign (owned by a separate concurrent agent)

## Files Touched

**New:**
- `lib/policies.ts`
- `app/data/faq.ts`
- `components/Faq.tsx`

**Modified:**
- `app/kontak/page.tsx` (FAQ block → shared component)
- `app/kursus/page.tsx` (FAQ block → shared component)
- `app/toko/page.tsx` (new FAQ block added)
- `components/ProductDetail.tsx` (warranty badge + return-policy line)
- `app/kursus/[slug]/page.tsx` (refund-policy line)
- `app/page.tsx` (hero copy: student-count rewording, credential line)
- `app/tentang/page.tsx` (founder story: credential sentence)
