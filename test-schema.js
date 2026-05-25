const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('courses').select('*').limit(1);
  console.log('Error:', error);
  console.log('Keys:', Object.keys(data[0]));
  console.log('Sample Data:', data);
}

main();
