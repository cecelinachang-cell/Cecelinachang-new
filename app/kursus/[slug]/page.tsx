import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, PlayCircle, CheckCircle2, Star, Users, Clock, BookOpen, MessageCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Metadata } from 'next';

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
  const description = course.description.slice(0, 155);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href="/kursus" className="inline-flex items-center text-orange-600 hover:text-orange-800 font-medium mb-8">
        <ArrowLeft className="w-5 h-5 mr-2" /> Kembali ke Daftar Kelas
      </Link>

      {/* Header & Video Intro */}
      <div className="mb-16">
        <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
          {course.isSignature ? 'Signature Class' : 'Kelas Online'}
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-900 mb-6 leading-tight">
          {course.title}
        </h1>
        
        <div className="flex flex-wrap gap-6 text-stone-500 text-sm sm:text-base mb-8">
          <div className="flex items-center">
            <Users className="w-5 h-5 mr-2 text-orange-600" />
            <span>{course.students.toLocaleString('id-ID')} Murid Bergabung</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-orange-600" />
            <span>{course.duration} Total Video</span>
          </div>
          <div className="flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500 fill-current" />
            <span>4.9 / 5.0 Rating</span>
          </div>
        </div>

        <div className="relative aspect-video sm:aspect-auto sm:h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
          <Image
            src={course.imageUrl || 'https://picsum.photos/seed/placeholder/800/600'}
            alt={course.title}
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
          {course.video && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="flex flex-col items-center cursor-pointer group">
                <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4">
                  <PlayCircle className="w-12 h-12 text-orange-600" />
                </div>
                <span className="text-white font-bold text-lg drop-shadow-md">Tonton Video Perkenalan</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Deskripsi */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-orange-900 mb-4">Tentang Kelas Ini</h2>
            <p className="text-lg text-stone-700 leading-relaxed">
              {course.description}
            </p>
          </section>

          {/* Apa yang dipelajari */}
          <section className="bg-orange-50 rounded-3xl p-8 border border-orange-100">
            <h2 className="font-serif text-2xl font-bold text-orange-900 mb-6">Apa yang Akan Anda Pelajari?</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(course.benefits || []).map((item, i) => (
                <li key={i} className="flex items-start text-stone-700">
                  <CheckCircle2 className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Isi Materi (Kurikulum) */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-orange-900 mb-6">Isi Materi Video</h2>
            <div className="space-y-4">
              {[...Array(course.modules || 0)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-5 bg-white border border-stone-200 rounded-2xl hover:border-orange-300 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-800 font-bold mr-4 flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="font-bold text-stone-800">Modul {i + 1}</span>
                  </div>
                  <div className="text-stone-500 text-sm flex items-center">
                    <PlayCircle className="w-4 h-4 mr-1" /> Video
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Testimoni */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-orange-900 mb-6">Kata Murid yang Sudah Lulus</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { name: 'Ibu Ningsih', text: 'Penjelasan Ci Lina sangat detail dan sabar banget jawab pertanyaan di grup WA. Sangat bermanfaat!' },
                { name: 'Mbak Rina', text: 'Dulu selalu gagal, ternyata salah di teknik dasar. Setelah ikut kelas ini, buatan saya selalu dipuji keluarga.' }
              ].map((testi, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100">
                  <div className="flex text-yellow-400 mb-3">
                    {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
                  </div>
                  <p className="text-stone-600 mb-4 italic text-sm leading-relaxed">&quot;{testi.text}&quot;</p>
                  <div className="font-bold text-stone-800 text-sm">{testi.name}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Pricing & CTA (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white rounded-3xl p-8 shadow-xl border border-orange-100">
            <div className="text-center mb-6">
              {course.originalPrice && (
                <div className="text-stone-500 line-through mb-1">{course.originalPrice}</div>
              )}
              <div className="font-serif text-4xl text-orange-800 font-bold mb-2">{course.price}</div>
              {course.originalPrice && (
                <div className="inline-block bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded mb-1">
                  Hemat {Math.round((1 - Number(course.price.replace(/\D/g, '')) / Number(course.originalPrice.replace(/\D/g, ''))) * 100)}%
                </div>
              )}
              <div className="text-stone-500 text-xs">
                Sudah {course.students.toLocaleString('id-ID')} murid bergabung
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-stone-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                Akses video seumur hidup
              </li>
              <li className="flex items-center text-stone-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                Konsultasi langsung dengan cece lina chang
              </li>
              <li className="flex items-center text-stone-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                E-Book resep lengkap (PDF)
              </li>
              <li className="flex items-center text-stone-700 text-sm">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                Sertifikat digital
              </li>
            </ul>

            <div className="flex items-start bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800">
              <CheckCircle2 className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <span>Bingung setelah beli? Konsultasi langsung dengan Cece Lina Chang termasuk dalam kelas — bukan ekstra biaya.</span>
            </div>

            <a
              href={`https://wa.me/6281284250718?text=Halo%20Admin,%20saya%20mau%20daftar%20${encodeURIComponent(course.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center px-6 py-4 text-lg font-bold rounded-xl text-white bg-green-500 hover:bg-green-600 transition-colors shadow-md mb-4"
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Chat Cece, Daftar Kelas
            </a>
            <p className="text-xs text-stone-500 text-center">
              Pembayaran aman via transfer bank. Tidak perlu membuat akun di website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
