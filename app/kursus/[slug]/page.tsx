import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, CheckCircle2, Star, Users, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Metadata } from 'next';
import { stripHtml } from '@/lib/utils';
import { SanitizedHtml } from '@/components/SanitizedHtml';
import { CoursePricingPanel } from '@/components/CoursePricingPanel';

export const revalidate = 60;

interface Course {
  id: string;
  slug: string;
  isSignature: boolean;
  title: string;
  description: string;
  price: string;
  originalPrice?: string;
  students: number;
  duration: string;
  modules: number;
  imageUrl: string;
  video?: string;
  benefits: string[];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let course: Course | null = null;

  try {
    if (!isSupabaseConfigured()) {
      const { courses: fallbackCourses } = await import('@/app/data/courses');
      course = (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
    } else {
      const { data } = await supabase.from('courses').select('*').eq('slug', slug).single();
      if (data) course = data as Course;
      else {
        const { courses: fallbackCourses } = await import('@/app/data/courses');
        course = (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
      }
    }
  } catch {
    const { courses: fallbackCourses } = await import('@/app/data/courses');
    course = (fallbackCourses.find((c: any) => c.slug === slug) as unknown as Course) || null;
  }

  if (!course) {
    return { title: 'Kelas Tidak Ditemukan | Cece Lina Chang' };
  }

  const title = `${course.title} | Cece Lina Chang`;
  const description = stripHtml(course.description).slice(0, 155);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://cecelinachang.com/kursus/${course.slug}`,
      siteName: 'Cece Lina Chang',
      images: [{ url: course.imageUrl, width: 1200, height: 630, alt: course.title }],
      locale: 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [course.imageUrl],
    },
  };
}

export default async function KursusDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let course: Course | null = null;

  try {
    if (!isSupabaseConfigured()) {
      const { courses: fallbackCourses } = await import("@/app/data/courses");
      const found = fallbackCourses.find((c: any) => c.slug === slug);
      if (found) {
        course = found as unknown as Course;
      }
    } else {
      const { data, error } = await supabase.from('courses').select('*').eq('slug', slug).single();
      if (error) {
        const errMsg = error?.message || (error as any)?.toString() || '';
        if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
          console.error("Error fetching course detail:", errMsg);
        }
        const { courses: fallbackCourses } = await import("@/app/data/courses");
        const found = fallbackCourses.find((c: any) => c.slug === slug);
        if (found) {
          course = found as unknown as Course;
        }
      } else if (data) {
        course = data as Course;
      }
    }
  } catch (err: any) {
    const errMsg = err?.message || err?.toString() || '';
    if (errMsg !== "Failed to fetch" && !errMsg.includes("Failed to fetch")) {
      console.error("Unexpected error fetching course detail:", err);
    }
    try {
      const { courses: fallbackCourses } = await import("@/app/data/courses");
      const found = fallbackCourses.find((c: any) => c.slug === slug);
      if (found) {
        course = found as unknown as Course;
      }
    } catch (_) {}
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Link href="/kursus" className="inline-flex items-center text-terracotta hover:text-rust-ink font-medium mb-6 sm:mb-8">
        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar Kelas
      </Link>

      {/* Header & Video Intro */}
      <div className="mb-8 sm:mb-16">
        <div className="inline-flex items-center space-x-2 bg-butter/40 text-rust-ink px-3 py-1 rounded-full text-sm font-medium mb-3 sm:mb-4">
          {course.isSignature ? 'Signature Class' : 'Kelas Online'}
        </div>
        <h1 className="text-fluid-h1 font-serif font-bold text-rust-ink mb-4 sm:mb-6 leading-tight">
          {course.title}
        </h1>

        <div className="flex flex-wrap gap-4 sm:gap-6 text-charcoal-brown/60 text-sm sm:text-base mb-6 sm:mb-8">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-terracotta" />
            <span>{course.students.toLocaleString('id-ID')} Murid Bergabung</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-terracotta" />
            <span>{course.duration} Total Video</span>
          </div>
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
            <span>4.9 / 5.0 Rating</span>
          </div>
        </div>

        <div className="relative aspect-video lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <Image
            src={course.imageUrl || 'https://picsum.photos/seed/placeholder/800/600'}
            alt={course.title}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          {course.video && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3 sm:mb-4">
                  <PlayCircle className="w-8 h-8 sm:w-12 sm:h-12 text-terracotta" />
                </div>
                <span className="text-white font-bold text-base sm:text-lg drop-shadow-md">Tonton Video Perkenalan</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: pricing/CTA shown above the fold, before the long description */}
      <div className="lg:hidden mb-8">
        <CoursePricingPanel course={course} compact />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-12">
          {/* Deskripsi */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-3 sm:mb-4">Tentang Kelas Ini</h2>
            <SanitizedHtml
              html={course.description}
              className="prose prose-stone max-w-none text-base sm:text-lg text-charcoal-brown/80 leading-relaxed"
            />
          </section>

          {/* Apa yang dipelajari */}
          <section className="bg-butter/15 rounded-3xl p-6 sm:p-8 border border-butter/30">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-4 sm:mb-6">Apa yang Akan Anda Pelajari?</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(course.benefits || []).map((item, i) => (
                <li key={i} className="flex items-start text-charcoal-brown/80">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Testimoni */}
          <section>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-4 sm:mb-6">Kata Murid yang Sudah Lulus</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { name: 'Ibu Ningsih', text: 'Penjelasan Ci Lina sangat detail dan sabar banget jawab pertanyaan di grup WA. Sangat bermanfaat!' },
                { name: 'Mbak Rina', text: 'Dulu selalu gagal, ternyata salah di teknik dasar. Setelah ikut kelas ini, buatan saya selalu dipuji keluarga.' }
              ].map((testi, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-butter/30">
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-charcoal-brown/70 mb-4 italic text-sm leading-relaxed">&quot;{testi.text}&quot;</p>
                  <div className="font-bold text-charcoal-brown text-sm">{testi.name}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Mobile: repeat the CTA at the end of the content column */}
          <div className="lg:hidden">
            <CoursePricingPanel course={course} compact />
          </div>
        </div>

        {/* Right Column: Pricing & CTA (Sticky, desktop only) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <CoursePricingPanel course={course} />
          </div>
        </div>
      </div>
    </div>
  );
}
