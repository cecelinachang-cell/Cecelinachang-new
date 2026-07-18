// One-off migration: finds rows whose image column is still a base64 data
// URI (left over from before Supabase Storage was wired up), uploads the
// decoded bytes to the `admin-media` bucket, and rewrites the column to the
// new public Storage URL. Uses the service-role key (server-side only,
// bypasses RLS) so it must be run locally with `npx tsx
// scripts/migrate-base64-to-storage.ts`, never shipped to the client.
import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

const supabase = createClient(url, serviceKey);

function dataUriToBuffer(dataUri: string): { buffer: Buffer; contentType: string } {
  const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Not a base64 data URI');
  return { buffer: Buffer.from(match[2], 'base64'), contentType: match[1] };
}

async function uploadOne(entity: string, rowId: string, dataUri: string, index = 0): Promise<string> {
  const { buffer, contentType } = dataUriToBuffer(dataUri);
  const ext = contentType.split('/')[1] || 'webp';
  const path = `${entity}/${rowId}/migrated-${index}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('admin-media').upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw error;
  const { data } = supabase.storage.from('admin-media').getPublicUrl(path);
  return data.publicUrl;
}

async function migrateSingleColumn(table: string, column: string) {
  const { data: rows, error } = await supabase.from(table).select(`id, ${column}`) as { data: any[] | null; error: any };
  if (error) throw error;

  for (const row of rows || []) {
    const value = (row as any)[column] as string | null;
    if (!value || !value.startsWith('data:')) continue;

    console.log(`[${table}.${column}] migrating row ${row.id}...`);
    const publicUrl = await uploadOne(table, row.id, value);
    const { error: updateErr } = await supabase.from(table).update({ [column]: publicUrl }).eq('id', row.id);
    if (updateErr) throw updateErr;
    console.log(`[${table}.${column}] row ${row.id} -> ${publicUrl}`);
  }
}

async function migrateImageArrayColumn(table: string, column: string) {
  const { data: rows, error } = await supabase.from(table).select(`id, ${column}`) as { data: any[] | null; error: any };
  if (error) throw error;

  for (const row of rows || []) {
    const raw = (row as any)[column] as string | null;
    if (!raw) continue;

    let urls: string[];
    try {
      const parsed = JSON.parse(raw);
      urls = Array.isArray(parsed) ? parsed : [raw];
    } catch {
      urls = [raw];
    }

    if (!urls.some((u) => u.startsWith('data:'))) continue;

    console.log(`[${table}.${column}] migrating row ${row.id} (${urls.length} images)...`);
    const migrated = await Promise.all(
      urls.map((u, i) => (u.startsWith('data:') ? uploadOne(table, row.id, u, i) : Promise.resolve(u)))
    );
    const { error: updateErr } = await supabase
      .from(table)
      .update({ [column]: JSON.stringify(migrated) })
      .eq('id', row.id);
    if (updateErr) throw updateErr;
    console.log(`[${table}.${column}] row ${row.id} done`);
  }
}

async function main() {
  await migrateImageArrayColumn('items', 'imageUrl');
  await migrateSingleColumn('courses', 'imageUrl');
  await migrateSingleColumn('testimonials', 'imageUrl');
  await migrateSingleColumn('settings', 'logo_url');
  console.log('Migration complete.');
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
