import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, CheckCircle2 } from "lucide-react";
import { TestimonialCarousel } from "@/components/TestimonialCarousel";
import { Marginalia } from "@/components/Marginalia";
import { Button } from "@/components/ui/Button";
import { Tape } from "@/components/ui/Tape";
import CourseCardCompact from "@/components/CourseCardCompact";
import Faq from "@/components/Faq";
import { HeroHeadline, HeroHeadlineFallback } from "@/components/home/HeroHeadline";
import { HeroCta, HeroCtaFallback } from "@/components/home/HeroCta";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CourseScroller } from "@/components/home/CourseScroller";
import { AskCeceButton } from "@/components/home/AskCeceButton";
import { HomeStickyCta } from "@/components/home/HomeStickyCta";
import { getAllCourses, pickFeatured, totalStudents } from "@/lib/courses";
import { getSiteAssets } from "@/lib/settings";

export const revalidate = 60;

const BENEFITS = [
  { title: "Resep teruji", desc: "semua udah aku tes berkali-kali, bukan coba-coba." },
  { title: "Video detail", desc: "step by step, bisa kamu ulang kapan aja." },
  { title: "Ditemenin sampai bisa", desc: "bingung? tanya langsung ke aku, nggak ada biaya tambahan." },
];

export default async function Home() {
  const [courses, assets] = await Promise.all([
    getAllCourses(),
    getSiteAssets(["hero_image"]),
  ]);

  const featured = pickFeatured(courses);
  const otherCourses = courses.filter((c) => c.id !== featured?.id);
  const studentsLabel = totalStudents(courses).toLocaleString("id-ID");

  // Nothing to sell yet -- bail to a minimal shell rather than crash on an
  // undefined featured course.
  if (!featured) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl font-bold text-rust-ink mb-4">Belajar Baking Anti Gagal</h1>
        <p className="text-charcoal-brown/70">Kelas online sedang disiapkan. Silakan kembali lagi nanti.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-14 lg:gap-16 pb-10 sm:pb-16">
      {/* Hero: text-first so the CTA lands above the fold on mobile. */}
      <section className="relative bg-cream overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 sm:pt-12 sm:pb-14 lg:pt-32 lg:pb-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="flex flex-col text-center lg:text-left">
              <div className="inline-flex items-center gap-2 mx-auto lg:mx-0 mb-4 bg-butter/40 text-rust-ink px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit">
                <span className="relative w-6 h-6 rounded-full overflow-hidden border border-white shrink-0">
                  <Image src="/images/lina-avatar.jpeg" alt="" fill sizes="24px" className="object-cover object-top" />
                </span>
                <BookOpen className="w-3.5 h-3.5" /> Kelas Online · Cece Lina Chang
              </div>

              <Suspense fallback={<HeroHeadlineFallback />}>
                <HeroHeadline />
              </Suspense>

              <p className="text-base sm:text-xl text-charcoal-brown/80 mb-6 sm:mb-8 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Aku ajarin dari nol lewat video yang jelas banget. {studentsLabel}+ murid udah bisa bikin bakso, lapis
                legit, sampai otak-otak sendiri di rumah.
              </p>

              <Suspense fallback={<HeroCtaFallback featured={featured} />}>
                <HeroCta featured={featured} courses={courses} />
              </Suspense>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative w-full aspect-[4/5] rounded-[2.5rem_1rem_2.5rem_1rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src={assets["hero_image"] || "/images/meat-pie.webp"}
                  alt="Cece Lina Chang Baking"
                  fill
                  sizes="50vw"
                  className="object-cover object-top"
                  priority
                  unoptimized
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8 text-white">
                  <p className="font-serif text-xl font-semibold">Cece Lina Chang</p>
                  <p className="text-sm text-white/80">Pembuat kelas ini</p>
                </div>
              </div>
              <Tape className="-top-3 -left-3" rotate={-8} />
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink">{studentsLabel}+</div>
            <div className="text-xs sm:text-sm text-charcoal-brown/60">murid</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink">{courses.length}</div>
            <div className="text-xs sm:text-sm text-charcoal-brown/60">kelas online</div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink">16 thn</div>
            <div className="text-xs sm:text-sm text-charcoal-brown/60">pengalaman pabrik bakso</div>
          </div>
        </div>
      </section>

      {/* Featured course */}
      <section className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Marginalia rotate={-2} className="block mb-4 text-center">
          kelas paling laris, mulai dari sini ya
        </Marginalia>
        <CourseCardCompact course={featured} featured />
      </section>

      <HowItWorks />

      {/* Benefits */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-2 text-center">
          Kenapa Belajar Sama Aku?
        </h2>
        <Marginalia rotate={2} className="block text-center mb-6">
          bukan basa-basi, ini caraku ngajar beneran
        </Marginalia>
        <div className="space-y-3">
          {BENEFITS.map((item) => (
            <div key={item.title} className="flex items-start gap-3 bg-white rounded-2xl border border-butter/30 p-4">
              <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
              <p className="text-charcoal-brown/80 leading-relaxed">
                <span className="font-bold text-charcoal-brown">{item.title}</span> — {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <TestimonialCarousel />

      {/* Other courses */}
      {otherCourses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rust-ink mb-4 text-center sm:text-left">
            Kelas Lainnya
          </h2>
          <CourseScroller courses={otherCourses} />
          <div className="text-center sm:text-left mt-4">
            <Link href="/toko" className="text-sm text-terracotta font-medium hover:text-rust-ink">
              Cari alat baking yang aku pakai? Lihat Toko →
            </Link>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <Faq categories={["course", "refund"]} title="Yang sering ditanyain" />
      </div>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-rust-ink text-cream rounded-3xl p-6 sm:p-10 text-center">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold mb-2">Masih ragu?</h2>
          <p className="text-cream/80 mb-6">Tanya aku dulu, nggak apa-apa.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <AskCeceButton />
            <Button href="/kursus" variant="secondary" size="lg">
              Lihat Semua Kelas
            </Button>
          </div>
        </div>
      </section>

      <HomeStickyCta
        course={{
          slug: featured.slug,
          title: featured.title,
          price: featured.price,
          originalPrice: featured.originalPrice,
        }}
      />
    </div>
  );
}
