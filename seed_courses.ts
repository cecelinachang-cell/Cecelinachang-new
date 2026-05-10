import { createClient } from '@supabase/supabase-js';
import { courses } from './app/data/courses';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'signoratangerangclc@gmail.com',
    password: 'HL121073'
  });

  if (authError) {
    console.warn('Could not authenticate, proceeding as anonymous:', authError.message);
  } else {
    console.log('Authenticated as', authData.user?.email);
  }

  for (const course of courses) {
    console.log('Inserting', course.title);
    const { error } = await supabase.from('courses').insert({
      slug: course.id,
      title: course.title,
      description: course.description,
      price: course.price,
      "imageUrl": course.image,
      "createdAt": new Date().toISOString()
    });
    if (error) {
      console.error('Error inserting', course.title, error);
    }
  }
  console.log('Seed done');
}
seed();

