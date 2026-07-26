# Site Search + Chatbot Pairing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a mobile-first site search (products + courses) reachable from the navbar, and give the Lina chatbot the same search capability via a tool call, so both surfaces share one matching function and the chatbot can return clickable result cards.

**Architecture:** A new `lib/search.ts` owns catalog fetching (`getCatalogData`, mirroring the fallback pattern already used in `app/toko/page.tsx` and `lib/chatbot-knowledge.ts`) and matching (`searchCatalog`). A new `GET /api/search` route wraps it for the UI. A new `components/SearchOverlay.tsx`, mounted once in `app/layout.tsx`, is a full-screen mobile takeover (progressively enhanced to a centered modal on desktop) opened via a `toko:open-search` `window` event dispatched from a new navbar icon, or `Cmd/Ctrl+K`. `app/api/chatbot/route.ts` gains a `search_catalog` tool so DeepSeek can call `searchCatalog` mid-conversation and return `results` alongside `reply`; `components/chatbot-widget.tsx` renders those as cards and listens for a `toko:open-chatbot` event (dispatched by the search overlay's "Tanya Lina" fallback) to open itself and send the query.

**Tech Stack:** Next.js App Router, React (client components), Tailwind CSS, `lucide-react` icons, `use-debounce` (already a dependency) for the search input, DeepSeek chat-completions API (OpenAI-compatible tool calling). No test runner is configured in this repo (`package.json` has no `test` script) — verification is `npm run lint` plus manual checks against the local dev server (`npm run dev`), following the convention in `docs/superpowers/plans/2026-07-22-toko-page-polish.md`.

## Global Constraints

- Searchable content is **products** (`app/toko`) and **courses** (`app/kursus`) only. Recipes (`app/resep`) are explicitly out of scope (spec: `docs/superpowers/specs/2026-07-25-site-search-chatbot-design.md`).
- Mobile-first: the search overlay's default (unprefixed Tailwind classes) layout is the full-screen mobile takeover; the centered-modal treatment is added only behind `md:` prefixes.
- Color tokens already used throughout the codebase: `rust-ink`, `terracotta`, `butter`, `charcoal-brown`, `cream` — do not introduce new colors.
- Product route slug = the product's `id` field (confirmed in `app/toko/[slug]/page.tsx`, which queries `.eq('id', slug)`). Course route slug = the course's dedicated `slug` field (confirmed in `app/kursus/[slug]/page.tsx`, which queries `.eq('slug', slug)`).
- WhatsApp number and chatbot tone/copy conventions are unaffected by this plan — do not touch `lib/chatbot-knowledge.ts`'s `supportFacts` or system-prompt wording beyond what Task 5 specifies.
- Rate-limit new public endpoints using the existing `lib/rate-limit.ts` (`getClientIp`, `isRateLimited`), same pattern as `app/api/chatbot/route.ts`.

---

### Task 1: Shared search data layer (`lib/search.ts`)

**Files:**
- Create: `lib/search.ts`

**Interfaces:**
- Produces: `export type SearchResult = { type: 'product' | 'course'; id: string; slug: string; title: string; price: string | null; image: string | null; category: string | null }`, `export async function getCatalogData(): Promise<{ products: CatalogProduct[]; courses: CatalogCourse[] }>`, `export function searchCatalog(query: string, data: { products: CatalogProduct[]; courses: CatalogCourse[] }): SearchResult[]`. Tasks 2 and 5 import all three.

- [ ] **Step 1: Write `lib/search.ts`**

```ts
import { products as fallbackProducts } from '@/app/data/products';
import { courses as fallbackCourses } from '@/app/data/courses';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type SearchResult = {
  type: 'product' | 'course';
  id: string;
  slug: string;
  title: string;
  price: string | null;
  image: string | null;
  category: string | null;
};

export type CatalogProduct = {
  id: string;
  name: string;
  price?: string | null;
  category?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

export type CatalogCourse = {
  id: string;
  slug: string;
  title: string;
  price?: string | null;
  description?: string | null;
  imageUrl?: string | null;
};

function firstImage(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  try {
    const parsed = JSON.parse(imageUrl);
    if (Array.isArray(parsed) && parsed.length) return parsed[0];
  } catch {
    // Not a JSON array — treat the raw string as the image URL.
  }
  return imageUrl;
}

export async function getCatalogData(): Promise<{ products: CatalogProduct[]; courses: CatalogCourse[] }> {
  if (!isSupabaseConfigured()) {
    return { products: fallbackProducts, courses: fallbackCourses };
  }

  try {
    const [{ data: products, error: productsError }, { data: courses, error: coursesError }] = await Promise.all([
      supabase.from('items').select('id, name, price, category, description, imageUrl'),
      supabase.from('courses').select('id, slug, title, price, description, imageUrl'),
    ]);

    return {
      products: !productsError && products?.length ? (products as CatalogProduct[]) : fallbackProducts,
      courses: !coursesError && courses?.length ? (courses as CatalogCourse[]) : fallbackCourses,
    };
  } catch {
    return { products: fallbackProducts, courses: fallbackCourses };
  }
}

export function searchCatalog(
  query: string,
  data: { products: CatalogProduct[]; courses: CatalogCourse[] },
): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const productMatches: SearchResult[] = data.products
    .filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q),
    )
    .map((p) => ({
      type: 'product' as const,
      id: p.id,
      slug: p.id,
      title: p.name,
      price: p.price ?? null,
      image: firstImage(p.imageUrl),
      category: p.category ?? null,
    }));

  const courseMatches: SearchResult[] = data.courses
    .filter((c) =>
      c.title?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q),
    )
    .map((c) => ({
      type: 'course' as const,
      id: c.id,
      slug: c.slug,
      title: c.title,
      price: c.price ?? null,
      image: firstImage(c.imageUrl),
      category: null,
    }));

  return [...productMatches, ...courseMatches];
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `lib/search.ts`.

- [ ] **Step 3: Commit**

```bash
git add lib/search.ts
git commit -m "feat(search): add shared catalog search layer"
```

---

### Task 2: Search API route (`GET /api/search`)

**Files:**
- Create: `app/api/search/route.ts`

**Interfaces:**
- Consumes: `getCatalogData()`, `searchCatalog()` from `lib/search.ts` (Task 1); `getClientIp()`, `isRateLimited()` from `lib/rate-limit.ts`.
- Produces: `GET /api/search?q=<query>` returning `{ results: SearchResult[] }` on success or `{ error: string }` with a 429 status when rate-limited. Task 3 (`SearchOverlay`) fetches this endpoint.

- [ ] **Step 1: Write `app/api/search/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { getCatalogData, searchCatalog } from '@/lib/search';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  if (isRateLimited(`search:${getClientIp(request)}`, 30, 60_000)) {
    return NextResponse.json({ error: 'Terlalu banyak pencarian. Coba lagi sebentar lagi ya.' }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') || '').slice(0, 200);

  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }

  const catalog = await getCatalogData();
  const results = searchCatalog(query, catalog).slice(0, 20);

  return NextResponse.json({ results });
}
```

- [ ] **Step 2: Run dev server and verify manually**

Run: `npm run dev`
Then in another terminal:
```bash
curl -s 'http://localhost:3000/api/search?q=mixer'
curl -s 'http://localhost:3000/api/search?q=bakso'
curl -s 'http://localhost:3000/api/search?q=xyznonexistent'
curl -s 'http://localhost:3000/api/search'
```
Expected: first call returns a `results` array containing the "Signora Mixer La Spezia" product (from `app/data/products.ts`, since Supabase is likely unconfigured locally); second call returns the "Kelas Bakso Sapi Premium" course; third call returns `{"results":[]}`; fourth call (no `q`) returns `{"results":[]}` without erroring.

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors in `app/api/search/route.ts`.

- [ ] **Step 4: Commit**

```bash
git add app/api/search/route.ts
git commit -m "feat(search): add /api/search endpoint"
```

---

### Task 3: Mobile-first `SearchOverlay` component

**Files:**
- Create: `components/SearchOverlay.tsx`

**Interfaces:**
- Consumes: `SearchResult` type from `lib/search.ts` (Task 1); fetches `GET /api/search` (Task 2).
- Produces: `export function SearchOverlay()` — a component with no props, mounted once, that listens for a `window` `CustomEvent('toko:open-search')` to open itself and dispatches `CustomEvent('toko:open-chatbot', { detail: { query } })` when the user taps "Tanya Lina" on a no-results state. Task 4 dispatches `toko:open-search`; Task 6 listens for `toko:open-chatbot`. Mounted in `app/layout.tsx` (Task 4).

- [ ] **Step 1: Write `components/SearchOverlay.tsx`**

```tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { MessageCircle, Package, Search, X } from 'lucide-react';
import type { SearchResult } from '@/lib/search';

export function SearchOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function openOverlay() {
      setIsOpen(true);
    }
    window.addEventListener('toko:open-search', openOverlay);
    return () => window.removeEventListener('toko:open-search', openOverlay);
  }, []);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    } else {
      setQuery('');
      setResults([]);
      setStatus('idle');
    }
  }, [isOpen]);

  const runSearch = useDebouncedCallback(async (value: string) => {
    if (!value.trim()) {
      setResults([]);
      setStatus('idle');
      return;
    }
    setStatus('loading');
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
      const data = await response.json();
      setResults(Array.isArray(data.results) ? data.results : []);
    } catch {
      setResults([]);
    } finally {
      setStatus('done');
    }
  }, 300);

  function handleChange(value: string) {
    setQuery(value);
    runSearch(value);
  }

  function askLina() {
    const trimmed = query.trim();
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('toko:open-chatbot', { detail: { query: trimmed } }));
  }

  if (!isOpen) return null;

  const products = results.filter((r) => r.type === 'product');
  const courses = results.filter((r) => r.type === 'course');
  const hasSearched = status === 'done' && query.trim().length > 0;
  const noResults = hasSearched && results.length === 0;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col bg-cream md:items-start md:justify-center md:bg-charcoal-brown/40 md:backdrop-blur-sm">
      <div className="flex h-full w-full flex-col overflow-hidden bg-cream md:mx-auto md:mt-20 md:h-auto md:max-h-[70vh] md:w-full md:max-w-xl md:rounded-3xl md:shadow-2xl">
        <div className="flex items-center gap-3 border-b border-butter/40 px-4 py-4">
          <Search className="h-5 w-5 shrink-0 text-charcoal-brown/50" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => handleChange(event.target.value)}
            placeholder="Cari produk atau kelas…"
            className="min-w-0 flex-1 bg-transparent text-base text-charcoal-brown outline-none placeholder:text-charcoal-brown/40"
          />
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Tutup pencarian"
            className="shrink-0 rounded-full p-2 text-charcoal-brown/60 hover:bg-butter/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {status === 'loading' && (
            <p className="py-8 text-center text-sm text-charcoal-brown/50">Mencari…</p>
          )}

          {!query.trim() && status !== 'loading' && (
            <p className="py-8 text-center text-sm text-charcoal-brown/50">
              Ketik nama produk atau kelas yang kamu cari.
            </p>
          )}

          {products.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-brown/50">Produk</h2>
              <div className="flex flex-col gap-2">
                {products.map((item) => (
                  <SearchResultRow key={`product-${item.id}`} item={item} onNavigate={() => setIsOpen(false)} />
                ))}
              </div>
            </div>
          )}

          {courses.length > 0 && (
            <div className="mb-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-brown/50">Kursus</h2>
              <div className="flex flex-col gap-2">
                {courses.map((item) => (
                  <SearchResultRow key={`course-${item.id}`} item={item} onNavigate={() => setIsOpen(false)} />
                ))}
              </div>
            </div>
          )}

          {noResults && (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <p className="text-sm text-charcoal-brown/60">
                Belum ketemu produk atau kelas untuk &quot;{query}&quot;.
              </p>
              <button
                type="button"
                onClick={askLina}
                className="inline-flex items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-semibold text-white hover:bg-rust-ink"
              >
                <MessageCircle className="h-4 w-4" /> Tanya Lina
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SearchResultRow({ item, onNavigate }: { item: SearchResult; onNavigate: () => void }) {
  const href = item.type === 'product' ? `/toko/${item.slug}` : `/kursus/${item.slug}`;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-butter/30 bg-white px-3 py-2 active:bg-butter/10"
    >
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {item.image ? (
          <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-stone-400">
            <Package className="h-5 w-5" />
          </span>
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium text-charcoal-brown">{item.title}</span>
        <span className="block text-sm text-terracotta">{item.price ?? 'Hubungi admin'}</span>
      </span>
    </Link>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/SearchOverlay.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/SearchOverlay.tsx
git commit -m "feat(search): add mobile-first SearchOverlay component"
```

---

### Task 4: Wire `SearchOverlay` into the navbar and layout

**Files:**
- Modify: `components/navbar.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `SearchOverlay` from Task 3; dispatches `window.dispatchEvent(new Event('toko:open-search'))`, which Task 3's `SearchOverlay` listens for.

- [ ] **Step 1: Add the search icon to `components/navbar.tsx`**

Update the import line:

```tsx
import { Menu, X, ShoppingBag, Search } from 'lucide-react';
```

In the desktop menu block, add a search button right after the existing cart `Link`:

```tsx
            <Link href="/toko" className="text-rust-ink hover:text-terracotta">
              <ShoppingBag className="w-6 h-6" />
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('toko:open-search'))}
              aria-label="Cari produk atau kelas"
              className="text-rust-ink hover:text-terracotta"
            >
              <Search className="w-6 h-6" />
            </button>
          </div>
```

In the mobile menu-button block, add a search button right after the existing mobile cart `Link`, with extra padding so its tap target is comfortably thumb-sized:

```tsx
          <div className="flex items-center md:hidden">
            <Link href="/toko" className="text-rust-ink hover:text-terracotta mr-4">
              <ShoppingBag className="w-6 h-6" />
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('toko:open-search'))}
              aria-label="Cari produk atau kelas"
              className="text-rust-ink hover:text-terracotta mr-2 -m-2 p-2"
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-rust-ink hover:bg-butter/20 focus:outline-none"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
```

- [ ] **Step 2: Mount `SearchOverlay` in `app/layout.tsx`**

Add the import:

```tsx
import { SearchOverlay } from '@/components/SearchOverlay';
```

Render it alongside `ChatbotWidget`:

```tsx
          <Footer />
          <ChatbotWidget />
          <SearchOverlay />
        </AuthProvider>
```

- [ ] **Step 3: Run dev server and verify manually**

Run: `npm run dev` and open `http://localhost:3000/` in a mobile-width browser viewport (e.g. Chrome DevTools device toolbar, 390×844).
Verify: the navbar shows a search icon next to the cart icon in both the mobile header row and (at desktop width) the desktop nav row; tapping it opens a full-screen search takeover with the input focused and visible above where an on-screen keyboard would sit; typing "mixer" shows a "Produk" section with the mixer result; typing something with no match shows the "Tanya Lina" button; pressing Escape or the X button closes it. At desktop width (≥768px), reopen it and confirm it now renders as a centered modal with a backdrop instead of full-screen; confirm `Cmd/Ctrl+K` also opens it.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors in `components/navbar.tsx` or `app/layout.tsx`.

- [ ] **Step 5: Commit**

```bash
git add components/navbar.tsx app/layout.tsx
git commit -m "feat(search): wire SearchOverlay into navbar and layout"
```

---

### Task 5: Chatbot `search_catalog` tool

**Files:**
- Modify: `app/api/chatbot/route.ts`

**Interfaces:**
- Consumes: `getCatalogData()`, `searchCatalog()`, `SearchResult` from `lib/search.ts` (Task 1).
- Produces: `POST /api/chatbot` response shape becomes `{ reply: string, results?: SearchResult[] }` (previously `{ reply: string }`). Task 6 (`chatbot-widget.tsx`) reads the new `results` field.

- [ ] **Step 1: Replace `app/api/chatbot/route.ts` with the tool-calling version**

```ts
import { NextResponse } from 'next/server';
import { getSiteKnowledge } from '@/lib/chatbot-knowledge';
import { getCatalogData, searchCatalog, type SearchResult } from '@/lib/search';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1200;

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && message.content.trim().length > 0;
}

const searchTool = {
  type: 'function' as const,
  function: {
    name: 'search_catalog',
    description: 'Cari produk alat baking atau kelas kursus di situs berdasarkan kata kunci (nama, kategori, atau topik).',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Kata kunci pencarian, misalnya nama produk atau topik kelas.' },
      },
      required: ['query'],
    },
  },
};

async function callDeepSeek(messages: unknown[], includeTools: boolean) {
  return fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages,
      temperature: 0.3,
      max_tokens: 500,
      stream: false,
      ...(includeTools ? { tools: [searchTool], tool_choice: 'auto' } : {}),
    }),
  });
}

export async function POST(request: Request) {
  if (isRateLimited(`chatbot:${getClientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Terlalu banyak pesan. Coba lagi sebentar lagi ya.' }, { status: 429 });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: 'Layanan chat belum dikonfigurasi.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const rawMessages: unknown[] = Array.isArray(body.messages) ? body.messages : [];
    const messages = rawMessages
      .filter(isValidMessage)
      .slice(-MAX_MESSAGES)
      .map((message) => ({ role: message.role, content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH) }));

    if (!messages.length || !messages.some((message) => message.role === 'user')) {
      return NextResponse.json({ error: 'Pesan tidak valid.' }, { status: 400 });
    }

    const pagePath = typeof body.pagePath === 'string' ? body.pagePath.slice(0, 200) : 'tidak diketahui';
    const knowledge = await getSiteKnowledge();
    const systemPrompt = `
Anda adalah Lina, sahabat dapur virtual dari Cece Lina Chang. Jawab dalam bahasa Indonesia yang hangat, lembut, dan akrab seperti Cece sedang membantu pengunjung di dapurnya sendiri. Gunakan sapaan natural seperti "Hai", "boleh banget", "tenang ya", atau "senang bisa bantu", tetapi tetap ringkas dan jangan berlebihan memakai emoji (maksimal satu emoji jika cocok).

Gunakan HANYA informasi situs di bawah untuk fakta tentang bisnis, kursus, produk, harga, pengiriman, dan kontak. Jika informasi tidak tersedia atau pertanyaan membutuhkan konfirmasi (stok, pembayaran, status pesanan, akses kelas, keluhan, perubahan harga), katakan dengan jujur bahwa admin WhatsApp perlu mengonfirmasi. Jangan membuat janji, kebijakan, diskon, atau detail pribadi.

Jika pengunjung menanyakan produk atau kelas tertentu, gunakan tool search_catalog untuk mencarikan hasil yang relevan sebelum menjawab.

Jika pengguna ingin membeli, mendaftar, meminta tindak lanjut, atau masalahnya tidak dapat Anda selesaikan, ajak mereka menggunakan tombol WhatsApp atau formulir "Minta dihubungi". Jangan meminta data sensitif seperti kata sandi, nomor kartu, OTP, atau alamat lengkap di chat.

Halaman yang sedang dilihat pengunjung: ${pagePath}

PENGETAHUAN SITUS:
${knowledge}`;

    const conversation: unknown[] = [{ role: 'system', content: systemPrompt }, ...messages];

    let response = await callDeepSeek(conversation, true);
    if (!response.ok) {
      console.error('DeepSeek chat error:', response.status, await response.text());
      return NextResponse.json({ error: 'Maaf, chat sedang tidak tersedia. Silakan hubungi admin WhatsApp.' }, { status: 502 });
    }

    let result = await response.json();
    let assistantMessage = result?.choices?.[0]?.message;
    let results: SearchResult[] | undefined;

    const toolCall = assistantMessage?.tool_calls?.[0];
    if (toolCall?.function?.name === 'search_catalog') {
      let query = '';
      try {
        query = JSON.parse(toolCall.function.arguments || '{}').query || '';
      } catch {
        query = '';
      }

      const catalog = await getCatalogData();
      results = searchCatalog(query, catalog).slice(0, 6);

      conversation.push(assistantMessage);
      conversation.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(results),
      });

      response = await callDeepSeek(conversation, false);
      if (!response.ok) {
        console.error('DeepSeek follow-up error:', response.status, await response.text());
        return NextResponse.json({ error: 'Maaf, chat sedang tidak tersedia. Silakan hubungi admin WhatsApp.' }, { status: 502 });
      }
      result = await response.json();
      assistantMessage = result?.choices?.[0]?.message;
    }

    const reply = assistantMessage?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return NextResponse.json({ error: 'Maaf, saya belum bisa menjawab saat ini.' }, { status: 502 });
    }

    return NextResponse.json({ reply: reply.trim(), ...(results?.length ? { results } : {}) });
  } catch (error) {
    console.error('Chatbot request error:', error);
    return NextResponse.json({ error: 'Maaf, terjadi kendala pada chat. Silakan coba lagi atau hubungi admin WhatsApp.' }, { status: 500 });
  }
}
```

Note: if `deepseek-v4-flash` doesn't support tool calls, `assistantMessage.tool_calls` will simply be `undefined` and the `if (toolCall?.function?.name === 'search_catalog')` block is skipped — the route falls through to returning `reply` exactly as it did before this change. No separate fallback code path is needed.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `app/api/chatbot/route.ts`.

- [ ] **Step 3: Run dev server and verify manually**

Run: `npm run dev` (requires `DEEPSEEK_API_KEY` set in the environment; if it's not set locally, skip this step's live check and note it in the task handoff — the route still typechecks and the 503 "belum dikonfigurasi" path is unchanged).
```bash
curl -s -X POST http://localhost:3000/api/chatbot \
  -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"ada mixer apa saja?"}],"pagePath":"/"}'
```
Expected: JSON with a `reply` string; if the model invoked `search_catalog`, a `results` array containing product entries (e.g. "Signora Mixer La Spezia") is also present.

- [ ] **Step 4: Lint**

Run: `npm run lint`
Expected: no errors in `app/api/chatbot/route.ts`.

- [ ] **Step 5: Commit**

```bash
git add app/api/chatbot/route.ts
git commit -m "feat(chatbot): add search_catalog tool to Lina"
```

---

### Task 6: Render result cards in `ChatbotWidget` and handle `toko:open-chatbot`

**Files:**
- Modify: `components/chatbot-widget.tsx`

**Interfaces:**
- Consumes: `SearchResult` type from `lib/search.ts` (Task 1); reads the `results` field from `POST /api/chatbot` responses (Task 5); listens for `CustomEvent('toko:open-chatbot', { detail: { query } })` dispatched by `components/SearchOverlay.tsx` (Task 3).

- [ ] **Step 1: Add the `SearchResult` import and extend the `Message` type**

Change:
```tsx
type Message = { role: 'user' | 'assistant'; content: string };
```
to:
```tsx
import type { SearchResult } from '@/lib/search';

type Message = { role: 'user' | 'assistant'; content: string; results?: SearchResult[] };
```
(Add the `import type` line near the top with the other imports, keep the `type Message` declaration where it is.)

- [ ] **Step 2: Capture `results` from the API response in `sendMessage`**

Change:
```tsx
      const data = await response.json();
      const reply = response.ok && data.reply
        ? data.reply
        : data.error || 'Aduh, chat sedang istirahat sebentar. Kamu bisa lanjut cerita ke admin lewat WhatsApp, ya.';
      setMessages((current) => [...current, { role: 'assistant', content: reply }]);
```
to:
```tsx
      const data = await response.json();
      const reply = response.ok && data.reply
        ? data.reply
        : data.error || 'Aduh, chat sedang istirahat sebentar. Kamu bisa lanjut cerita ke admin lewat WhatsApp, ya.';
      const results: SearchResult[] | undefined = response.ok && Array.isArray(data.results) ? data.results : undefined;
      setMessages((current) => [...current, { role: 'assistant', content: reply, results }]);
```

- [ ] **Step 3: Listen for `toko:open-chatbot`**

Add this `useEffect` next to the other `useEffect` hooks in `ChatbotWidget` (after the one that focuses the input on open):

```tsx
  useEffect(() => {
    function handleOpenChatbot(event: Event) {
      const detail = (event as CustomEvent<{ query?: string }>).detail;
      setIsOpen(true);
      if (detail?.query) sendMessage(detail.query);
    }
    window.addEventListener('toko:open-chatbot', handleOpenChatbot);
    return () => window.removeEventListener('toko:open-chatbot', handleOpenChatbot);
  });
```

(No dependency array — `sendMessage` isn't memoized, so this re-subscribes every render to always close over the latest `messages`/`isSending` state; the add/remove cost is negligible for a chat widget.)

- [ ] **Step 4: Render result cards under assistant bubbles**

Change:
```tsx
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`animate-chat-bubble-in flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <span className="mt-1"><LinaAvatar size="sm" /></span>}
                <p className={`max-w-[82%] whitespace-pre-wrap rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-md bg-terracotta text-white shadow-[0_6px_16px_rgba(196,98,45,0.18)]' : 'rounded-bl-md border border-butter/20 bg-white text-charcoal-brown shadow-[0_5px_14px_rgba(88,58,36,0.1)]'}`}>{message.content}</p>
              </div>
            ))}
```
to:
```tsx
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`animate-chat-bubble-in flex gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' && <span className="mt-1"><LinaAvatar size="sm" /></span>}
                <div className="flex max-w-[82%] flex-col gap-2">
                  <p className={`whitespace-pre-wrap rounded-[1.35rem] px-4 py-3 text-sm leading-relaxed ${message.role === 'user' ? 'rounded-br-md bg-terracotta text-white shadow-[0_6px_16px_rgba(196,98,45,0.18)]' : 'rounded-bl-md border border-butter/20 bg-white text-charcoal-brown shadow-[0_5px_14px_rgba(88,58,36,0.1)]'}`}>{message.content}</p>
                  {message.results && message.results.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {message.results.slice(0, 4).map((item) => (
                        <Link
                          key={`${item.type}-${item.id}`}
                          href={item.type === 'product' ? `/toko/${item.slug}` : `/kursus/${item.slug}`}
                          className="flex items-center gap-2 rounded-xl border border-butter/30 bg-white px-2.5 py-2 shadow-sm hover:border-terracotta/40"
                        >
                          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                            {item.image && (
                              <Image src={item.image} alt={item.title} fill sizes="40px" className="object-cover" referrerPolicy="no-referrer" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-charcoal-brown">{item.title}</span>
                            <span className="block text-xs text-terracotta">{item.price ?? 'Hubungi admin'}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
```

Add `Link` to the existing `next/link`... actually `next/link` isn't currently imported in this file — add it:
```tsx
import Link from 'next/link';
```
next to the existing `import Image from 'next/image';` line.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/chatbot-widget.tsx`.

- [ ] **Step 6: Run dev server and verify manually**

Run: `npm run dev` if not already running. Open `http://localhost:3000/` at mobile width, open the search overlay, search for something with no matches, tap "Tanya Lina" — confirm the chatbot widget opens and the query is sent as the first user message. If `DEEPSEEK_API_KEY` is configured, ask Lina "ada mixer apa saja?" directly in the chat and confirm a reply appears with product cards underneath linking to `/toko/mixer-la-spezia`.

- [ ] **Step 7: Lint**

Run: `npm run lint`
Expected: no errors in `components/chatbot-widget.tsx`.

- [ ] **Step 8: Commit**

```bash
git add components/chatbot-widget.tsx
git commit -m "feat(chatbot): render search result cards and handle open-chatbot event"
```
