const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function reset() {
  console.log("Deleting courses...");
  let { data: courses } = await supabase.from('courses').select('id');
  if (courses && courses.length > 0) {
    const ids = courses.map(c => c.id);
    for (const chunk of chunkArray(ids, 10)) {
        await supabase.from('courses').delete().in('id', chunk);
    }
  }

  console.log("Deleting items...");
  let { data: items } = await supabase.from('items').select('id');
  if (items && items.length > 0) {
    const ids = items.map(c => c.id);
    for (const chunk of chunkArray(ids, 10)) {
        await supabase.from('items').delete().in('id', chunk);
    }
  }
  
  console.log("Deleting testimonials...");
  let { data: testimonials } = await supabase.from('testimonials').select('id');
  if (testimonials && testimonials.length > 0) {
    const ids = testimonials.map(c => c.id);
    for (const chunk of chunkArray(ids, 10)) {
        await supabase.from('testimonials').delete().in('id', chunk);
    }
  }

  console.log("All data deleted! Creating mocked data...");

  const { courses: fallbackCourses } = require('./app/data/courses.ts'); // Wait I can't require TS easily in plain JS without transpiling. Instead I will fetch it via the application's method or just leave the DB empty so the fallback renders, or I can insert placeholders here.
}

function chunkArray(myArray, chunk_size){
    var results = [];
    while (myArray.length) {
        results.push(myArray.splice(0, chunk_size));
    }
    return results;
}

reset().catch(console.error);
