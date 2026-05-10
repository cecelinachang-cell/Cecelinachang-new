const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let env = {};
try {
  const content = fs.readFileSync('.env.example', 'utf-8');
  content.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const parts = line.split('=');
      env[parts[0]] = parts[1].replace(/"/g, '');
    }
  });
} catch (e) {}

const url = env.NEXT_PUBLIC_SUPABASE_URL || 'missing';
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing';
console.log("URL:", url);

const supabase = createClient(url, key);
supabase.from('items').select('*').limit(1).then(res => console.log(JSON.stringify(res.data)));
