import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { unstable_cache } from "next/cache";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import CourseCard from "@/components/CourseCard";
import CourseCardCompact from "@/components/CourseCardCompact";
import { Marginalia } from "@/components/Marginalia";
import Faq from "@/components/Faq";
import { SITE_NAME, breadcrumbJsonLd, itemListJsonLd } from "@/lib/seo";

export const revalidate = 60; // Cache the page for 60 seconds

const PAGE_TITLE = "Kursus Baking Online";
const PAGE_DESCRIPTION =
  "Daftar kelas baking online Cece Lina Chang: bakso sapi, lapis legit, ogura, dan lainnya. Video tutorial detail, akses seumur hidup, konsultasi langsung.";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/kursus" },
  openGraph: {
    title: `${PAGE_TITLE} | ${SITE_NAME}`,
    description: PAGE_DESCRIPTION,
    url: "/kursus",
    type: "website",
  },
};

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
  orderIndex?: number;
  createdAt?: string;
}

const SWEET_KEYWORDS = ["legit", "ogura", "sponge", "cake", "manis"];

function isSweet(course: Course): boolean {
  const title = course.title.toLowerCase();
  return SWEET_KEYWORDS.some((kw) => title.includes(kw));
}

// Next 15 doesn't cache fetch() by default and supabase-js's internal fetch
// doesn't opt in, so this page's `revalidate = 60` was caching nothing --
// every visit re-hit Supabase and rendered dynamically. Wrap the fetch.
const getAllCourses = unstable_cache(
  async (): Promise<Course[]> => {
    if (!isSupabaseConfigured()) {
      const { courses: fallbackCourses } = await import("@/app/data/courses");
      return fallbackCourses as unknown as Course[];
    }
    const { data, error } = await supabase.from("courses").select("*");

    if (error || !data || data.length === 0) {
      if (error && error.message && error.message.includes("schema cache")) {
        console.warn("Supabase schema not initialized yet.");
      } else if (error) {
        const errMsg = error?.message || (error as any)?.toString() || '';
        if (errMsg === "Failed to fetch" || errMsg.includes("Failed to fetch")) {
          console.warn("AdBlocker or Network issue detected. Falling back to mock data.");
        } else {
          console.error("Error fetching courses:", errMsg);
        }
      }
      const { courses: fallbackCourses } = await import("@/app/data/courses");
      return fallbackCourses as unknown as Course[];
    }
    return data as Course[];
  },
  ["all-courses"],
  { revalidate: 60 }
);

export default async function KursusPage() {
  let finalCourses: Course[] = [];

  try {
    finalCourses = await getAllCourses();

    finalCourses.sort((a: any, b: any) => {
      const indexA = a.orderIndex ?? a.orderindex ?? a.order_index ?? 0;
      const indexB = b.orderIndex ?? b.orderindex ?? b.order_index ?? 0;

      if (indexA !== indexB) {
        return indexA - indexB;
      }

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  } catch (err: any) {
    console.error("Network or unexpected error fetching courses:", err);
    const { courses: fallbackCourses } = await import("@/app/data/courses");
    finalCourses = fallbackCourses as unknown as Course[];
  }

  const heroCourse = finalCourses.find((c) => c.isSignature) || finalCourses[0];
  const restCourses = finalCourses.filter((c) => c.id !== heroCourse?.id);
  const savoryCourses = restCourses.filter((c) => !isSweet(c));
  const sweetCourses = restCourses.filter((c) => isSweet(c));

  const structuredData = [
    breadcrumbJsonLd([
      { name: "Beranda", path: "/" },
      { name: PAGE_TITLE, path: "/kursus" },
    ]),
    itemListJsonLd(
      PAGE_TITLE,
      finalCourses.map((course) => `/kursus/${course.slug}`)
    ),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="text-center mb-10 sm:mb-16">
        <div className="inline-flex items-center space-x-2 bg-butter/40 text-rust-ink px-4 py-2 rounded-full text-sm font-medium mb-4 sm:mb-6">
          <BookOpen className="w-5 h-5" /> Belajar Bersama Cece Lina
        </div>
        <h1 className="text-fluid-h1 font-serif font-bold text-rust-ink mb-3 sm:mb-4">
          Kursus Online
        </h1>
        <Marginalia rotate={-2} className="block mb-3 sm:mb-4">
          kenapa aku bikin kelas ini? biar kamu nggak perlu gagal berkali-kali kayak aku dulu.
        </Marginalia>
        <p className="text-base sm:text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
          Belajar langsung dari ahlinya melalui video tutorial yang jelas,
          detail, dan mudah diikuti. Akses seumur hidup dan konsultasi langsung
          dengan cece lina chang.
        </p>
      </div>

      {finalCourses.length > 0 ? (
        <>
          {heroCourse && (
            <div className="mb-10 sm:mb-20">
              <CourseCard course={heroCourse} />
            </div>
          )}

          {savoryCourses.length > 0 && (
            <div className="mb-10 sm:mb-16">
              <Marginalia rotate={-2} className="text-2xl sm:text-3xl block mb-4 sm:mb-6">
                Kelas Gurih
              </Marginalia>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {savoryCourses.map((course) => (
                  <CourseCardCompact key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}

          {sweetCourses.length > 0 && (
            <div className="mb-10 sm:mb-16">
              <Marginalia rotate={2} className="text-2xl sm:text-3xl block mb-4 sm:mb-6">
                Kelas Manis
              </Marginalia>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {sweetCourses.map((course) => (
                  <CourseCardCompact key={course.id} course={course} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-24 bg-butter/10 rounded-3xl border border-butter/30">
          <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-charcoal-brown mb-2">
            Belum Ada Kursus
          </h2>
          <p className="text-charcoal-brown/60 max-w-md mx-auto">
            Kursus online sedang dalam proses pembuatan. Silakan kembali lagi
            nanti untuk melihat kelas terbaru.
          </p>
        </div>
      )}

      <Faq categories={["course", "refund"]} title="Pertanyaan Sering Diajukan" />
    </div>
  );
}
