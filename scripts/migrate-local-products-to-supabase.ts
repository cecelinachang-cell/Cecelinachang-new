// One-off migration: pushes the scraped Signora catalog in
// app/data/products.ts (with images checked into public/images/products/)
// into the Supabase `items` table + `admin-media` storage bucket, so the
// live /toko page (which reads from Supabase, not the local fallback data)
// actually shows them. Uses the service-role key (server-side only,
// bypasses RLS) so it must be run locally with
// `npx tsx scripts/migrate-local-products-to-supabase.ts`, never shipped
// to the client. Safe to re-run: skips products that already have a
// matching `name` row in `items`.
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { products } from '../app/data/products';

config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

const supabase = createClient(url, serviceKey);

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function parseImageUrls(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return [raw];
  }
}

async function uploadLocalImage(rowId: string, localRelPath: string): Promise<string | null> {
  const absPath = path.join(process.cwd(), 'public', localRelPath);
  if (!fs.existsSync(absPath)) {
    console.warn(`  missing file, skipping: ${absPath}`);
    return null;
  }
  const buffer = fs.readFileSync(absPath);
  const ext = path.extname(absPath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || 'application/octet-stream';
  const storagePath = `items/${rowId}/${path.basename(absPath)}`;

  const { error } = await supabase.storage.from('admin-media').upload(storagePath, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('admin-media').getPublicUrl(storagePath);
  return data.publicUrl;
}

async function main() {
  for (const product of products) {
    const { data: existing, error: lookupErr } = await supabase
      .from('items')
      .select('id')
      .eq('name', product.name)
      .maybeSingle();
    if (lookupErr) throw lookupErr;

    if (existing) {
      console.log(`[skip] "${product.name}" already exists (id ${existing.id})`);
      continue;
    }

    const localPaths = parseImageUrls(product.imageUrl);
    console.log(`[insert] "${product.name}" (${localPaths.length} images)...`);

    const { data: inserted, error: insertErr } = await supabase
      .from('items')
      .insert({
        name: product.name,
        description: product.description || null,
        price: product.price,
        category: product.category,
        imageUrl: '[]',
      })
      .select('id')
      .single();
    if (insertErr) throw insertErr;

    const rowId = inserted.id as string;
    const uploaded = (
      await Promise.all(localPaths.map((p) => uploadLocalImage(rowId, p)))
    ).filter((url): url is string => Boolean(url));

    const { error: updateErr } = await supabase
      .from('items')
      .update({ imageUrl: JSON.stringify(uploaded) })
      .eq('id', rowId);
    if (updateErr) throw updateErr;

    console.log(`  -> row ${rowId}, ${uploaded.length} images uploaded`);
  }

  console.log('Migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
