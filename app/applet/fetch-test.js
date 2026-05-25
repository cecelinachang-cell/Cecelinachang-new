const fs = require('fs');

const envFile = fs.readFileSync('.env', 'utf8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, value] = line.split('=');
  if (key && value) acc[key.trim()] = value.trim();
  return acc;
}, {});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseKey = envVars['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

async function main() {
  const fetch = (await import('node-fetch')).default || global.fetch;

  const res = await fetch(`${supabaseUrl}/rest/v1/courses?select=*&limit=1`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });

  const data = await res.json();
  console.log("Success:", res.ok);
  console.log("Data:", data);
}
main();
