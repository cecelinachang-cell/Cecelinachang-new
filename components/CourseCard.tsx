"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import {
  PlayCircle,
  CheckCircle2,
  Star,
  Users,
  Clock,
} from "lucide-react";

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

export default function CourseCard({ course }: { course: Course }) {
  const [playingVideo, setPlayingVideo] = useState(false);

  return (
    <div
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
        {playingVideo && course.video ? (
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
                onClick={() => setPlayingVideo(true)}
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
          <Link href={`/kursus/${course.slug}`}>
            <h2 className="font-serif text-2xl lg:text-3xl font-bold text-orange-900 mb-4 hover:text-orange-700 transition-colors">
              {course.title}
            </h2>
          </Link>
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
            Chat Cece, Daftar Kelas
          </a>
          <Link
            href={`/kursus/${course.slug}`}
            className="w-full sm:w-auto text-center sm:text-left text-orange-700 font-medium text-sm mt-3 hover:text-orange-900 transition-colors underline underline-offset-2"
          >
            Lihat detail & kurikulum lengkap
          </Link>
        </div>
      </div>
    </div>
  );
}
