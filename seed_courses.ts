import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { courses } from './app/data/courses';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
}

// Uses the service-role key (server-side only, bypasses RLS) instead of
// signing in as a real admin account, so no credentials are hardcoded here.
const supabase = createClient(supabaseUrl, serviceRoleKey);

async function seed() {
  for (const course of courses) {
    console.log('Inserting', course.title);
    const { error } = await supabase.from('courses').insert({
      slug: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      "imageUrl": course.imageUrl,
      "createdAt": new Date().toISOString()
    });
    if (error) {
      console.error('Error inserting', course.title, error);
    }
  }
  console.log('Seed done');
}
seed();
