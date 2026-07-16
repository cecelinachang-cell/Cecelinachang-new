# UI/UX Warmth Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make cecelinachang.com feel personally connected to its creator-owner by refining the existing warm palette, retyping the display/handwriting fonts, and introducing a handwritten-marginalia signature element across every page, without changing routes, data fetching, or business logic.

**Architecture:** Pure presentation-layer change. Add design tokens (color + font) via Tailwind v4's CSS-first `@theme` block in `app/globals.css`, add two small reusable components (`Marginalia`, `SquiggleUnderline`), then restyle each existing page/component in place — same JSX structure and data flow, new classNames and a few added marginalia notes.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js`), `next/font/google`, Framer Motion (`motion/react`), lucide-react.

## Global Constraints

- Keep all existing routes, Supabase queries, and fallback-data behavior unchanged (per spec's "Out of scope").
- No new pages, no new npm dependencies — only `next/font/google` faces already available via the existing `next/font` mechanism.
- Color tokens (exact hex, from spec): `--color-cream:#FBF6EE`, `--color-terracotta:#C4622D`, `--color-rust-ink:#7A3B1E`, `--color-butter:#E8B86D`, `--color-charcoal-brown:#3A2E27`, `--color-pencil-blue:#34424A`.
- Marginalia placement rule (from spec): max 1–2 notes per page section, always anchored to a specific image or claim — never generic decoration.
- This project has no automated test runner (`package.json` has no `test` script, no Jest/Vitest/Playwright installed). Verification for every task is manual: `npm run dev` and visual inspection, as specified in the design doc's Testing section. Do not add a test framework as part of this plan — out of scope.
- There is no `tailwind.config.js` — this is Tailwind v4, config lives in `app/globals.css` via `@theme`.

---

## File Structure

**New files:**
- `components/Marginalia.tsx` — handwritten annotation span (webfont placeholder now, swappable for a scanned-handwriting SVG later without call-site changes)
- `components/SquiggleUnderline.tsx` — hand-drawn SVG underline stroke, used for nav active-state and as a small heading accent

**Modified files:**
- `app/globals.css` — add `@theme` token block (color + `--font-hand`)
- `app/layout.tsx` — swap `Playfair_Display` for `Fraunces`, add `Caveat` handwriting font, swap hardcoded body colors for tokens
- `components/navbar.tsx` — wordmark → handwriting treatment, active-link underline → `SquiggleUnderline`, orange-* → tokens
- `components/footer.tsx` — orange-* → tokens
- `components/TestimonialCarousel.tsx` — orange-* → tokens, one marginalia note near heading
- `app/page.tsx` — remove blob shapes, hero marginalia note replaces stat pill, Keunggulan icon grid → photo-moment tiles, token restyle throughout
- `app/tentang/page.tsx` — photo frame restyle, 2 marginalia notes anchored to story paragraphs, one stat retyped as handwritten
- `app/kursus/page.tsx` — token restyle, one marginalia aside near intro
- `components/CourseCard.tsx` — token restyle, corner-radius/shadow variation
- `app/resep/page.tsx` — token restyle, one marginalia tip per recipe card
- `app/toko/page.tsx` — token restyle only
- `app/toko/[slug]/page.tsx` — token restyle only
- `app/kontak/page.tsx` — token restyle, first-person copy tweak in intro

---

## Task 1: Design tokens (color + type)

**Files:**
- Modify: `app/globals.css`
- Modify: `app/layout.tsx`

**Interfaces:**
- Produces: Tailwind utilities `bg-cream`, `text-cream`, `border-cream` (and same for `terracotta`, `rust-ink`, `butter`, `charcoal-brown`, `pencil-blue`), plus `font-hand`. Every later task consumes these utility class names verbatim.
- Produces: CSS variable `--font-serif` now resolves to Fraunces (was Playfair Display) — no call-site changes needed since `font-serif` usage is unchanged across the codebase.

- [ ] **Step 1: Add the `@theme` token block to `app/globals.css`**

Replace the entire file contents:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@theme {
  --color-cream: #FBF6EE;
  --color-terracotta: #C4622D;
  --color-rust-ink: #7A3B1E;
  --color-butter: #E8B86D;
  --color-charcoal-brown: #3A2E27;
  --color-pencil-blue: #34424A;

  --font-hand: var(--font-caveat);
}
```

- [ ] **Step 2: Swap the display font and add the handwriting font in `app/layout.tsx`**

Change the import line:

```ts
import { Inter, Playfair_Display } from 'next/font/google';
```
to:
```ts
import { Inter, Fraunces, Caveat } from 'next/font/google';
```

Replace the `playfair` font declaration:

```ts
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
});
```
with:
```ts
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  weight: ['500', '600', '700'],
});
```

Update the `<html>` tag's className (replace `playfair.variable` with `fraunces.variable` and add `caveat.variable`):

```tsx
<html lang="id" className={`${inter.variable} ${fraunces.variable} ${caveat.variable}`}>
```

Update the `<body>` className to use the new color tokens instead of the hardcoded hex/stone classes:

```tsx
<body className="font-sans bg-cream text-charcoal-brown min-h-screen flex flex-col" suppressHydrationWarning>
```

- [ ] **Step 3: Verify tokens compile**

Run: `npm run dev`

Expected: dev server starts with no Tailwind/PostCSS errors in the terminal. Visiting `http://localhost:3000` shows the homepage with a slightly warmer/greyer cream background than before (body background changed from `#FFFBF5` to `#FBF6EE`) and the headline font visibly changed (Fraunces has a different italic shape than Playfair Display). No layout breakage.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css app/layout.tsx
git commit -m "feat: add warmth-redesign design tokens (color + type)"
```

---

## Task 2: Signature-element primitives (Marginalia, SquiggleUnderline)

**Files:**
- Create: `components/Marginalia.tsx`
- Create: `components/SquiggleUnderline.tsx`

**Interfaces:**
- Produces: `Marginalia({ children, className?, rotate? }: { children: React.ReactNode; className?: string; rotate?: number })` — renders a `<span>` in the handwriting font/pencil-blue ink, rotated slightly (default -4deg) to look hand-placed. Later tasks import this from `@/components/Marginalia` and pass short Indonesian phrases as `children`.
- Produces: `SquiggleUnderline({ className? }: { className?: string })` — renders an inline SVG hand-drawn stroke that inherits `color` via `currentColor`, sized to fill its container width. Later tasks position it absolutely under nav links and use it as a small heading accent.

- [ ] **Step 1: Create `components/Marginalia.tsx`**

```tsx
interface MarginaliaProps {
  children: React.ReactNode;
  className?: string;
  rotate?: number;
}

export function Marginalia({ children, className = '', rotate = -4 }: MarginaliaProps) {
  return (
    <span
      className={`font-hand text-pencil-blue text-xl sm:text-2xl leading-snug inline-block ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 2: Create `components/SquiggleUnderline.tsx`**

```tsx
export function SquiggleUnderline({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 8"
      className={`w-full h-2 ${className}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M1 5.5C10 1.5 20 8 30 4.5S50 1 59 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
```

- [ ] **Step 3: Smoke-test both components in isolation**

Temporarily add to the bottom of `app/tentang/page.tsx`'s returned JSX (just before the final closing `</div>`):

```tsx
<div className="mt-8 text-terracotta w-24">
  <Marginalia>coba dulu!</Marginalia>
  <SquiggleUnderline />
</div>
```

Add the imports at the top of that file:

```tsx
import { Marginalia } from '@/components/Marginalia';
import { SquiggleUnderline } from '@/components/SquiggleUnderline';
```

Run: `npm run dev`, visit `/tentang`.

Expected: a rotated handwriting-styled "coba dulu!" note renders in blue-grey ink, with a terracotta squiggle underneath it. No console errors.

Then remove this temporary smoke-test block and its imports — Task 9 adds `Tentang`'s real marginalia notes.

- [ ] **Step 4: Commit**

```bash
git add components/Marginalia.tsx components/SquiggleUnderline.tsx
git commit -m "feat: add Marginalia and SquiggleUnderline signature-element primitives"
```

---

## Task 3: Navbar restyle

**Files:**
- Modify: `components/navbar.tsx`

- [ ] **Step 1: Add imports**

At the top of `components/navbar.tsx`, add:

```tsx
import { SquiggleUnderline } from '@/components/SquiggleUnderline';
```

- [ ] **Step 2: Restyle the nav background/border tokens**

Replace:

```tsx
<nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-[#FFFBF5]/90 backdrop-blur-md border-b border-orange-100 shadow-sm' : 'bg-[#FFFBF5] border-b border-transparent'}`}>
```
with:
```tsx
<nav className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled ? 'bg-cream/90 backdrop-blur-md border-b border-butter/40 shadow-sm' : 'bg-cream border-b border-transparent'}`}>
```

- [ ] **Step 3: Replace the wordmark with a handwriting-treatment signature placeholder**

Replace:

```tsx
<span className="font-serif text-2xl font-bold text-orange-800">Cece Lina Chang</span>
```
with:
```tsx
<span className="font-hand text-3xl text-rust-ink">Cece Lina Chang</span>
```

- [ ] **Step 4: Replace the flat `border-b-2` active-link indicator with `SquiggleUnderline`**

Replace the desktop `links.map` block:

```tsx
{links.map((link) => (
  <Link
    key={link.href}
    href={link.href}
    className={`text-base font-medium transition-colors hover:text-orange-600 ${
      pathname === link.href ? 'text-orange-800 border-b-2 border-orange-800' : 'text-stone-600'
    }`}
  >
    {link.label}
  </Link>
))}
```
with:
```tsx
{links.map((link) => (
  <Link
    key={link.href}
    href={link.href}
    className={`relative text-base font-medium transition-colors hover:text-terracotta pb-1 ${
      pathname === link.href ? 'text-rust-ink' : 'text-charcoal-brown/70'
    }`}
  >
    {link.label}
    {pathname === link.href && (
      <SquiggleUnderline className="absolute left-0 -bottom-0.5 w-full text-terracotta" />
    )}
  </Link>
))}
```

- [ ] **Step 5: Restyle remaining orange-* utility classes to tokens**

Replace all four remaining `text-orange-800 hover:text-orange-600` occurrences (desktop shop icon, mobile shop icon, mobile menu button) with `text-rust-ink hover:text-terracotta`, and in the mobile menu block replace:

```tsx
<div className="md:hidden bg-[#FFFBF5] border-b border-orange-100">
```
with:
```tsx
<div className="md:hidden bg-cream border-b border-butter/40">
```

and replace:

```tsx
className={`block px-3 py-2 rounded-md text-base font-medium ${
  pathname === link.href
    ? 'bg-orange-100 text-orange-800'
    : 'text-stone-600 hover:bg-orange-50 hover:text-orange-800'
}`}
```
with:
```tsx
className={`block px-3 py-2 rounded-md text-base font-medium ${
  pathname === link.href
    ? 'bg-butter/30 text-rust-ink'
    : 'text-charcoal-brown/70 hover:bg-butter/20 hover:text-rust-ink'
}`}
```

- [ ] **Step 6: Verify**

Run: `npm run dev`, visit `/`, `/toko`, `/kursus`, `/tentang`.

Expected: wordmark renders in handwriting-style script. The active page's nav link shows a small hand-drawn squiggle under it instead of a straight line, in terracotta. Scrolling triggers the cream/blur background transition as before. Mobile menu (resize below `md`) opens/closes correctly with the new active-state colors.

- [ ] **Step 7: Commit**

```bash
git add components/navbar.tsx
git commit -m "style(navbar): handwriting wordmark and squiggle active-link indicator"
```

---

## Task 4: Footer restyle

**Files:**
- Modify: `components/footer.tsx`

- [ ] **Step 1: Restyle the footer background and wordmark**

Replace:

```tsx
<footer className="bg-orange-900 text-orange-50 py-12">
```
with:
```tsx
<footer className="bg-rust-ink text-cream py-12">
```

Replace:

```tsx
<span className="font-serif text-2xl font-bold mb-4 block">Cece Lina Chang</span>
<p className="text-orange-200 mb-6 max-w-sm">
```
with:
```tsx
<span className="font-hand text-3xl mb-4 block">Cece Lina Chang</span>
<p className="text-butter/90 mb-6 max-w-sm">
```

- [ ] **Step 2: Replace remaining orange-* utilities with tokens**

Replace every `text-orange-200 hover:text-white` with `text-butter/90 hover:text-cream` (social icons, both link columns).

Replace:

```tsx
<div className="border-t border-orange-800 mt-12 pt-8 text-center text-orange-300 text-sm">
```
with:
```tsx
<div className="border-t border-cream/20 mt-12 pt-8 text-center text-butter/70 text-sm">
```

- [ ] **Step 3: Verify**

Run: `npm run dev`, scroll to footer on any page.

Expected: footer background is deep rust-brown (not flat orange-900), wordmark is in the handwriting font, link/icon colors read as warm butter tones with cream on hover. No layout shift.

- [ ] **Step 4: Commit**

```bash
git add components/footer.tsx
git commit -m "style(footer): apply warmth-redesign tokens"
```

---

## Task 5: TestimonialCarousel restyle + marginalia note

**Files:**
- Modify: `components/TestimonialCarousel.tsx`

- [ ] **Step 1: Add the Marginalia import**

```tsx
import { Marginalia } from '@/components/Marginalia';
```

- [ ] **Step 2: Restyle heading and add one marginalia note**

Replace:

```tsx
<div className="text-center mb-12">
  <h2 className="font-serif text-3xl font-bold text-orange-900 mb-4">Apa Kata Mereka?</h2>
  <div className="w-24 h-1 bg-orange-200 mx-auto rounded-full"></div>
</div>
```
with:
```tsx
<div className="text-center mb-12">
  <h2 className="font-serif text-3xl font-bold text-rust-ink mb-2">Apa Kata Mereka?</h2>
  <Marginalia rotate={-3} className="text-lg">setiap pesan ini aku baca sendiri :&#39;)</Marginalia>
</div>
```

- [ ] **Step 3: Restyle card frame and controls**

Replace:

```tsx
<div className="relative bg-white rounded-3xl shadow-xl p-4 md:p-8 border border-orange-50 overflow-hidden">
```
with:
```tsx
<div className="relative bg-white rounded-[1.75rem] shadow-xl p-4 md:p-8 border border-butter/30 overflow-hidden">
```

Replace both nav button classNames (prev/next), which are identical apart from `left-4`/`right-4`:

```tsx
className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-orange-600 hover:bg-orange-50 hover:scale-110 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-orange-500"
```
with:
```tsx
className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-terracotta hover:bg-butter/20 hover:scale-110 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-terracotta"
```
(and the equivalent `right-4` variant).

Replace the indicator dots:

```tsx
className={`w-3 h-3 rounded-full transition-all ${
  index === currentIndex ? 'bg-orange-600 scale-125' : 'bg-orange-200 hover:bg-orange-400'
}`}
```
with:
```tsx
className={`w-3 h-3 rounded-full transition-all ${
  index === currentIndex ? 'bg-terracotta scale-125' : 'bg-butter/60 hover:bg-butter'
}`}
```

- [ ] **Step 4: Verify**

Run: `npm run dev`, visit `/` and scroll to the testimonial carousel.

Expected: heading shows a small rotated handwritten aside under "Apa Kata Mereka?", card frame and controls use terracotta/butter tones instead of orange-*. Carousel still auto-advances every 5s, drag-to-swipe and arrow buttons still work.

- [ ] **Step 5: Commit**

```bash
git add components/TestimonialCarousel.tsx
git commit -m "style(testimonials): apply tokens and add marginalia aside"
```

---

## Task 6: Home — hero section

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the Marginalia import**

At the top of `app/page.tsx`, add:

```tsx
import { Marginalia } from "@/components/Marginalia";
```

- [ ] **Step 2: Remove the decorative blob shapes**

Delete these two lines from the hero `<section>`:

```tsx
<div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 hidden md:block animate-blob"></div>
<div className="absolute top-0 left-0 translate-y-1/3 -translate-x-1/3 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 hidden md:block animate-blob animation-delay-2000"></div>
```

Change the hero `<section>`'s className from:

```tsx
<section className="relative bg-[#FFFBF5] overflow-hidden">
```
to:
```tsx
<section className="relative bg-cream overflow-hidden">
```

- [ ] **Step 3: Replace the stat-badge pill with a marginalia note**

Replace:

```tsx
<motion.div
  variants={fadeUpVariant}
  className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full w-fit mx-auto lg:mx-0 mb-6"
>
  <Star className="w-4 h-4 fill-current" />
  <span className="text-sm font-medium">
    Lebih dari 10.000+ Murid Bergabung
  </span>
</motion.div>
```
with:
```tsx
<motion.div variants={fadeUpVariant} className="mb-6 mx-auto lg:mx-0 w-fit">
  <Marginalia rotate={-3}>sudah 10.000+ murid, makasih ya!</Marginalia>
</motion.div>
```

Remove the now-unused `Star` import usage check: `Star` is still used later in the same file (rating stars on the hero photo), so leave the import as-is.

- [ ] **Step 4: Restyle headline, subhead, and CTA colors**

Replace:

```tsx
<motion.h1
  variants={fadeUpVariant}
  className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-stone-900 leading-[1.1] mb-6"
>
  Belajar Baking <br />
  <span className="text-orange-600 italic font-normal">
    Anti Gagal
  </span>
</motion.h1>
```
with:
```tsx
<motion.h1
  variants={fadeUpVariant}
  className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold text-charcoal-brown leading-[1.1] mb-6"
>
  Belajar Baking <br />
  <span className="text-terracotta italic font-normal">
    Anti Gagal
  </span>
</motion.h1>
```

Replace `text-stone-600` on the subhead paragraph with `text-charcoal-brown/80`.

Replace the two CTA links:

```tsx
<Link
  href="#kelas"
  className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-orange-600 hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-orange-600/20"
>
  Mulai Belajar <ArrowRight className="ml-2 w-5 h-5" />
</Link>
<Link
  href="/toko"
  className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-stone-700 bg-white border border-stone-200 hover:border-orange-300 hover:bg-orange-50 hover:scale-105 active:scale-95 transition-all shadow-sm"
>
  Lihat Alat Masak <ShoppingBag className="ml-2 w-5 h-5" />
</Link>
```
with:
```tsx
<Link
  href="#kelas"
  className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-white bg-terracotta hover:bg-rust-ink hover:scale-105 active:scale-95 transition-all shadow-lg shadow-terracotta/20"
>
  Mulai Belajar <ArrowRight className="ml-2 w-5 h-5" />
</Link>
<Link
  href="/toko"
  className="inline-flex justify-center items-center px-8 py-4 text-lg font-medium rounded-full text-charcoal-brown bg-white border border-butter/40 hover:border-terracotta/50 hover:bg-butter/10 hover:scale-105 active:scale-95 transition-all shadow-sm"
>
  Lihat Alat Masak <ShoppingBag className="ml-2 w-5 h-5" />
</Link>
```

- [ ] **Step 5: Restyle hero photo frame corner radius (vary from the uniform rounded-3xl elsewhere)**

Replace `rounded-[2rem]` with `rounded-[2.5rem_1rem_2.5rem_1rem]` on the hero photo wrapper div (a subtly asymmetric frame, distinct from the fully-rounded cards used later):

```tsx
<div className="relative w-full aspect-[4/5] rounded-[2.5rem_1rem_2.5rem_1rem] overflow-hidden shadow-2xl border-8 border-white">
```

- [ ] **Step 6: Verify**

Run: `npm run dev`, visit `/`.

Expected: no blurred blob shapes behind the hero. The stat pill is gone, replaced by a handwritten-style aside above the headline. Headline uses charcoal-brown/terracotta instead of stone/orange. Hero photo frame has a visibly asymmetric rounded corner treatment, not a plain uniform rounded rectangle. Page still loads the hero image from Supabase `hero_image` setting or its fallback.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx
git commit -m "style(home): remove blob decoration, retype hero, add marginalia note"
```

---

## Task 7: Home — Keunggulan section → photo-moment tiles

**Files:**
- Modify: `app/page.tsx`

**Interfaces:**
- Consumes: `Marginalia` from Task 2 (already imported in Task 6).

- [ ] **Step 1: Replace the icon-tile array and JSX with photo-moment tiles**

Replace the entire Keunggulan `<section>`:

```tsx
{/* Keunggulan Section */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      {
        icon: <Award className="w-8 h-8" />,
        title: "Resep Teruji",
        desc: "Setiap resep telah diuji coba berkali-kali untuk memastikan anti gagal.",
      },
      {
        icon: <PlayCircle className="w-8 h-8" />,
        title: "Video Detail",
        desc: "Panduan video langkah demi langkah yang sangat jelas dan mudah diikuti.",
      },
      {
        icon: <Heart className="w-8 h-8" />,
        title: "Dukungan Penuh",
        desc: "Grup komunitas dan konsultasi langsung untuk menjawab pertanyaan Anda.",
      },
    ].map((feature, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: i * 0.1 }}
        className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow text-center group"
      >
        <div className="w-16 h-16 mx-auto bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300">
          {feature.icon}
        </div>
        <h3 className="font-bold text-xl text-stone-900 mb-3">
          {feature.title}
        </h3>
        <p className="text-stone-600 leading-relaxed">{feature.desc}</p>
      </motion.div>
    ))}
  </div>
</section>
```
with:
```tsx
{/* Keunggulan Section */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8">
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    {[
      {
        image: assets["home_course_2"] || "https://i.postimg.cc/rmKx8jyp/LAPISLEGITPHOTO.png",
        alt: "Lapis legit buatan Cece Lina Chang",
        title: "Resep Teruji",
        desc: "Setiap resep telah diuji coba berkali-kali untuk memastikan anti gagal.",
        note: "ini lapis legit favoritku!",
      },
      {
        image: assets["home_course_1"] || "https://i.postimg.cc/t10xCGvR/image.png",
        alt: "Video tutorial baking",
        title: "Video Detail",
        desc: "Panduan video langkah demi langkah yang sangat jelas dan mudah diikuti.",
        note: "nonton bareng aku, ya",
      },
      {
        image: assets["home_course_3"] || "https://i.postimg.cc/ppmR9mmT/MEATPIEPHOTO.png",
        alt: "Komunitas murid baking",
        title: "Dukungan Penuh",
        desc: "Grup komunitas dan konsultasi langsung untuk menjawab pertanyaan Anda.",
        note: "tanya apa aja, aku jawab",
      },
    ].map((feature, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: i * 0.1 }}
        className="bg-white rounded-2xl shadow-sm border border-butter/30 hover:shadow-md transition-shadow overflow-hidden group"
      >
        <div className="relative w-full aspect-[4/3] overflow-hidden">
          <Image
            src={feature.image}
            alt={feature.alt}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <Marginalia
            rotate={i % 2 === 0 ? -4 : 4}
            className="absolute bottom-3 right-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          >
            {feature.note}
          </Marginalia>
        </div>
        <div className="p-6 text-center">
          <h3 className="font-bold text-xl text-charcoal-brown mb-3">
            {feature.title}
          </h3>
          <p className="text-charcoal-brown/70 leading-relaxed">{feature.desc}</p>
        </div>
      </motion.div>
    ))}
  </div>
</section>
```

Note: `Marginalia`'s default `text-pencil-blue` is overridden here via the `className` prop (`text-white`) since these notes sit on dark photos, not paper — keep this override, don't remove it.

- [ ] **Step 2: Verify**

Run: `npm run dev`, visit `/`, scroll to the Keunggulan section.

Expected: three photo tiles (reusing the same Supabase-backed course images already used lower on the page) each with a small white handwritten note in the bottom-right corner, replacing the old icon+heading+paragraph tiles. Images still fall back correctly when Supabase `settings` fetch fails (unconfigured/offline).

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "style(home): replace icon-grid Keunggulan section with annotated photo tiles"
```

---

## Task 8: Home — Kursus/Produk/Social sections restyle

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Restyle the Kursus Online promo block**

Replace `bg-orange-100` (outer rounded panel) → `bg-butter/25`.
Replace `bg-orange-200 text-orange-800` (eyebrow pill) → `bg-butter/50 text-rust-ink`.
Replace `text-orange-900` (h2) → `text-rust-ink`.
Replace `text-stone-700` (paragraph + benefit list text) → `text-charcoal-brown/80`.
Replace `bg-orange-800 hover:bg-orange-900` (CTA button) → `bg-terracotta hover:bg-rust-ink`.
Replace the course-image tile background `bg-orange-200` → `bg-butter/40`.

- [ ] **Step 2: Restyle the Produk Pilihan section**

Replace `text-orange-900` (h2) → `text-rust-ink`.
Replace `text-stone-600` (subhead) → `text-charcoal-brown/70`.
On each product card, replace `border-stone-100` → `border-butter/30`, and change the card's `rounded-2xl` to `rounded-[1.25rem_0.5rem_1.25rem_0.5rem]` to vary the corner treatment from the fully-uniform radius used elsewhere.
Replace `text-orange-500` (category label) → `text-terracotta`.
Replace `text-orange-600` (product name hover + price) → `text-terracotta`.
Replace `bg-orange-50 text-orange-700 hover:bg-orange-100` (Detail Produk button) → `bg-butter/20 text-rust-ink hover:bg-butter/35`.
Replace the empty-state block's `bg-stone-50 border-stone-100`, `text-stone-700`, `text-stone-500` → `bg-butter/10 border-butter/30`, `text-charcoal-brown`, `text-charcoal-brown/60` respectively.
Replace the "Lihat Semua Produk" link's `text-orange-600 hover:text-orange-800` → `text-terracotta hover:text-rust-ink`.

- [ ] **Step 3: Restyle the Social Media section**

Replace `bg-orange-50` (section background) → `bg-butter/15`.
Replace `text-orange-900` (h2) → `text-rust-ink`.
Replace `text-stone-600` (paragraph) → `text-charcoal-brown/70`.
Replace `text-stone-800` (both social link text colors) → `text-charcoal-brown`.

- [ ] **Step 4: Verify**

Run: `npm run dev`, visit `/`, scroll through the rest of the homepage.

Expected: Kursus, Produk Pilihan, and Social sections all read in the new warm palette (no remaining `orange-*`/`stone-*` Tailwind classes in these three sections). Product cards show a visibly different corner treatment than the Keunggulan tiles from Task 7. Loading skeletons and empty states still render correctly (temporarily throttle network or check by reading the loading branch in code).

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx
git commit -m "style(home): retoken Kursus, Produk Pilihan, and Social sections"
```

---

## Task 9: Tentang — marginalia notes, photo frame, stat treatment

**Files:**
- Modify: `app/tentang/page.tsx`

- [ ] **Step 1: Add the Marginalia import**

```tsx
import { Marginalia } from '@/components/Marginalia';
```

- [ ] **Step 2: Restyle the photo frame away from the generic glass-card look**

Replace:

```tsx
className="relative h-[500px] lg:h-[700px] rounded-[3rem] overflow-hidden shadow-2xl bg-orange-50 flex items-center justify-center group"
```
with:
```tsx
className="relative h-[500px] lg:h-[700px] rounded-[3rem_0.5rem_3rem_0.5rem] overflow-hidden shadow-2xl bg-butter/20 border-8 border-white flex items-center justify-center group"
```

Replace the caption card:

```tsx
<div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-3xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
  <h2 className="font-serif text-2xl font-bold text-orange-900 mb-2">Cece Lina Chang</h2>
  <p className="text-stone-600 font-medium">Baking Content Creator & Instruktur</p>
  <div className="flex items-center mt-4 text-orange-600">
```
with:
```tsx
<div className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
  <h2 className="font-serif text-2xl font-bold text-rust-ink mb-2">Cece Lina Chang</h2>
  <p className="text-charcoal-brown/70 font-medium">Baking Content Creator & Instruktur</p>
  <div className="flex items-center mt-4 text-terracotta">
```

- [ ] **Step 3: Restyle the eyebrow pill and headline**

Replace:

```tsx
<div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-8 w-fit">
  <Heart className="w-5 h-5 fill-current" /> Halo, Saya Lina!
</div>

<h1 className="font-serif text-4xl lg:text-5xl font-bold text-orange-900 mb-8 leading-tight">
```
with:
```tsx
<div className="inline-flex items-center space-x-2 bg-butter/40 text-rust-ink px-4 py-2 rounded-full text-sm font-medium mb-8 w-fit">
  <Heart className="w-5 h-5 fill-current" /> Halo, Saya Lina!
</div>

<h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-8 leading-tight">
```

- [ ] **Step 4: Add two marginalia notes anchored to the personal-story paragraphs**

Replace the story paragraph block:

```tsx
<div className="space-y-6 text-lg text-stone-700 leading-relaxed">
  <p>
    Semua berawal dari keinginan sederhana: membuatkan camilan sehat dan enak untuk keluarga di rumah. Saya ingat betul, percobaan pertama saya membuat roti sobek berakhir dengan roti yang keras seperti batu.
  </p>
  <p>
    Tapi saya tidak menyerah. Saya terus mencoba, membaca, dan belajar dari berbagai sumber. Perlahan, roti yang keras mulai menjadi empuk. Bolu yang bantat mulai mengembang sempurna. Dan yang paling penting, senyum keluarga saat mencicipi hasil karya saya adalah bayaran yang tak ternilai.
  </p>
  <p>
    Dari situ, saya mulai membagikan resep dan tips baking di sosial media. Ternyata, banyak ibu-ibu di luar sana yang mengalami kesulitan yang sama dengan saya dulu: takut gagal, bingung memilih alat, atau merasa resep di internet terlalu rumit.
  </p>
  <p className="font-bold text-orange-900 text-xl mt-8 mb-4">
    Misi Saya
  </p>
  <p>
    Saya ingin membuktikan bahwa <strong>siapa saja bisa baking</strong>. Anda tidak perlu dapur mewah atau alat mahal untuk memulai. Yang Anda butuhkan hanyalah kemauan, resep yang tepat, dan sedikit kesabaran.
  </p>
  <p>
    Melalui website ini, saya mengumpulkan semua resep andalan, merekomendasikan alat yang benar-benar saya pakai dan terbukti bagus, serta membuka kelas online dengan bahasa yang sangat sederhana agar mudah dipahami oleh pemula sekalipun.
  </p>
  <p>
    Mari kita ciptakan aroma harum kue dari dapur rumah kita sendiri, dan bagikan kebahagiaan itu kepada orang-orang tercinta.
  </p>
</div>
```
with:
```tsx
<div className="space-y-6 text-lg text-charcoal-brown/85 leading-relaxed">
  <p>
    Semua berawal dari keinginan sederhana: membuatkan camilan sehat dan enak untuk keluarga di rumah. Saya ingat betul, percobaan pertama saya membuat roti sobek berakhir dengan roti yang keras seperti batu.
  </p>
  <div className="flex items-start gap-4">
    <p className="flex-1">
      Tapi saya tidak menyerah. Saya terus mencoba, membaca, dan belajar dari berbagai sumber. Perlahan, roti yang keras mulai menjadi empuk. Bolu yang bantat mulai mengembang sempurna. Dan yang paling penting, senyum keluarga saat mencicipi hasil karya saya adalah bayaran yang tak ternilai.
    </p>
    <Marginalia rotate={4} className="hidden sm:block shrink-0 w-32 text-base">
      roti pertamaku keras banget, beneran!
    </Marginalia>
  </div>
  <p>
    Dari situ, saya mulai membagikan resep dan tips baking di sosial media. Ternyata, banyak ibu-ibu di luar sana yang mengalami kesulitan yang sama dengan saya dulu: takut gagal, bingung memilih alat, atau merasa resep di internet terlalu rumit.
  </p>
  <p className="font-bold text-rust-ink text-xl mt-8 mb-4">
    Misi Saya
  </p>
  <div className="flex items-start gap-4">
    <p className="flex-1">
      Saya ingin membuktikan bahwa <strong>siapa saja bisa baking</strong>. Anda tidak perlu dapur mewah atau alat mahal untuk memulai. Yang Anda butuhkan hanyalah kemauan, resep yang tepat, dan sedikit kesabaran.
    </p>
    <Marginalia rotate={-4} className="hidden sm:block shrink-0 w-28 text-base">
      kamu pasti bisa!
    </Marginalia>
  </div>
  <p>
    Melalui website ini, saya mengumpulkan semua resep andalan, merekomendasikan alat yang benar-benar saya pakai dan terbukti bagus, serta membuka kelas online dengan bahasa yang sangat sederhana agar mudah dipahami oleh pemula sekalipun.
  </p>
  <p>
    Mari kita ciptakan aroma harum kue dari dapur rumah kita sendiri, dan bagikan kebahagiaan itu kepada orang-orang tercinta.
  </p>
</div>
```

- [ ] **Step 5: Retype one of the two stats as a handwritten number**

Replace the stats grid:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 pt-12 border-t border-orange-100">
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4 hover:scale-110 transition-transform">
      <Users className="w-8 h-8" />
    </div>
    <div className="font-serif text-3xl font-bold text-orange-900 mb-2">2000+</div>
    <div className="text-stone-600">Murid Kelas Online</div>
  </motion.div>
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 mb-4 hover:scale-110 transition-transform">
      <Heart className="w-8 h-8" />
    </div>
    <div className="font-serif text-3xl font-bold text-orange-900 mb-2">50k+</div>
    <div className="text-stone-600">Pengikut Setia</div>
  </motion.div>
</div>
```
with:
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12 pt-12 border-t border-butter/40">
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.4 }}
    className="flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 bg-butter/30 rounded-full flex items-center justify-center text-terracotta mb-4 hover:scale-110 transition-transform">
      <Users className="w-8 h-8" />
    </div>
    <div className="font-serif text-3xl font-bold text-rust-ink mb-2">2000+</div>
    <div className="text-charcoal-brown/70">Murid Kelas Online</div>
  </motion.div>
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: 0.5 }}
    className="flex flex-col items-center text-center"
  >
    <div className="w-16 h-16 bg-butter/30 rounded-full flex items-center justify-center text-terracotta mb-4 hover:scale-110 transition-transform">
      <Heart className="w-8 h-8" />
    </div>
    <Marginalia rotate={-2} className="text-4xl mb-1">50rb+</Marginalia>
    <div className="text-charcoal-brown/70">Pengikut Setia</div>
  </motion.div>
</div>
```

- [ ] **Step 6: Verify**

Run: `npm run dev`, visit `/tentang`.

Expected: photo frame has an asymmetric rounded corner (not the old uniform `rounded-[3rem]`), two handwritten margin notes appear beside the first and fourth story paragraphs on desktop widths (hidden below `sm` to avoid cramping mobile line length), and the "Pengikut Setia" stat now reads as a handwritten "50rb+" instead of a typeset number, while "Murid Kelas Online" stays typeset — this intentional mix is per spec (avoids the page feeling like two competing systems by making only one stat handwritten, not both).

- [ ] **Step 7: Commit**

```bash
git add app/tentang/page.tsx
git commit -m "style(tentang): photo frame, marginalia notes, and handwritten stat"
```

---

## Task 10: Kursus — CourseCard + page restyle + marginalia aside

**Files:**
- Modify: `app/kursus/page.tsx`
- Modify: `components/CourseCard.tsx`

- [ ] **Step 1: Add the Marginalia import and intro aside in `app/kursus/page.tsx`**

Add the import:

```tsx
import { Marginalia } from "@/components/Marginalia";
```

Replace the header block:

```tsx
<div className="text-center mb-16">
  <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
    <BookOpen className="w-5 h-5" /> Belajar Bersama Cece Lina
  </div>
  <h1 className="font-serif text-4xl lg:text-5xl font-bold text-orange-900 mb-6">
    Kursus Online
  </h1>
  <p className="text-lg text-stone-600 max-w-2xl mx-auto">
    Belajar langsung dari ahlinya melalui video tutorial yang jelas,
    detail, dan mudah diikuti. Akses seumur hidup dan konsultasi langsung
    dengan cece lina chang.
  </p>
</div>
```
with:
```tsx
<div className="text-center mb-16">
  <div className="inline-flex items-center space-x-2 bg-butter/40 text-rust-ink px-4 py-2 rounded-full text-sm font-medium mb-6">
    <BookOpen className="w-5 h-5" /> Belajar Bersama Cece Lina
  </div>
  <h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-4">
    Kursus Online
  </h1>
  <Marginalia rotate={-2} className="block mb-4">
    kenapa aku bikin kelas ini? biar kamu nggak perlu gagal berkali-kali kayak aku dulu.
  </Marginalia>
  <p className="text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
    Belajar langsung dari ahlinya melalui video tutorial yang jelas,
    detail, dan mudah diikuti. Akses seumur hidup dan konsultasi langsung
    dengan cece lina chang.
  </p>
</div>
```

- [ ] **Step 2: Restyle the empty state and FAQ section in `app/kursus/page.tsx`**

Replace `bg-stone-50 border-stone-100` (empty state) → `bg-butter/10 border-butter/30`, `text-stone-700` → `text-charcoal-brown`, `text-stone-500` → `text-charcoal-brown/60`.

Replace:

```tsx
<h2 className="font-serif text-3xl font-bold text-orange-900 mb-8 text-center">
  Pertanyaan Sering Diajukan
</h2>
```
with:
```tsx
<h2 className="font-serif text-3xl font-bold text-rust-ink mb-8 text-center">
  Pertanyaan Sering Diajukan
</h2>
```

Replace each FAQ card's `bg-white ... border-orange-100` → `border-butter/30` (keep `bg-white`), `text-stone-800` → `text-charcoal-brown`, `text-stone-600` → `text-charcoal-brown/70`.

- [ ] **Step 3: Restyle `components/CourseCard.tsx`**

Replace the outer card className:

```tsx
className={`bg-white rounded-3xl overflow-hidden shadow-lg border flex flex-col lg:flex-row relative ${course.isSignature ? "border-orange-400 ring-4 ring-orange-100" : "border-orange-100"}`}
```
with:
```tsx
className={`bg-white rounded-[2rem_0.75rem_2rem_0.75rem] overflow-hidden shadow-lg border flex flex-col lg:flex-row relative ${course.isSignature ? "border-terracotta ring-4 ring-butter/30" : "border-butter/30"}`}
```

Replace the SIGNATURE badge:

```tsx
<div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center">
```
with:
```tsx
<div className="absolute top-4 left-4 z-10 bg-terracotta text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center">
```

Replace `text-orange-900` (title) → `text-rust-ink`; `text-stone-600` (description) → `text-charcoal-brown/75`; both `text-stone-500`/`bg-orange-50 ... text-orange-600` badge pills → `text-charcoal-brown/60`/`bg-butter/25 text-terracotta`; `text-stone-800` (benefits heading) → `text-charcoal-brown`; `border-orange-100` (footer divider) → `border-butter/30`; `text-stone-400` (strikethrough price) → `text-charcoal-brown/40`; `text-orange-800` (price) → `text-rust-ink`. Leave the green WhatsApp CTA button (`bg-green-600 hover:bg-green-700`) unchanged — it's a recognized WhatsApp-brand color, not part of the site's own accent system.

- [ ] **Step 4: Verify**

Run: `npm run dev`, visit `/kursus`.

Expected: page header shows a handwritten aside under "Kursus Online" before the regular subhead paragraph. Course cards show an asymmetric corner radius and terracotta/butter accents instead of orange-*. FAQ cards restyled. WhatsApp CTA button still green and functional (opens `wa.me` link).

- [ ] **Step 5: Commit**

```bash
git add app/kursus/page.tsx components/CourseCard.tsx
git commit -m "style(kursus): retoken course cards and FAQ, add intro marginalia aside"
```

---

## Task 11: Resep — restyle + per-card marginalia tip

**Files:**
- Modify: `app/resep/page.tsx`

- [ ] **Step 1: Add the Marginalia import and a `tip` field per recipe**

Add the import:

```tsx
import { Marginalia } from '@/components/Marginalia';
```

Replace the `recipes` array to add one short handwritten tip per recipe:

```tsx
const recipes = [
  { id: 1, title: 'Roti Sobek Susu Super Lembut', category: 'Roti', time: '120 mnt', difficulty: 'Sedang', image: 'bread', tip: 'kuncinya di uleni sampe kalis!' },
  { id: 2, title: 'Bolu Marmer Klasik Anti Gagal', category: 'Kue', time: '60 mnt', difficulty: 'Mudah', image: 'cake', tip: 'jangan buka oven dulu ya' },
  { id: 3, title: 'Chocochip Cookies Renyah', category: 'Cookies', time: '45 mnt', difficulty: 'Mudah', image: 'cookies', tip: 'dinginkan adonan 30 menit' },
  { id: 4, title: 'Nastar Lumer Mulut', category: 'Resep Favorit Indonesia', time: '90 mnt', difficulty: 'Sedang', image: 'nastar', tip: 'selai jangan kebanyakan!' },
  { id: 5, title: 'Donat Kampung Empuk', category: 'Roti', time: '120 mnt', difficulty: 'Sedang', image: 'donut', tip: 'minyaknya jangan kepanasan' },
  { id: 6, title: 'Brownies Panggang Fudgy', category: 'Kue', time: '50 mnt', difficulty: 'Mudah', image: 'brownies', tip: 'kuncinya di suhu oven!' },
];
```

- [ ] **Step 2: Restyle header and search/filter controls**

Replace `text-orange-900` (h1) → `text-rust-ink`; `text-stone-600` (subhead) → `text-charcoal-brown/70`.

Replace:

```tsx
<input
  type="text"
  className="block w-full pl-11 pr-4 py-4 border border-orange-200 rounded-full bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
  placeholder="Cari resep (misal: Roti Sobek)..."
/>
```
with:
```tsx
<input
  type="text"
  className="block w-full pl-11 pr-4 py-4 border border-butter/40 rounded-full bg-white text-charcoal-brown placeholder-charcoal-brown/40 focus:outline-none focus:ring-2 focus:ring-terracotta focus:border-transparent shadow-sm"
  placeholder="Cari resep (misal: Roti Sobek)..."
/>
```

Replace the Filter button's `border-orange-200 ... text-stone-700 hover:bg-orange-50` → `border-butter/40 text-charcoal-brown hover:bg-butter/15`.

Replace the category chips:

```tsx
className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-colors ${
  i === 0
    ? 'bg-orange-800 text-white'
    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
}`}
```
with:
```tsx
className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-colors ${
  i === 0
    ? 'bg-rust-ink text-white'
    : 'bg-butter/30 text-rust-ink hover:bg-butter/50'
}`}
```

- [ ] **Step 3: Add the marginalia tip to each recipe card**

Replace the recipe card image block:

```tsx
<div className="relative h-64 overflow-hidden">
  <Image
    src={`https://picsum.photos/seed/${resep.image}/600/400`}
    alt={resep.title}
    fill
    className="object-cover group-hover:scale-105 transition-transform duration-500"
    referrerPolicy="no-referrer"
  />
  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-orange-800">
    {resep.category}
  </div>
</div>
<div className="p-6">
  <h3 className="font-serif text-xl font-bold text-stone-800 group-hover:text-orange-600 transition-colors mb-4 line-clamp-2">
    {resep.title}
  </h3>
  <div className="flex items-center justify-between text-stone-500 text-sm">
```
with:
```tsx
<div className="relative h-64 overflow-hidden">
  <Image
    src={`https://picsum.photos/seed/${resep.image}/600/400`}
    alt={resep.title}
    fill
    className="object-cover group-hover:scale-105 transition-transform duration-500"
    referrerPolicy="no-referrer"
  />
  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-rust-ink">
    {resep.category}
  </div>
  <Marginalia
    rotate={-3}
    className="absolute bottom-3 right-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] text-lg"
  >
    {resep.tip}
  </Marginalia>
</div>
<div className="p-6">
  <h3 className="font-serif text-xl font-bold text-charcoal-brown group-hover:text-terracotta transition-colors mb-4 line-clamp-2">
    {resep.title}
  </h3>
  <div className="flex items-center justify-between text-charcoal-brown/60 text-sm">
```

Note: recipe images (`picsum.photos` placeholders) and the fabricated recipe list itself are unchanged — real recipe photography/content is out of scope for this visual redesign per the spec.

- [ ] **Step 4: Restyle the "Muat Lebih Banyak" button**

Replace `text-orange-800 bg-orange-100 hover:bg-orange-200` → `text-rust-ink bg-butter/30 hover:bg-butter/50`.

- [ ] **Step 5: Verify**

Run: `npm run dev`, visit `/resep`.

Expected: each recipe card shows a small handwritten tip in the bottom-right of its photo (e.g. "kuncinya di suhu oven!" on Brownies). Search input, filter button, and category chips read in the new palette. Placeholder picsum images still load (expected — real photography is a separate content workstream).

- [ ] **Step 6: Commit**

```bash
git add app/resep/page.tsx
git commit -m "style(resep): retoken page and add per-card marginalia tips"
```

---

## Task 12: Toko (list + detail) — restyle only

**Files:**
- Modify: `app/toko/page.tsx`
- Modify: `app/toko/[slug]/page.tsx`

No marginalia on this page per spec ("a shop listing isn't the place for it").

- [ ] **Step 1: Restyle `app/toko/page.tsx`**

Replace `text-orange-900` (h1) → `text-rust-ink`; `text-stone-600` (subhead) → `text-charcoal-brown/70`.

Replace the category filter buttons:

```tsx
className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
  selectedCategory === category
    ? "bg-orange-600 text-white shadow-md scale-105"
    : "bg-white text-stone-600 border border-stone-200 hover:border-orange-300 hover:text-orange-600"
}`}
```
with:
```tsx
className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
  selectedCategory === category
    ? "bg-terracotta text-white shadow-md scale-105"
    : "bg-white text-charcoal-brown/70 border border-butter/40 hover:border-terracotta/50 hover:text-terracotta"
}`}
```

On each product card: replace `border-stone-100` → `border-butter/30`, change `rounded-2xl` (card) to `rounded-[1.25rem_0.5rem_1.25rem_0.5rem]`, `text-stone-900 group-hover:text-orange-600` (title) → `text-charcoal-brown group-hover:text-terracotta`, `text-orange-600` (price) → `text-terracotta`, `bg-orange-50 text-orange-700 hover:bg-orange-100` (Detail button) → `bg-butter/20 text-rust-ink hover:bg-butter/35`.

Replace the empty-state block's `bg-stone-50 border-stone-100`, `text-stone-700`, `text-stone-500` → `bg-butter/10 border-butter/30`, `text-charcoal-brown`, `text-charcoal-brown/60`. Replace the "Lihat Semua Produk" reset button's `bg-orange-100 text-orange-700 hover:bg-orange-200` → `bg-butter/30 text-rust-ink hover:bg-butter/50`.

Replace the bottom promo banner: `bg-orange-900` → `bg-rust-ink`; `text-orange-200` → `text-butter/90`; the "Chat Admin Sekarang" button's `text-orange-900 bg-white hover:bg-orange-50` → `text-rust-ink bg-white hover:bg-butter/15`.

- [ ] **Step 2: Restyle `app/toko/[slug]/page.tsx`**

Replace the back link's `text-orange-600 hover:text-orange-800` → `text-terracotta hover:text-rust-ink`.

Replace `border-orange-100` (main image frame) → `border-butter/30`; the "Dipakai di video saya" badge's `text-orange-800` → `text-rust-ink`; thumbnail selected-state `border-orange-500` → `border-terracotta`, unselected hover `hover:border-orange-300` → `hover:border-butter`.

Replace `text-orange-900` (product title, price) → `text-rust-ink`.

Replace the description panel's `bg-orange-50 border-orange-100` → `bg-butter/15 border-butter/30`, and the `prose-orange` typography class → `prose-stone` (Tailwind Typography doesn't ship an "orange" prose theme override for our custom tokens; `prose-stone` reads closest to the new charcoal-brown body text without requiring a custom prose theme — this is a deliberate scope-limited choice, not a placeholder).

Replace both trust-badge icons' `text-orange-600` → `text-terracotta`.

- [ ] **Step 3: Verify**

Run: `npm run dev`, visit `/toko`, then click into any product detail page.

Expected: both pages read in the new palette, product grid corner radius matches Task 8's Produk Pilihan treatment for visual consistency between the two product-grid instances. WhatsApp buy links still work (both list-page banner and detail-page CTA). No marginalia notes present on either page.

- [ ] **Step 4: Commit**

```bash
git add app/toko/page.tsx "app/toko/[slug]/page.tsx"
git commit -m "style(toko): retoken product list and detail pages"
```

---

## Task 13: Kontak — restyle + first-person copy tweak

**Files:**
- Modify: `app/kontak/page.tsx`

- [ ] **Step 1: Restyle header and shift intro copy to first person**

Replace:

```tsx
<h1 className="font-serif text-4xl lg:text-5xl font-bold text-orange-900 mb-6">Hubungi Kami</h1>
<p className="text-lg text-stone-600 max-w-2xl mx-auto">
  Punya pertanyaan seputar resep, ingin konsultasi alat baking, atau butuh bantuan pendaftaran kelas? Jangan ragu untuk menghubungi tim kami.
</p>
```
with:
```tsx
<h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-6">Hubungi Saya</h1>
<p className="text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
  Punya pertanyaan seputar resep, ingin konsultasi alat baking, atau butuh bantuan pendaftaran kelas? Jangan ragu untuk menghubungi saya.
</p>
```

- [ ] **Step 2: Restyle the WhatsApp CTA card and contact info block**

Replace `bg-orange-50 border-orange-100` (outer panel) → `bg-butter/15 border-butter/30`; `text-orange-900` (h2) → `text-rust-ink`. Leave the green WhatsApp button (`bg-green-500 hover:bg-green-600`) unchanged — brand color for the channel, matching Task 10's CourseCard decision. Replace both icon-circle `text-orange-600` → `text-terracotta`; `text-stone-800` (labels) → `text-charcoal-brown`; `text-stone-600 hover:text-orange-600` (email link) → `text-charcoal-brown/70 hover:text-terracotta`; `text-stone-600` (address text) → `text-charcoal-brown/70`.

- [ ] **Step 3: Restyle the contact form**

Replace `bg-white ... shadow-lg border border-stone-100` → keep `bg-white shadow-lg`, replace `border-stone-100` → `border-butter/30`. Replace `text-orange-900` (h2 "Kirim Pesan") → `text-rust-ink`.

Replace all three input/textarea `border-stone-200 ... focus:ring-orange-500 ... bg-stone-50` → `border-butter/40 focus:ring-terracotta bg-butter/5`, and their `text-stone-700` labels → `text-charcoal-brown`.

Replace the submit button's `bg-orange-600 hover:bg-orange-700` → `bg-terracotta hover:bg-rust-ink`. **Do not add an `onClick` handler or change `type="button"`** — wiring the form is explicitly out of scope per the design spec; this task only changes its color classes.

Replace the helper text `text-stone-500` → `text-charcoal-brown/60`.

- [ ] **Step 4: Restyle the FAQ section**

Replace `text-orange-900` (h2) → `text-rust-ink`. Replace each FAQ card's `border-orange-100` → `border-butter/30`, `text-stone-800` → `text-charcoal-brown`, `text-stone-600` → `text-charcoal-brown/70`.

- [ ] **Step 5: Verify**

Run: `npm run dev`, visit `/kontak`.

Expected: page heading now reads "Hubungi Saya" (first person), body copy says "menghubungi saya" instead of "menghubungi tim kami". All non-WhatsApp-green elements use the new tokens. The submit button is still visually a plain button with no wired behavior — confirm this is unchanged (clicking it does nothing), matching the spec's explicit "flagged, not in scope" note.

- [ ] **Step 6: Commit**

```bash
git add app/kontak/page.tsx
git commit -m "style(kontak): retoken page and shift intro copy to first person"
```

---

## Task 14: Final manual QA pass

**Files:** none (verification only)

- [ ] **Step 1: Full-site walkthrough at desktop width**

Run: `npm run dev`. Visit `/`, `/tentang`, `/kursus`, `/resep`, `/toko`, a `/toko/[slug]` detail page, and `/kontak` at a desktop viewport (~1440px). Confirm: no leftover `orange-*`/hardcoded `stone-*` Tailwind classes visible as visually inconsistent patches, no `animate-blob` elements remain anywhere, corner-radius treatment visibly varies between at least 3 distinct component types (e.g. hero photo, product card, course card), and no more than 2 marginalia notes appear in any single page section.

- [ ] **Step 2: Mobile walkthrough**

Resize to ~375px width (or use browser device toolbar) and repeat the same page walkthrough. Confirm: mobile nav menu opens/closes correctly with new styling, marginalia notes that are `hidden sm:block` (Tentang's inline story asides) correctly disappear rather than cramming the layout, all touch targets remain reachable.

- [ ] **Step 3: Keyboard focus check**

Tab through the navbar links, hero CTAs, product/course card links, and the contact form fields on `/kontak`. Confirm every interactive element shows a visible focus outline (this plan didn't remove any existing `focus:ring-*`/`focus:outline-none` handling, but verify tokens didn't accidentally hide it — e.g. Task 13's form inputs still show `focus:ring-terracotta`).

- [ ] **Step 4: `prefers-reduced-motion` check**

In Chrome DevTools, open the Rendering tab, set "Emulate CSS media feature prefers-reduced-motion: reduce", and reload `/`. Confirm the hero's stagger/fade animations and the Framer Motion `whileInView` reveals are still acceptable (Framer Motion respects this automatically via the browser when `motion` components don't override it — this plan did not add any new unconditional motion, so no code change should be needed here; if any section still animates jarringly, note it but do not block on fixing it — out of scope for this pass since no task above introduced new motion).

- [ ] **Step 5: Marginalia legibility check**

On `/`, `/tentang`, and `/resep`, confirm every marginalia note is readable against its background: the photo-anchored notes (Home Keunggulan tiles, Resep cards) use `text-white` with a drop-shadow per Tasks 7 and 11; the paper-anchored notes (Tentang story asides, Testimonial heading, Kursus intro) use the default `text-pencil-blue` against the cream/white backgrounds. If any note is hard to read at a glance, adjust its `className` override (add/remove `drop-shadow`, adjust rotation) directly rather than filing it for later.

- [ ] **Step 6: Report results**

No commit for this task — it's a verification pass. If Steps 1–5 surface any issues, fix them as small follow-up edits in the relevant file from Tasks 1–13 and commit each fix separately with a `fix(<page>): ...` message.

---

## Self-Review Notes

- **Spec coverage:** Color/type/layout tokens → Task 1. Marginalia signature element → Task 2 (primitives) + Tasks 6, 7, 9, 10, 11 (placements named in the spec's per-page plan). Home hero/Keunggulan/Kursus/Produk/Testimonial/Social → Tasks 6–8, 5. Tentang → Task 9. Kursus → Task 10. Resep → Task 11. Toko (list + detail) → Task 12. Kontak → Task 13, including the explicit "flagged, not fixed" non-functional submit button. Shared shell (Navbar/Footer) → Tasks 3–4. Manual testing checklist from the spec's Testing section → Task 14. No spec section is without a corresponding task.
- **Placeholder scan:** no TBD/TODO left in any task; the one borderline case (`prose-orange` → `prose-stone` in Task 12) is explained inline as a deliberate choice, not deferred work.
- **Scope check:** single cohesive visual-layer change across one existing codebase; not decomposed further since every task modifies disjoint files (except `app/page.tsx`, which is intentionally split across Tasks 6–8 by section since it's the largest single file).
- **Type consistency:** `Marginalia` and `SquiggleUnderline` prop signatures defined once in Task 2 and used identically (same prop names: `children`, `className`, `rotate`) in every consuming task.
