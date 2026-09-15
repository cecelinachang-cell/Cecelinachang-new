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
import { stripHtml } from "@/lib/utils";
import LeadFormModal from "./LeadFormModal";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/WhatsAppIcon";
import { trackConversion } from "@/lib/analytics";
import { parseIdr } from "@/lib/pixels";

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
  const [showLeadForm, setShowLeadForm] = useState(false);

  return (
    <div
      className={`bg-white rounded-[2rem_0.75rem_2rem_0.75rem] overflow-hidden shadow-lg border flex flex-col lg:flex-row relative ${course.isSignature ? "border-terracotta ring-4 ring-butter/30" : "border-butter/30"}`}
    >
      {course.isSignature && (
        <div className="absolute top-4 left-4 z-10 bg-terracotta text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md flex items-center">
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
                  <PlayCircle className="w-8 h-8 text-terracotta" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Course Details */}
      <div className="p-6 sm:p-8 lg:p-10 w-full lg:w-3/5 flex flex-col justify-between">
        <div>
          <Link href={`/kursus/${course.slug}`}>
            <h2 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-rust-ink mb-3 sm:mb-4 hover:text-terracotta transition-colors">
              {course.title}
            </h2>
          </Link>
          <p className="text-charcoal-brown/75 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
            {stripHtml(course.description)}
          </p>

          <div className="flex flex-wrap gap-4 text-sm text-charcoal-brown/60 mb-8">
            <div className="flex items-center bg-butter/25 px-3 py-1.5 rounded-full text-terracotta">
              <Users className="w-4 h-4 mr-2 text-terracotta" />
              {course.students} Murid
            </div>
            <div className="flex items-center bg-butter/25 px-3 py-1.5 rounded-full text-terracotta">
              <Clock className="w-4 h-4 mr-2 text-terracotta" />
              {course.duration}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-bold text-charcoal-brown mb-4">
              Apa yang akan Anda pelajari:
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(course.benefits || []).map((benefit, i) => (
                <li key={i} className="flex items-start text-charcoal-brown/80">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-butter/30">
          <div className="flex flex-col mb-4 sm:mb-0">
            {course.originalPrice && (
              <span className="text-charcoal-brown/40 line-through text-sm font-medium mb-1">
                {course.originalPrice}
              </span>
            )}
            <span className="font-serif text-2xl sm:text-3xl text-rust-ink font-bold">
              {course.price}
            </span>
          </div>
          <Button
            type="button"
            onClick={() => {
              trackConversion('lead_form_open', course.slug, {
                contentName: course.title,
                contentType: 'course',
                value: parseIdr(course.price),
              });
              setShowLeadForm(true);
            }}
            variant="whatsapp"
            size="lg"
            fullWidth
            className="sm:w-fit"
          >
            <WhatsAppIcon className="w-5 h-5 mr-2" />
            Chat Cece, Daftar Kelas
          </Button>
          <Link
            href={`/kursus/${course.slug}`}
            className="tap-target flex items-center w-full sm:w-auto justify-center sm:justify-start text-center sm:text-left text-terracotta font-medium text-sm mt-1 hover:text-rust-ink transition-colors underline underline-offset-2"
          >
            Lihat detail & kurikulum lengkap
          </Link>
        </div>
      </div>
      {showLeadForm && (
        <LeadFormModal
          courseSlug={course.slug}
          courseTitle={course.title}
          coursePrice={course.price}
          onClose={() => setShowLeadForm(false)}
        />
      )}
    </div>
  );
}
