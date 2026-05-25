import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
const lines = envText.split('\n');
let url = '', key = '';
for (const line of lines) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) key = line.split('=')[1].trim();
}

async function main() {
  const req = await fetch(`${url}/rest/v1/courses?select=*&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });
  const data = await req.json();
  console.log(data);
}
main();
