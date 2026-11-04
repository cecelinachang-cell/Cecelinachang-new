// One-off: copies the files from the Supabase Storage backup
// (`<project>.storage.zip`, unzipped) into public/images/uploads/, then
// rewrites every Supabase Storage URL in the database to the local path.
//
//   npx tsx scripts/neon/migrate-storage-to-repo.ts <unzipped-backup-dir> [--dry-run]
//
// The 30 pre-migration images ship with the site as static files; new admin
// uploads go to Vercel Blob (lib/adminStorage.ts). Needs DATABASE_URL in
// .env.local (`vercel env pull .env.local`). Safe to re-run: files are
// overwritten in place and only URLs still pointing at Supabase are rewritten.
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

config({ path: '.env.local' });

const SUPABASE_PREFIX = 'https://yjxvrsmubrasvoipkwvn.supabase.co/storage/v1/object/public/';
const BUCKET = 'admin-media/';
const PUBLIC_DIR = path.join('public', 'images', 'uploads');
const PUBLIC_PATH = '/images/uploads/';
// Columns holding image URLs. items.imageUrl is a JSON array in a text column;
// a plain string replace covers both shapes.
const URL_COLUMNS: [table: string, column: string][] = [
  ['testimonials', 'imageUrl'],
  ['items', 'imageUrl'],
  ['courses', 'imageUrl'],
  ['settings', 'logo_url'],
];

function listFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

async function main() {
  const [root] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  const dryRun = process.argv.includes('--dry-run');
  if (!root) throw new Error('Usage: migrate-storage-to-repo.ts <unzipped-backup-dir> [--dry-run]');
  if (!process.env.DATABASE_URL) throw new Error('Missing DATABASE_URL');

  // The zip unpacks to <project-ref>/<bucket>/<object path>.
  const projectDir = fs.readdirSync(root).map((d) => path.join(root, d)).find((d) => fs.statSync(d).isDirectory());
  if (!projectDir) throw new Error(`No project folder inside ${root}`);

  const mapping = new Map<string, string>();
  for (const file of listFiles(projectDir)) {
    const objectPath = path.relative(projectDir, file).split(path.sep).join('/'); // admin-media/testimonials/new/x.webp
    if (!objectPath.startsWith(BUCKET)) continue;
    const relative = objectPath.slice(BUCKET.length); // testimonials/new/x.webp
    if (!dryRun) {
      const target = path.join(PUBLIC_DIR, relative);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.copyFileSync(file, target);
    }
    mapping.set(SUPABASE_PREFIX + objectPath, PUBLIC_PATH + relative);
  }

  const sql = neon(process.env.DATABASE_URL);
  let rewritten = 0;
  for (const [table, column] of URL_COLUMNS) {
    for (const [oldUrl, newUrl] of mapping) {
      const pattern = `%${oldUrl}%`;
      const rows = dryRun
        ? await sql.query(`select 1 from "${table}" where "${column}" like $1`, [pattern])
        : await sql.query(`update "${table}" set "${column}" = replace("${column}", $1, $2) where "${column}" like $3 returning 1`, [oldUrl, newUrl, pattern]);
      rewritten += rows.length;
    }
  }

  const leftovers: string[] = [];
  for (const [table, column] of URL_COLUMNS) {
    const [{ n }] = (await sql.query(`select count(*)::int as n from "${table}" where "${column}" like $1`, [`%${SUPABASE_PREFIX}%`])) as { n: number }[];
    if (n) leftovers.push(`${table}.${column}: ${n}`);
  }
  console.log(`${dryRun ? 'Would rewrite' : 'Rewrote'} ${rewritten} values; ${mapping.size} files ${dryRun ? 'found' : `copied to ${PUBLIC_DIR}`}.`);
  console.log(leftovers.length ? `Rows still pointing at Supabase: ${leftovers.join(', ')}` : 'No Supabase URLs left.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
