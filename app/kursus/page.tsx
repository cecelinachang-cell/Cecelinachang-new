import { BookOpen } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import CourseCard from "@/components/CourseCard";
import CourseCardCompact from "@/components/CourseCardCompact";
import { Marginalia } from "@/components/Marginalia";

export const revalidate = 60; // Cache the page for 60 seconds

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

export default async function KursusPage() {
  let finalCourses: Course[] = [];

  try {
    if (!isSupabaseConfigured()) {
      const { courses: fallbackCourses } = await import("@/app/data/courses");
      finalCourses = fallbackCourses as unknown as Course[];
    } else {
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
        finalCourses = fallbackCourses as unknown as Course[];
      } else {
        finalCourses = data as Course[];
      }
    }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-butter/40 text-rust-ink px-4 py-2 rounded-full text-sm font-medium mb-6">
          <BookOpen className="w-5 h-5" /> Belajar Bersama Cece Lina
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-rust-ink mb-4">
          Kursus Online
        </h1>
        <Marginalia rotate={-2} className="block mb-4">
          kenapa aku bikin kelas ini? biar kamu nggak perlu gagal berkali-kali kayak aku dulu.
        </Marginalia>
        <p className="text-lg text-charcoal-brown/70 max-w-2xl mx-auto">
          Belajar langsung dari ahlinya melalui video tutorial yang jelas,
          detail, dan mudah diikuti. Akses seumur hidup dan konsultasi langsung
          dengan cece lina chang.
        </p>
      </div>

      {finalCourses.length > 0 ? (
        <>
          {heroCourse && (
            <div className="mb-20">
              <CourseCard course={heroCourse} />
            </div>
          )}

          {savoryCourses.length > 0 && (
            <div className="mb-16">
              <Marginalia rotate={-2} className="text-3xl block mb-6">
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
            <div className="mb-16">
              <Marginalia rotate={2} className="text-3xl block mb-6">
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

      {/* FAQ Singkat */}
      <div className="mt-24 max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-rust-ink mb-8 text-center">
          Pertanyaan Sering Diajukan
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "Apakah kelas ini cocok untuk pemula yang belum pernah baking?",
              a: "Sangat cocok! Semua materi dijelaskan dari nol, mulai dari pengenalan alat dan bahan hingga teknik dasar.",
            },
            {
              q: "Bagaimana cara mengakses video kelasnya?",
              a: "Setelah pembayaran, Anda akan diberikan link khusus dan password untuk menonton video kapan saja melalui HP atau laptop.",
            },
            {
              q: "Apakah ada batas waktu untuk menonton video?",
              a: "Tidak ada. Akses video berlaku seumur hidup. Anda bisa menonton ulang berkali-kali.",
            },
            {
              q: "Kalau ada yang bingung, apakah bisa bertanya?",
              a: "Tentu saja! Anda akan mendapatkan akses konsultasi langsung dengan cece lina chang untuk tanya jawab.",
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow-sm border border-butter/30"
            >
              <h3 className="font-bold text-lg text-charcoal-brown mb-2">{faq.q}</h3>
              <p className="text-charcoal-brown/70 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
