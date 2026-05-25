import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'missing';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('courses').select('*').limit(1);
  console.log('Error:', error);
  if (data && data.length > 0) {
    console.log('Keys:', Object.keys(data[0]));
    console.log('Data:', data[0]);
  } else {
    console.log('No data');
  }
}

main();
