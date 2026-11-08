/**
 * Ad tags (utm_* and Meta's fbclid) for the whole visit, not just the page the
 * ad opened. A buyer who goes landing page → course page → Lynk still pays as
 * "meta", and the Lynk webhook gets the Meta click ID (fbc) so the server-side
 * Purchase can be matched to the ad click.
 *
 * Kept in localStorage for 7 days (Meta's default click window). Storage can
 * be blocked (private mode, in-app browsers); then only the current URL counts.
 */
const KEY = 'clc_ad_tags';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

interface Stored {
  q: string;
  at: number;
}

/** Meta's click ID format: fb.1.<first-seen time in ms>.<fbclid>. */
export function fbcFor(fbclid: string, clickedAtMs: number): string {
  return `fb.1.${clickedAtMs}.${fbclid}`;
}

function pickAdParams(search: string): URLSearchParams {
  const out = new URLSearchParams();
  for (const [k, v] of new URLSearchParams(search)) {
    if (v && (k.startsWith('utm_') || k === 'fbclid')) out.set(k, v);
  }
  return out;
}

function hasAdTags(p: URLSearchParams): boolean {
  return Boolean(p.get('utm_source') || p.get('fbclid'));
}

function readStored(store: Storage | undefined, now: number): Stored | null {
  try {
    const raw = store?.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Stored>;
    if (typeof parsed.q !== 'string' || typeof parsed.at !== 'number') return null;
    if (now - parsed.at > TTL_MS) return null;
    return { q: parsed.q, at: parsed.at };
  } catch {
    return null;
  }
}

/** Saves the current URL's ad tags, if it has any. Never throws. */
export function rememberAdTags(search: string, store: Storage | undefined, now = Date.now()): void {
  const tags = pickAdParams(search);
  if (!hasAdTags(tags)) return;
  const prev = readStored(store, now);
  const sameClick = prev && tags.get('fbclid') && new URLSearchParams(prev.q).get('fbclid') === tags.get('fbclid');
  const record: Stored = { q: tags.toString(), at: sameClick ? prev.at : now };
  try {
    store?.setItem(KEY, JSON.stringify(record));
  } catch {
    // Storage blocked: the current page still passes its own tags.
  }
}

/**
 * The ad tags to send to checkout, as a query string: the current URL's tags
 * if it has any, else the ones remembered from earlier in the visit. Adds
 * `fbc` when an fbclid is known. Empty string for non-ad visitors.
 */
export function adSearch(search: string, store: Storage | undefined, now = Date.now()): string {
  const current = pickAdParams(search);
  const stored = readStored(store, now);
  let tags: URLSearchParams;
  let clickedAt = now;
  if (hasAdTags(current)) {
    tags = current;
    const storedFbclid = stored && new URLSearchParams(stored.q).get('fbclid');
    if (stored && storedFbclid && storedFbclid === current.get('fbclid')) clickedAt = stored.at;
  } else if (stored) {
    tags = new URLSearchParams(stored.q);
    clickedAt = stored.at;
  } else {
    return '';
  }
  const fbclid = tags.get('fbclid');
  if (fbclid) tags.set('fbc', fbcFor(fbclid, clickedAt));
  return `?${tags}`;
}
