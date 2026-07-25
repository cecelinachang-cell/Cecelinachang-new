# Site Search + Chatbot Pairing — Design

## Goal
Add a site-wide search bar (products + courses) and give the Lina chatbot the same search capability, so both surfaces use one source of truth and the chatbot can return clickable result cards instead of only text.

## Scope
- Searchable content: **products** (`/toko`) and **courses** (`/kursus`).
- Explicitly excluded: **recipes** (`/resep`) — that page is a stub today (hardcoded list; `app/resep/[slug]/page.tsx` ignores the `slug` param and always renders the same recipe). Fixing that is a separate, later task.

## 1. Shared search layer

**`lib/search.ts`**
- `searchCatalog(query: string, data: { products: Product[]; courses: Course[] }): SearchResult[]`
- Matches query (case-insensitive, trimmed) against product `name`/`category`/`description` and course `title`/`description`.
- Common result shape:
  ```ts
  type SearchResult = {
    type: 'product' | 'course';
    id: string;
    slug: string;
    title: string;
    price: string | null;
    image: string | null;
    category: string | null;
  };
  ```
- Both the search API route and the chatbot tool call this same function — no duplicated matching logic.

**`app/api/search/route.ts`**
- `GET /api/search?q=...`
- Fetches products from Supabase `items` (fallback to `app/data/products.ts`) and courses from Supabase `courses` (fallback to `app/data/courses.ts`) — same fallback pattern already used in `app/toko/page.tsx` and `lib/chatbot-knowledge.ts`.
- Runs `searchCatalog`, caps results (~20), returns JSON.
- Rate-limited using the existing `lib/rate-limit.ts` helper (same pattern as `/api/chatbot`).

## 2. Search bar UI

- `components/navbar.tsx`: add a search (magnifying glass) icon next to the existing cart icon, in both the desktop row and the mobile row.
- New `components/SearchOverlay.tsx`:
  - Opens on icon click or `Cmd/Ctrl+K`.
  - Centered modal, backdrop blur, closes on `Escape` or backdrop click.
  - Debounced (~300ms) input calls `/api/search`.
  - Results grouped under "Produk" / "Kursus" headers, each rendered as a card (thumbnail, title, price, category badge) linking to `/toko/[slug]` or `/kursus/[slug]`.
  - Empty/no-match state: message + "Tanya Lina" button that opens the chatbot widget with the query pre-filled.
- `components/chatbot-widget.tsx` exposes a small way to be opened programmatically from outside (e.g. a lightweight custom event or shared context), since it's mounted independently in `app/layout.tsx`, so the "Tanya Lina" button can trigger it.

## 3. Chatbot tool integration

- `app/api/chatbot/route.ts`:
  - Add a `tools` array to the DeepSeek request with one function, `search_catalog(query: string)`, plus `tool_choice: 'auto'`.
  - First call: send system prompt + messages + `tools`.
  - If the response includes `tool_calls`: run `searchCatalog()` server-side with the model's query, append a `tool` role message containing the JSON results, and call DeepSeek a second time for the final natural-language reply.
  - Response to client becomes `{ reply: string, results?: SearchResult[] }`.
  - **Fallback**: if tool calls aren't supported by `deepseek-v4-flash` or the tool-call parsing fails, catch it and skip the tool loop — behavior degrades to exactly what exists today (plain text reply using the embedded catalog knowledge from `lib/chatbot-knowledge.ts`). No regression risk.
- `components/chatbot-widget.tsx`:
  - `Message` type gains optional `results?: SearchResult[]`.
  - When present, render small product/course cards under Lina's bubble (same visual style as the search overlay cards), linking to the item's page.

## Testing
- Search bar: verify results for product-name query, course-title query, category query, and no-match query (shows Ask Lina fallback).
- Chatbot: verify a product/course question triggers the tool and renders cards; verify a general question (e.g. shipping) still works via plain knowledge text; verify graceful fallback behavior if tool calling errors.
