# Trust & Credibility Copy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix credibility gaps on cecelinachang.com that create purchase hesitation: no refund/return/warranty policy stated anywhere, inconsistent student-count claims across pages, the strongest credibility marker (28 years running a bakso factory) buried in one course description instead of surfaced on About/homepage, and fragmented FAQ blocks duplicated across kontak/kursus with none on toko.

**Architecture:** Central `lib/policies.ts` constants (single source of truth for policy wording) feed both a new `app/data/faq.ts` FAQ dataset and short inline snippets on product/course detail pages. A new `components/Faq.tsx` client component renders category-filtered FAQ subsets, replacing the duplicated inline FAQ blocks in `app/kontak/page.tsx` and `app/kursus/page.tsx`, and adding a new FAQ section to `app/toko/page.tsx`. Separately, homepage and About page copy is edited directly for student-count consistency and credential surfacing.

**Tech Stack:** Next.js 15.4 App Router, React 19, TypeScript, Tailwind CSS 4. No test framework installed (no jest/vitest/playwright) — every task verifies via `npm run build` (must exit 0) plus manual `curl`/`grep` checks against `npm run dev` or `npm run start`.

## Global Constraints

- Indonesian-language copy throughout — match the existing tone (warm, first-person from "Cece Lina Chang", direct address to "Anda").
- Content/copy changes only. Do not change layout, component visual structure, colors, spacing patterns, or add new design elements beyond what's specified in each task — a separate agent owns UI/UX redesign concurrently on this codebase.
- The shared `Faq` component's visual output is the existing kontak-page FAQ grid style (`grid grid-cols-1 md:grid-cols-2 gap-8`, `bg-white p-8 rounded-2xl shadow-sm border border-orange-100` cards) — this becomes the canonical FAQ style sitewide. The kursus page's FAQ block will visually change from its current single-column stacked list to this 2-column grid as a direct, intended consequence of consolidating into one shared component — this is not a redesign to avoid, it's the specified outcome.
- Policy wording (refund/return/warranty text) must come from `lib/policies.ts` constants — never hardcode the policy sentences a second time in any consuming file.
- Every new/modified file must preserve the existing code style already present in that file (quote style, `'use client'` placement, existing import ordering conventions).

---

### Task 1: Create `lib/policies.ts`

**Files:**
- Create: `lib/policies.ts`

**Interfaces:**
- Produces: `POLICIES` const object with keys `PRODUCT_RETURN`, `PRODUCT_RETURN_SHORT`, `PRODUCT_WARRANTY`, `PRODUCT_WARRANTY_SHORT`, `COURSE_REFUND`, `COURSE_REFUND_SHORT` (all `string`). Consumed by Task 2 (`app/data/faq.ts`) and Task 5 (`components/ProductDetail.tsx`, `app/kursus/[slug]/page.tsx`).

- [ ] **Step 1: Write the file**

```ts
export const POLICIES = {
  PRODUCT_RETURN:
    'Kami tidak menerima pengembalian karena perubahan pikiran. Jika barang yang Anda terima rusak, salah kirim, atau cacat produksi, laporkan ke admin dalam 24–48 jam setelah barang diterima disertai foto/video bukti, dan kami akan proses penggantian.',
  PRODUCT_RETURN_SHORT:
    'Penggantian untuk barang rusak/salah kirim (lapor 24–48 jam + bukti foto). Tidak ada pengembalian karena perubahan pikiran.',
  PRODUCT_WARRANTY:
    'Garansi resmi distributor 1 tahun untuk seluruh produk Signora.',
  PRODUCT_WARRANTY_SHORT: 'Garansi Resmi 1 Tahun',
  COURSE_REFUND:
    'Karena kelas online adalah produk digital, dana tidak dapat dikembalikan setelah link akses video dikirimkan.',
  COURSE_REFUND_SHORT:
    'Kelas digital: tidak ada refund setelah link akses dikirim.',
} as const;
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: exit 0, no TypeScript errors (this file has no consumers yet, so the build succeeding just confirms valid syntax).

- [ ] **Step 3: Commit**

```bash
git add lib/policies.ts
git commit -m "feat: add centralized policy copy constants"
```

---

### Task 2: Create `app/data/faq.ts`

**Files:**
- Create: `app/data/faq.ts`

**Interfaces:**
- Consumes: `POLICIES` from `lib/policies.ts` (Task 1) — import as `import { POLICIES } from '@/lib/policies';`
- Produces: `FaqCategory` type (`'general' | 'shipping' | 'course' | 'refund'`), `FaqItem` interface (`{ q: string; a: string; category: FaqCategory }`), `faqs: FaqItem[]` array of 12 items. Consumed by Task 3 (`components/Faq.tsx`).

- [ ] **Step 1: Write the file**

```ts
import { POLICIES } from '@/lib/policies';

export type FaqCategory = 'general' | 'shipping' | 'course' | 'refund';

export interface FaqItem {
  q: string;
  a: string;
  category: FaqCategory;
}

export const faqs: FaqItem[] = [
  {
    q: 'Bagaimana cara membeli alat masak?',
    a: 'Sangat mudah! Anda tinggal klik tombol "Beli Sekarang" di halaman produk, lalu Anda akan langsung diarahkan ke WhatsApp admin kami untuk proses pemesanan tanpa perlu membuat akun.',
    category: 'general',
  },
  {
    q: 'Apakah pengiriman aman ke luar kota?',
    a: 'Tentu saja. Kami menggunakan bubble wrap tebal dan kardus khusus untuk memastikan loyang dan alat masak lainnya sampai dengan aman tanpa penyok.',
    category: 'shipping',
  },
  {
    q: 'Bagaimana cara ikut kelas online?',
    a: 'Pilih kelas yang Anda inginkan di halaman Kursus, klik "Daftar", dan admin kami akan membantu proses pendaftaran via WhatsApp. Setelah itu Anda akan mendapat link akses video.',
    category: 'course',
  },
  {
    q: 'Apakah resep di website ini gratis?',
    a: 'Ya, semua resep yang ada di halaman Resep bisa Anda akses secara gratis kapan saja.',
    category: 'general',
  },
  {
    q: 'Apakah kelas ini cocok untuk pemula yang belum pernah baking?',
    a: 'Sangat cocok! Semua materi dijelaskan dari nol, mulai dari pengenalan alat dan bahan hingga teknik dasar.',
    category: 'course',
  },
  {
    q: 'Bagaimana cara mengakses video kelasnya?',
    a: 'Setelah pembayaran, Anda akan diberikan link khusus dan password untuk menonton video kapan saja melalui HP atau laptop.',
    category: 'course',
  },
  {
    q: 'Apakah ada batas waktu untuk menonton video?',
    a: 'Tidak ada. Akses video berlaku seumur hidup. Anda bisa menonton ulang berkali-kali.',
    category: 'course',
  },
  {
    q: 'Kalau ada yang bingung, apakah bisa bertanya?',
    a: 'Tentu saja! Anda akan mendapatkan akses konsultasi langsung dengan cece lina chang untuk tanya jawab.',
    category: 'course',
  },
  {
    q: 'Apakah bisa mengembalikan produk yang sudah dibeli?',
    a: POLICIES.PRODUCT_RETURN,
    category: 'refund',
  },
  {
    q: 'Berapa lama garansi alat masaknya?',
    a: POLICIES.PRODUCT_WARRANTY,
    category: 'shipping',
  },
  {
    q: 'Apakah biaya kelas online bisa dikembalikan (refund)?',
    a: POLICIES.COURSE_REFUND,
    category: 'refund',
  },
  {
    q: 'Metode pembayaran apa saja yang tersedia?',
    a: 'Pembayaran dilakukan via transfer bank, dikonfirmasi langsung oleh admin melalui WhatsApp setelah Anda checkout.',
    category: 'general',
  },
];
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: exit 0, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add app/data/faq.ts
git commit -m "feat: add consolidated FAQ dataset"
```

---

### Task 3: Create `components/Faq.tsx`

**Files:**
- Create: `components/Faq.tsx`

**Interfaces:**
- Consumes: `faqs`, `FaqCategory` from `app/data/faq.ts` (Task 2) — import as `import { faqs, type FaqCategory } from '@/app/data/faq';`
- Produces: default export `Faq({ categories, title }: { categories: FaqCategory[]; title?: string })` React component. Consumed by Task 4 (`app/kontak/page.tsx`, `app/kursus/page.tsx`, `app/toko/page.tsx`).

- [ ] **Step 1: Write the file**

```tsx
'use client';

import { faqs, type FaqCategory } from '@/app/data/faq';

export default function Faq({
  categories,
  title = 'Pertanyaan yang Sering Diajukan (FAQ)',
}: {
  categories: FaqCategory[];
  title?: string;
}) {
  const filtered = faqs.filter((f) => categories.includes(f.category));

  return (
    <div className="mt-24 max-w-4xl mx-auto">
      <h2 className="font-serif text-3xl font-bold text-orange-900 mb-12 text-center">
        {title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((faq, i) => (
          <div
            key={i}
            className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100"
          >
            <h3 className="font-bold text-lg text-stone-800 mb-3">{faq.q}</h3>
            <p className="text-stone-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `npm run build`
Expected: exit 0, no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/Faq.tsx
git commit -m "feat: add shared Faq component"
```

---

### Task 4: Wire `Faq` component into kontak, kursus, and toko pages

**Files:**
- Modify: `app/kontak/page.tsx`
- Modify: `app/kursus/page.tsx`
- Modify: `app/toko/page.tsx`

**Interfaces:**
- Consumes: `Faq` default export from `components/Faq.tsx` (Task 3).

- [ ] **Step 1: Replace the inline FAQ block in `app/kontak/page.tsx`**

Add the import at the top of the file (after the existing `lucide-react` import on line 1):

```tsx
import Faq from '@/components/Faq';
```

Replace the entire FAQ block (currently lines 101-117 — from the `{/* FAQ */}` comment through its closing `</div>`):

```tsx
      {/* FAQ */}
      <div className="mt-24 max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-orange-900 mb-12 text-center">Pertanyaan yang Sering Diajukan (FAQ)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { q: 'Bagaimana cara membeli alat masak?', a: 'Sangat mudah! Anda tinggal klik tombol "Beli Sekarang" di halaman produk, lalu Anda akan langsung diarahkan ke WhatsApp admin kami untuk proses pemesanan tanpa perlu membuat akun.' },
            { q: 'Apakah pengiriman aman ke luar kota?', a: 'Tentu saja. Kami menggunakan bubble wrap tebal dan kardus khusus untuk memastikan loyang dan alat masak lainnya sampai dengan aman tanpa penyok.' },
            { q: 'Bagaimana cara ikut kelas online?', a: 'Pilih kelas yang Anda inginkan di halaman Kursus, klik "Daftar", dan admin kami akan membantu proses pendaftaran via WhatsApp. Setelah itu Anda akan mendapat link akses video.' },
            { q: 'Apakah resep di website ini gratis?', a: 'Ya, semua resep yang ada di halaman Resep bisa Anda akses secara gratis kapan saja.' }
          ].map((faq, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100">
              <h3 className="font-bold text-lg text-stone-800 mb-3">{faq.q}</h3>
              <p className="text-stone-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
```

with:

```tsx
      <Faq categories={['general', 'shipping', 'course', 'refund']} />
```

- [ ] **Step 2: Replace the inline FAQ block in `app/kursus/page.tsx`**

Add the import at the top of the file (after the existing `CourseCard` import on line 3):

```tsx
import Faq from "@/components/Faq";
```

Replace the entire FAQ block (currently lines 108-141 — from the `{/* FAQ Singkat */}` comment through its closing `</div>`):

```tsx
      {/* FAQ Singkat */}
      <div className="mt-24 max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-orange-900 mb-8 text-center">
          Pertanyaan Sering Diajukan
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Apakah kelas ini cocok untuk pemula yang belum pernah baking?",
              a: "Sangat cocok! Semua materi dijelaskan dari nol, mulai dari pengenalan alat dan bahan hingga teknik dasar.",
            },
            {
              q: "Bagaimana cara mengakses video kelasnya?",
              a: "Setelah pembayaran, Anda akan diberikan link khusus dan password untuk menonton video kapan saja melalui HP atau laptop.",
            },
            {
              q: "Apakah ada batas waktu untuk menonton video?",
              a: "Tidak ada. Akses video berlaku seumur hidup. Anda bisa menonton ulang berkali-kali.",
            },
            {
              q: "Kalau ada yang bingung, apakah bisa bertanya?",
              a: "Tentu saja! Anda akan mendapatkan akses konsultasi langsung dengan cece lina chang untuk tanya jawab.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100"
            >
              <h3 className="font-bold text-lg text-stone-800 mb-2">{faq.q}</h3>
              <p className="text-stone-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
```

with:

```tsx
      <Faq categories={["course", "refund"]} title="Pertanyaan Sering Diajukan" />
```

- [ ] **Step 3: Add a new FAQ block to `app/toko/page.tsx`**

Add the import at the top of the file (after the existing `lucide-react` import on line 10):

```tsx
import Faq from "@/components/Faq";
```

Insert a new block immediately after the closing `</div>` of the "Banner Promo" section (currently ending at line 242, right before the component's final closing `</div>` on line 243):

```tsx
      <Faq categories={["shipping", "refund"]} />
```

- [ ] **Step 4: Build and verify all three pages render their FAQ**

Run: `npm run build && npm run start -- -p 3998 &`
Run: `sleep 3 && curl -s http://localhost:3998/kontak | grep -c "Apakah bisa mengembalikan produk"`
Expected: `1` (kontak shows the new refund FAQ entry)

Run: `curl -s http://localhost:3998/kursus | grep -c "Apakah biaya kelas online bisa dikembalikan"`
Expected: `1` (kursus shows the new refund FAQ entry, and does NOT show shipping-only entries)

Run: `curl -s http://localhost:3998/kursus | grep -c "Apakah pengiriman aman ke luar kota"`
Expected: `0` (kursus does not show the shipping-category entry — category filtering works)

Run: `curl -s http://localhost:3998/toko | grep -c "Berapa lama garansi alat masaknya"`
Expected: `1` (toko now has a FAQ section it previously lacked)

Then stop the server: `kill %1` (or find and kill the `next start` process on port 3998).

- [ ] **Step 5: Commit**

```bash
git add "app/kontak/page.tsx" "app/kursus/page.tsx" "app/toko/page.tsx"
git commit -m "feat: wire shared Faq component into kontak, kursus, and toko pages"
```

---

### Task 5: Add policy snippets to product and course detail pages

**Files:**
- Modify: `components/ProductDetail.tsx`
- Modify: `app/kursus/[slug]/page.tsx`

**Interfaces:**
- Consumes: `POLICIES` from `lib/policies.ts` (Task 1).

- [ ] **Step 1: Update the warranty badge in `components/ProductDetail.tsx`**

Add the import at the top of the file (after the existing `TestimonialCarousel` import on line 10):

```tsx
import { POLICIES } from '@/lib/policies';
```

Change the warranty badge label (currently line 263):

```tsx
              <div className="text-sm font-medium text-stone-700">Garansi Original</div>
```

to:

```tsx
              <div className="text-sm font-medium text-stone-700">{POLICIES.PRODUCT_WARRANTY_SHORT}</div>
```

- [ ] **Step 2: Add the return-policy line in `components/ProductDetail.tsx`**

Immediately after the existing paragraph (currently lines 273-275):

```tsx
            <p className="text-sm text-stone-500 mb-4 text-center">
              Pembelian langsung via WhatsApp. Tidak perlu daftar akun.
            </p>
```

add:

```tsx
            <p className="text-xs text-stone-500 mb-4 text-center">
              {POLICIES.PRODUCT_RETURN_SHORT}
            </p>
```

- [ ] **Step 3: Add the refund-policy line in `app/kursus/[slug]/page.tsx`**

Add the import at the top of the file (after the existing `type { Metadata }` import on line 6):

```tsx
import { POLICIES } from '@/lib/policies';
```

Immediately after the existing paragraph (currently lines 285-287):

```tsx
            <p className="text-xs text-stone-500 text-center">
              Pembayaran aman via transfer bank. Tidak perlu membuat akun di website.
            </p>
```

add:

```tsx
            <p className="text-xs text-stone-500 text-center mt-2">
              {POLICIES.COURSE_REFUND_SHORT}
            </p>
```

- [ ] **Step 4: Build and verify both snippets render**

Run: `npm run build && npm run start -- -p 3998 &`
Run: `sleep 3 && curl -s http://localhost:3998/toko/signora-de-amore | grep -c "Garansi Resmi 1 Tahun"`
Expected: `1`

Run: `curl -s http://localhost:3998/toko/signora-de-amore | grep -c "Penggantian untuk barang rusak"`
Expected: `1`

Run: `curl -s http://localhost:3998/kursus/bakso-sapi-premium | grep -c "tidak ada refund setelah link akses dikirim"`
Expected: `1`

Then stop the server: `kill %1` (or find and kill the `next start` process on port 3998).

- [ ] **Step 5: Commit**

```bash
git add "components/ProductDetail.tsx" "app/kursus/[slug]/page.tsx"
git commit -m "feat: add warranty and refund policy snippets to detail pages"
```

---

### Task 6: Homepage and About page copy — student-count consistency and credential surfacing

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/tentang/page.tsx`

**Interfaces:**
- None (pure copy/JSX edits, no new exports or props).

- [ ] **Step 1: Reword the homepage hero badge in `app/page.tsx`**

Change (currently line 161):

```tsx
                  Lebih dari 10.000+ Murid Bergabung
```

to:

```tsx
                  10.000+ Komunitas Cece Lina Chang
```

- [ ] **Step 2: Add a second hero badge for the bakso-industry credential**

Immediately after the existing badge's closing tag (currently line 163, `</motion.div>`) and before the `<motion.h1` that follows (currently line 165), insert:

```tsx
              <motion.div
                variants={fadeUpVariant}
                className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full w-fit mx-auto lg:mx-0 mb-6"
              >
                <Star className="w-4 h-4 fill-current" />
                <span className="text-sm font-medium">
                  28 Tahun Pengalaman di Industri Bakso
                </span>
              </motion.div>
```

- [ ] **Step 3: Reword the hero body copy**

Change (currently line 179):

```tsx
                Sudah 10.000+ ibu berhasil bikin lapis legit, otak otak, dan bakso sendiri di rumah tanpa pernah masak sebelumnya
```

to:

```tsx
                Sudah ribuan ibu berhasil bikin lapis legit, otak otak, dan bakso sendiri di rumah tanpa pernah masak sebelumnya
```

- [ ] **Step 4: Add the bakso-industry credential sentence to the About page founder story**

In `app/tentang/page.tsx`, immediately after the existing paragraph (currently lines 76-78):

```tsx
            <p>
              Dari situ, saya mulai membagikan resep dan tips baking di sosial media. Ternyata, banyak ibu-ibu di luar sana yang mengalami kesulitan yang sama dengan saya dulu: takut gagal, bingung memilih alat, atau merasa resep di internet terlalu rumit.
            </p>
```

and before the existing "Misi Saya" paragraph (currently line 79):

```tsx
            <p className="font-bold text-orange-900 text-xl mt-8 mb-4">
              Misi Saya
            </p>
```

insert:

```tsx
            <p>
              Selain baking, saya juga memiliki pengalaman lebih dari 28 tahun mengelola pabrik bakso sejak 1998 — pengalaman industri makanan inilah yang saya bawa ke dalam setiap resep dan kelas yang saya ajarkan, agar hasilnya benar-benar teruji, bukan sekadar coba-coba.
            </p>
```

- [ ] **Step 5: Build and verify all four edits render**

Run: `npm run build && npm run start -- -p 3998 &`
Run: `sleep 3 && curl -s http://localhost:3998/ | grep -c "10.000+ Komunitas Cece Lina Chang"`
Expected: `1`

Run: `curl -s http://localhost:3998/ | grep -c "28 Tahun Pengalaman di Industri Bakso"`
Expected: `1`

Run: `curl -s http://localhost:3998/ | grep -c "Sudah ribuan ibu berhasil"`
Expected: `1`

Run: `curl -s http://localhost:3998/tentang | grep -c "pengalaman lebih dari 28 tahun mengelola pabrik bakso"`
Expected: `1`

Then stop the server: `kill %1` (or find and kill the `next start` process on port 3998).

- [ ] **Step 6: Commit**

```bash
git add app/page.tsx "app/tentang/page.tsx"
git commit -m "feat: fix student-count consistency and surface bakso-industry credential"
```

---

## Task Dependency Order

Tasks must execute in order 1 → 2 → 3 → 4/5/6 (Tasks 4, 5, and 6 each depend only on Task 1-3's outputs, not on each other, but subagent-driven-development dispatches one implementer at a time regardless — execute in numeric order for simplicity).
