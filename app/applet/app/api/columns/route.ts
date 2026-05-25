import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('courses').select('*').limit(1);
  return NextResponse.json({ keys: data && data.length > 0 ? Object.keys(data[0]) : [], error });
}
