import { BookOpen } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import CourseCard from "@/components/CourseCard";
import Faq from "@/components/Faq";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
          <BookOpen className="w-5 h-5" /> Belajar Bersama Cece Lina
        </div>
        <h1 className="font-serif text-4xl lg:text-5xl font-bold text-orange-900 mb-6">
          Kursus Online
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Belajar langsung dari ahlinya melalui video tutorial yang jelas,
          detail, dan mudah diikuti. Akses seumur hidup dan konsultasi langsung
          dengan cece lina chang.
        </p>
      </div>

      <div className="space-y-12">
        {finalCourses.length > 0 ? (
          finalCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        ) : (
          <div className="text-center py-24 bg-stone-50 rounded-3xl border border-stone-100">
            <div className="w-24 h-24 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-stone-400" />
            </div>
            <h2 className="text-2xl font-bold text-stone-700 mb-2">
              Belum Ada Kursus
            </h2>
            <p className="text-stone-500 max-w-md mx-auto">
              Kursus online sedang dalam proses pembuatan. Silakan kembali lagi
              nanti untuk melihat kelas terbaru.
            </p>
          </div>
        )}
      </div>

      <Faq categories={["course", "refund"]} title="Pertanyaan Sering Diajukan" />
    </div>
  );
}
