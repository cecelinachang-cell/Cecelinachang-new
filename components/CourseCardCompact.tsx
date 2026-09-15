"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Clock, MessageCircle, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { shopeeLink } from "@/lib/links";
import { trackConversion } from "@/lib/analytics";
import { parseIdr } from "@/lib/pixels";
import LeadFormModal from "@/components/LeadFormModal";

interface Course {
  id: string;
  slug: string;
  title: string;
  price: string;
  originalPrice?: string;
  duration: string;
  imageUrl: string;
  benefits: string[];
  shopeeUrl?: string | null;
  students?: number;
  isSignature?: boolean;
}

export default function CourseCardCompact({
  course,
  featured = false,
}: {
  course: Course;
  featured?: boolean;
}) {
  const [showLeadForm, setShowLeadForm] = useState(false);

  return (
    <div className="bg-white rounded-[1.5rem_0.5rem_1.5rem_0.5rem] overflow-hidden shadow-sm border border-butter/30 hover:shadow-md transition-shadow flex flex-col relative">
      {featured && (
        <div className="absolute top-4 left-4 z-10 bg-terracotta text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
          <Star className="w-3 h-3 mr-1.5 fill-current" /> SIGNATURE CLASS
        </div>
      )}
      <Link href={`/kursus/${course.slug}`} className="relative w-full aspect-[4/3] block">
        <Image
          src={course.imageUrl || "https://picsum.photos/seed/placeholder/800/600"}
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/kursus/${course.slug}`}>
          <h3 className="font-serif text-xl font-bold text-rust-ink mb-2 hover:text-terracotta transition-colors leading-snug">
            {course.title}
          </h3>
        </Link>
        {featured ? (
          <ul className="space-y-1.5 mb-4">
            {(course.benefits || []).slice(0, 3).map((benefit, i) => (
              <li key={i} className="text-charcoal-brown/70 text-sm leading-relaxed line-clamp-1">
                • {benefit}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-charcoal-brown/70 text-sm mb-4 leading-relaxed line-clamp-2">
            {course.benefits?.[0]}
          </p>
        )}
        <div className="flex items-center gap-4 text-charcoal-brown/50 text-xs mb-4">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {course.duration}
          </div>
          {featured && typeof course.students === "number" && (
            <div className="flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5" />
              {course.students.toLocaleString("id-ID")} murid udah gabung
            </div>
          )}
        </div>

        <div className="mt-auto pt-4 border-t border-butter/30">
          <div className="flex items-baseline gap-2 mb-3">
            {course.originalPrice && (
              <span className="text-charcoal-brown/40 line-through text-xs font-medium">
                {course.originalPrice}
              </span>
            )}
            <span className="font-serif text-xl text-rust-ink font-bold">
              {course.price}
            </span>
          </div>
          <Button
            type="button"
            onClick={() => {
              trackConversion("lead_form_open", course.slug, {
                contentName: course.title,
                contentType: "course",
                value: parseIdr(course.price),
              });
              setShowLeadForm(true);
            }}
            variant="whatsapp"
            size="md"
            fullWidth
          >
            <MessageCircle className="w-4 h-4 mr-1.5" /> Chat Cece, Daftar Kelas
          </Button>
          {course.shopeeUrl && (
            <Button
              href={shopeeLink(course.shopeeUrl)}
              external
              variant="shopee"
              size="md"
              fullWidth
              className="mt-2"
              onClick={() =>
                trackConversion("shopee_open", course.slug, {
                  contentName: course.title,
                  contentType: "course",
                  value: parseIdr(course.price),
                })
              }
            >
              Beli via Shopee
            </Button>
          )}
          <Link
            href={`/kursus/${course.slug}`}
            className="tap-target flex items-center justify-center text-center text-terracotta text-sm font-medium mt-1 hover:text-rust-ink transition-colors"
          >
            Lihat detail & kurikulum
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
