const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('courses').select('*').limit(1);
  console.log('Error:', error);
  console.log('Keys:', data && data.length > 0 ? Object.keys(data[0]) : 'No data');
  console.log('Sample Data:', data);
}

main();
