import { trimAtWord } from '@/lib/courseSeo';
import { stripHtml } from '@/lib/utils';

const BRAND_SUFFIX = ' | Cece Lina Chang';
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

// The buying facts the site already states on /toko/oven and in POLICIES:
// official 1-year warranty, shipped anywhere in Indonesia. They go last so the
// product's own words lead the snippet.
const DESCRIPTION_TAIL = 'Garansi resmi 1 tahun, kirim ke seluruh Indonesia.';

type ProductLike = { name: string; description?: string };

/**
 * People search "harga <product>" and "<product> spesifikasi", so the title
 * carries those words when they fit in Google's ~60 characters, and falls
 * back to shorter forms for long product names.
 */
export function productSeoTitle(product: ProductLike): string {
  const name = product.name.trim();
  const candidates = [`${name}: Harga & Spesifikasi`, `Harga ${name}`];
  const fit = candidates.find((title) => title.length + BRAND_SUFFIX.length <= TITLE_MAX);
  return `${fit ?? name}${BRAND_SUFFIX}`;
}

/** The product's own description cut at a whole word, then warranty and shipping. */
export function productSeoDescription(product: ProductLike): string {
  // stripHtml leaves a space where each tag was, so "<b>besi</b>." reads "besi ."
  const body = stripHtml(product.description || '')
    .replace(/\s+/g, ' ')
    .replace(/ ([.,!?;:])/g, '$1')
    .trim();
  const name = product.name.trim();
  // Sibling products often share catalog copy word for word (six Signora
  // loyang start identically), so the snippet leads with the name unless the
  // copy already says which product it is.
  const model = name.replace(/^signora\s+/i, '').toLowerCase();
  const lead = !body
    ? `${name} dari toko Cece Lina Chang di Tangerang.`
    : body.toLowerCase().includes(model)
      ? body
      : `${name}: ${body}`;
  // One space before the tail, and room for a closing period.
  const room = DESCRIPTION_MAX - DESCRIPTION_TAIL.length - 2;
  const trimmed = lead.length <= room ? lead : lastSentence(lead, room) ?? trimAtWord(lead, room);
  const sentence = /[.!?…]$/.test(trimmed) ? trimmed : `${trimmed}.`;
  return `${sentence} ${DESCRIPTION_TAIL}`;
}

/** The longest run of whole sentences that fits, if that keeps at least half the room. */
function lastSentence(text: string, room: number): string | null {
  const head = text.slice(0, room);
  const end = Math.max(head.lastIndexOf('. '), head.lastIndexOf('! '), head.lastIndexOf('? '));
  return end >= room / 2 ? head.slice(0, end + 1) : null;
}
