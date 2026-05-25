"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  PlayCircle,
  CheckCircle2,
  Star,
  Users,
  Clock,
  BookOpen,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

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
}

export default function KursusPage() {
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        let finalCourses: Course[] = [];
        const { data, error } = await supabase.from("courses").select("*");

        if (error || !data || data.length === 0) {
          if (
            error &&
            error.message &&
            error.message.includes("schema cache")
          ) {
            console.warn("Supabase schema not initialized yet.");
          } else if (error) {
            console.error("Error fetching courses:", error.message || error);
            if (error.message === "Failed to fetch") {
              // Silently fallback, but useful to know it's blocked by AdBlocker
              console.warn(
                "AdBlocker or Network issue detected. Falling back to mock data.",
              );
            }
          }
          // Fallback to mock data
          const { courses: fallbackCourses } =
            await import("@/app/data/courses");
          finalCourses = fallbackCourses as unknown as Course[];
        } else {
          finalCourses = data as Course[];
        }

        // Sort by orderIndex ascending. If no index, fallback to createdAt descending.
        finalCourses.sort((a: any, b: any) => {
          const indexA = a.orderIndex ?? a.orderindex ?? a.order_index ?? 0;
          const indexB = b.orderIndex ?? b.orderindex ?? b.order_index ?? 0;

          if (indexA !== indexB) {
            return indexA - indexB; // Ascending order (lowest number first, e.g. 1, 2, 3)
          }

          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setCourses(finalCourses);
      } catch (err: any) {
        console.error("Network or unexpected error fetching courses:", err);
        const { courses: fallbackCourses } = await import("@/app/data/courses");
        setCourses(fallbackCourses as unknown as Course[]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16 animate-pulse">
          <div className="w-48 h-8 bg-stone-200 rounded-full mx-auto mb-6"></div>
          <div className="w-3/4 h-12 bg-stone-200 rounded-lg mx-auto mb-6"></div>
          <div className="w-1/2 h-6 bg-stone-200 rounded mx-auto"></div>
        </div>
        <div className="space-y-12">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 flex flex-col lg:flex-row animate-pulse"
            >
              <div className="w-full lg:w-2/5 h-64 lg:h-auto bg-stone-200"></div>
              <div className="p-8 lg:p-10 w-full lg:w-3/5 space-y-6">
                <div className="h-8 bg-stone-200 rounded w-3/4"></div>
                <div className="h-20 bg-stone-200 rounded w-full"></div>
                <div className="flex gap-4">
                  <div className="h-8 bg-stone-200 rounded-full w-24"></div>
                  <div className="h-8 bg-stone-200 rounded-full w-24"></div>
                  <div className="h-8 bg-stone-200 rounded-full w-24"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-6 bg-stone-200 rounded w-full"></div>
                  <div className="h-6 bg-stone-200 rounded w-full"></div>
                  <div className="h-6 bg-stone-200 rounded w-full"></div>
                  <div className="h-6 bg-stone-200 rounded w-full"></div>
                </div>
                <div className="h-12 bg-stone-200 rounded-xl w-48 mt-8"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
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
        {courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course.id}
              className={`bg-white rounded-3xl overflow-hidden shadow-lg border flex flex-col lg:flex-row relative ${course.isSignature ? "border-orange-400 ring-4 ring-orange-100" : "border-orange-100"}`}
            >
              {course.isSignature && (
                <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center">
                  <Star className="w-3 h-3 mr-1.5 fill-current" /> SIGNATURE
                  CLASS
                </div>
              )}
              {/* Course Image */}
              <div className="relative w-full lg:w-2/5 aspect-video sm:aspect-auto sm:h-64 lg:h-auto">
                {playingVideo === course.id && course.video ? (
                  <iframe
                    src={course.video}
                    className="w-full h-full absolute inset-0"
                    frameBorder="0"
                    allow="autoplay; fullscreen"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <>
                    <Image
                      src={
                        course.imageUrl ||
                        "https://picsum.photos/seed/placeholder/800/600"
                      }
                      alt={course.title}
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {course.video && (
                      <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 group cursor-pointer"
                        onClick={() => setPlayingVideo(course.id)}
                      >
                        <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-8 h-8 text-orange-600" />
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Course Details */}
              <div className="p-8 lg:p-10 w-full lg:w-3/5 flex flex-col justify-between">
                <div>
                  <h2 className="font-serif text-2xl lg:text-3xl font-bold text-orange-900 mb-4">
                    {course.title}
                  </h2>
                  <p className="text-stone-600 text-lg mb-6 leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-stone-500 mb-8">
                    <div className="flex items-center bg-orange-50 px-3 py-1.5 rounded-full">
                      <Users className="w-4 h-4 mr-2 text-orange-600" />
                      {course.students} Murid
                    </div>
                    <div className="flex items-center bg-orange-50 px-3 py-1.5 rounded-full">
                      <Clock className="w-4 h-4 mr-2 text-orange-600" />
                      {course.duration}
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="font-bold text-stone-800 mb-4">
                      Apa yang akan Anda pelajari:
                    </h3>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(course.benefits || []).map((benefit, i) => (
                        <li key={i} className="flex items-start text-stone-700">
                          <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-orange-100">
                  <div className="flex flex-col mb-4 sm:mb-0">
                    {course.originalPrice && (
                      <span className="text-stone-400 line-through text-sm font-medium mb-1">
                        {course.originalPrice}
                      </span>
                    )}
                    <span className="font-serif text-3xl text-orange-800 font-bold">
                      {course.price}
                    </span>
                  </div>
                  <a
                    href={`https://wa.me/6281284250718?text=${encodeURIComponent(`Halo Cece Lina Chang, saya ingin daftar kursus: ${course.title}\n\nBerikut data diri saya:\n- Email: \n- Nomor WhatsApp: \n- Asal Kota: \n- User TikTok: \n\n(Mohon lampirkan foto bukti transfer di chat ini ya Cece)`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-full text-white bg-green-600 hover:bg-green-700 transition-colors shadow-md text-center flex items-center justify-center"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="w-5 h-5 mr-2 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    Daftar via WhatsApp
                  </a>
                </div>
              </div>
            </div>
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

      {/* FAQ Singkat */}
      <div className="mt-24 max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl font-bold text-orange-900 mb-8 text-center">
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
              className="bg-white p-6 rounded-2xl shadow-sm border border-orange-100"
            >
              <h3 className="font-bold text-lg text-stone-800 mb-2">{faq.q}</h3>
              <p className="text-stone-600 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
