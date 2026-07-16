# Cece Lina Chang — UI/UX Warmth Redesign

**Date:** 2026-07-16
**Status:** Approved by user, pending implementation plan
**Scope:** Full site (Home, Tentang, Kursus, Resep, Toko, Kontak, shared Navbar/Footer)

## Problem

The site (Next.js 15 + Tailwind 4, Indonesian-language baking content creator brand) currently reads as a
generic AI-template bakery site rather than a personal creator brand:

- Cream background + orange/terracotta accent + serif display is exactly the AI-default palette
  (`#F4F1EA`-family cream + high-contrast serif + terracotta), applied without further distinction.
- Homepage leads with stat badges ("10.000+ Murid Bergabung") and generic Lucide-icon feature tiles
  instead of Lina's actual voice — even though the About page has a genuinely warm, specific personal
  story (roti sobek keras seperti batu → misi saya) that never surfaces on Home.
- Decorative blurred gradient "blob" shapes behind the hero, uniform `rounded-3xl` on every card,
  and the same `fadeUpVariant`/`staggerContainer` motion applied indiscriminately across every
  section — all template defaults, not choices made for this brand.
- Resep (recipes) page uses `picsum.photos` seeded placeholders, not real dishes.
- Kontak (contact) form's submit button is `type="button"` with no handler — decorative, not wired.
  (Flagged for awareness; wiring it is outside this UI/UX redesign's scope.)
- Only one real photo of Lina exists in the current build (hero + About page share it). User has
  confirmed more real photography will be supplied.

## Goal

Make the site feel warm and personally connected to its owner — a baking content creator, not a
faceless e-commerce/course platform — while keeping the existing Next.js App Router structure,
Tailwind 4, Supabase data layer, and page routes unchanged.

## Design Tokens

### Color

| Token | Hex | Use |
|---|---|---|
| `--cream` | `#FBF6EE` | Page background (warmer/greyer than current `#FFFBF5`) |
| `--terracotta` | `#C4622D` | Primary accent — buttons, links, active states (replaces `orange-600`) |
| `--rust-ink` | `#7A3B1E` | Headings, deep accent (replaces `orange-900`) |
| `--butter` | `#E8B86D` | Secondary accent, sparing use (replaces `yellow-200` blob) |
| `--charcoal-brown` | `#3A2E27` | Body text (replaces `stone-900`/`stone-600`, warmer than neutral grey) |
| `--pencil-blue` | `#34424A` | Handwriting-ink color for marginalia — deliberately *not* brand-colored, since real handwritten notes use whatever pen was on hand |

Rationale: keeps the authentic warm-bakery direction (user's choice) but pulls every value away from
the flat, saturated Tailwind defaults (`orange-600`, `orange-900`, `yellow-200`) toward dirtier,
more handmade-feeling equivalents. `--pencil-blue` exists specifically to make marginalia read as
*real ink on paper*, not as another brand accent.

### Type

| Role | Choice | Use |
|---|---|---|
| Display | Warm humanist serif, high weight + italic (e.g. Fraunces or Lora) | H1/H2 only, restrained — not every heading |
| Body | Plain legible sans (e.g. Inter/system stack) | Paragraphs, nav, buttons, forms — keep current direction |
| Handwriting | Genuine handwriting webfont (e.g. Caveat/Kalam) as placeholder | Marginalia notes, until real scanned handwriting assets arrive |
| Utility | Letter-spaced small-caps sans | Category tags, eyebrows, captions |

Migration note: once Lina's real handwriting is scanned, marginalia notes swap from webfont text to
SVG/PNG traces of her actual writing — no layout change required, same anchor points.

### Layout

Keep the current single-column, section-stacked page scaffold (it works structurally and matches
Next.js App Router conventions already in place). Changes are to decoration and rhythm, not structure:

- Remove blurred gradient "blob" background shapes (`animate-blob` elements in `app/page.tsx`).
- Stop using `rounded-3xl` uniformly on every card/section — vary corner radius so components read as
  distinct types (product card ≠ course panel ≠ testimonial frame) rather than one repeated shape.
- Reduce `motion`/`framer` stagger-fade to one orchestrated moment per page (hero load) plus
  scroll-reveal on the single most important element per section, not every child element.

## Signature Element: Handwritten Marginalia

The one distinctive, memorable device this redesign is built around.

**What it is:** Short handwritten annotations — in `--pencil-blue`, using the handwriting typeface
(later: real scanned handwriting) — placed near photos or claims throughout the site, as if Lina
wrote a note in the margin of her own recipe book. Examples: "roti sobek favoritku!" next to a bread
photo, "psst, ini yang aku pakai tiap hari" near a product, a small heart doodle, her actual signature
replacing the plain-text wordmark.

**Placement rule:** Maximum 1–2 marginalia notes per page section. Always anchored to a specific
image or claim she would plausibly say out loud. Never used as generic decoration or filler — if a
section doesn't have something worth annotating, it gets none.

**Asset dependency:** Ships first with the handwriting webfont as a placeholder (zero-risk, no
blocking dependency). When Lina supplies a photo/scan session of her actual handwriting (8–12 short
notes/words on plain paper, plus her signature), those replace the webfont text as SVG traces at the
same anchor points — a follow-up swap, not a redesign.

**Specific replacements on Home:**
- The "10.000+ Murid Bergabung" star-badge pill → a handwritten aside near the hero photo instead of
  a stock rating pill.
- The `Award`/`PlayCircle`/`Heart` Lucide-icon feature grid → three photo moments each with one
  handwritten annotation, rather than generic icon+heading+paragraph tiles.
- Navbar wordmark "Cece Lina Chang" (plain text) → her scanned signature mark, once available;
  webfont-styled text in the interim.

## Per-Page Plan

### Home (`app/page.tsx`)
- Hero: remove blob shapes; hero photo gets one handwritten marginalia note instead of the star-rating
  pill badge. Headline/subhead copy stays (already on-brand), CTA buttons restyle to new tokens.
- "Keunggulan" feature grid: replace 3 generic icon tiles with 3 photo-moment tiles, each with a
  one-line handwritten annotation tied to something specific and true (not "Resep Teruji" as an
  abstract claim, but e.g. a note next to an actual roti-sobek photo).
- Kursus/Produk sections: restyle cards to new tokens and varied corner radius; structure unchanged.
- Testimonial carousel: restyle frame/controls to new tokens; consider one marginalia note near the
  section heading ("Apa Kata Mereka?" → her own aside about why testimonials matter to her).
- Social section: restyle only.

### Tentang / About (`app/tentang/page.tsx`)
- Highest-leverage page — copy is already personal and specific. Primary changes: add marginalia
  notes in the margins of the personal-story paragraphs, restyle the photo card frame away from
  generic `rounded-[3rem]` glass-card toward something that reads as a kept photograph (e.g. slight
  frame/tape motif), swap in real photos as they arrive.
- Stats (2000+ murid, 50k+ pengikut) restyle to new tokens; consider making one of the two a
  handwritten number instead of a typeset stat, to avoid the page feeling like two competing systems.

### Kursus (`app/kursus/page.tsx`, `components/CourseCard.tsx`)
- Restyle header badge, `CourseCard` components, and FAQ cards to new tokens/corner treatment.
- Add one handwritten aside near the page intro — "kenapa saya bikin kelas ini" — since this page
  currently has zero first-person voice despite being about her teaching.

### Resep (`app/resep/page.tsx`)
- Restyle search/filter/category chips and recipe cards to new tokens.
- Most natural fit for the signature element: each recipe card gets a handwritten tip callout
  (e.g. "kuncinya di suhu oven!") — this is where marginalia is most literally justified, since real
  recipe cards get annotated by hand.
- Note: current recipe images are `picsum.photos` placeholders with fabricated data (no `[slug]`
  detail content reviewed yet in this pass) — real recipe content/photography is a content
  workstream, not part of this visual redesign.

### Toko (`app/toko/page.tsx`, `[slug]`)
- Restyle only — product grid needs to stay scannable/e-commerce-standard. No structural change,
  no marginalia (a shop listing isn't the place for it; keep that device for editorial content).

### Kontak (`app/kontak/page.tsx`)
- Restyle WhatsApp CTA, contact cards, and form to new tokens.
- Add her voice to the intro copy (currently generic "tim kami" — could shift to first person given
  the rest of the site is personal-brand, but this is a copy call, not required by the visual system).
- Flagged, not in scope: submit button has no handler (`type="button"`, no `onClick`/form action).

### Shared shell (Navbar, Footer)
- Navbar: wordmark → handwriting/signature treatment; replace the flat `border-b-2` active-link
  indicator with a short hand-drawn underline stroke (SVG squiggle in `--terracotta`), consistent
  with the marginalia motif instead of a generic tab underline.
- Footer: restyle to new tokens; no structural change.

## Out of scope

- Backend/data wiring (Supabase queries, contact form submission, cart/checkout flow).
- New content creation (real recipe copy, product descriptions) beyond what's needed to demonstrate
  the design system.
- Any new pages or routes.

## Testing

Visual/UX change with no new business logic — verification is manual: run `npm run dev`, walk each
page listed above at mobile and desktop widths, confirm keyboard focus is visible on all interactive
elements, confirm `prefers-reduced-motion` is respected for the reduced motion set, confirm marginalia
notes render legibly against photo backgrounds (contrast check) before considering the pass complete.
