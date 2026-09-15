import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Users, Clock } from 'lucide-react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { stripHtml } from '@/lib/utils';
import { SanitizedHtml } from '@/components/SanitizedHtml';
import { CoursePricingPanel } from '@/components/CoursePricingPanel';
import { MobileCourseBar } from '@/components/MobileCourseBar';
import { CourseVideoHero } from '@/components/CourseVideoHero';
import { ViewContentPing } from '@/components/ViewContentPing';
import { TestimonialCarousel } from '@/components/TestimonialCarousel';
import ProductCard from '@/components/ProductCard';
import { courseProducts } from '@/app/data/course-products';
import { products } from '@/app/data/products';
import { getCourseBySlug } from '@/lib/courses';
import { parseIdr } from '@/lib/pixels';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

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
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const usedProducts = (courseProducts[course.slug] || [])
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is (typeof products)[number] => Boolean(p));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <ViewContentPing
        contentId={course.slug}
        contentName={course.title}
        contentType="course"
        value={parseIdr(course.price)}
      />
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
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
            <span>Akses seumur hidup</span>
          </div>
        </div>

        <CourseVideoHero imageUrl={course.imageUrl} title={course.title} video={course.video} />
      </div>

      {/* Mobile: pricing, benefits, and refund policy hidden on lg:block are
          otherwise invisible on the device most visitors use. */}
      <div className="lg:hidden mb-8">
        <CoursePricingPanel course={course} />
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
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-4 sm:mb-6">Kata Murid Cece</h2>
            <TestimonialCarousel />
          </section>

          {/* Alat yang digunakan */}
          {usedProducts.length > 0 && (
            <section>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-rust-ink mb-4 sm:mb-6">Alat yang Dipakai di Kelas Ini</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {usedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}

          {/* Ajakan lihat kelas lain */}
          <section className="text-center border-t border-butter/30 pt-8">
            <p className="text-charcoal-brown/70 mb-3">Cece juga punya kelas online lainnya, lho.</p>
            <Link
              href="/kursus"
              className="inline-flex items-center font-bold text-terracotta hover:text-rust-ink transition-colors"
            >
              Lihat Kelas Lainnya <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Link>
          </section>

        </div>

        {/* Right Column: Pricing & CTA (Sticky, desktop only) */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <CoursePricingPanel course={course} />
          </div>
        </div>
      </div>

      {/* Mobile: fixed bottom price + CTA bar, always visible while scrolling */}
      <MobileCourseBar course={course} />
    </div>
  );
}
