import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

interface Course {
  id: string;
  slug: string;
  title: string;
  price: string;
  originalPrice?: string;
  duration: string;
  imageUrl: string;
  benefits: string[];
}

export default function CourseCardCompact({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-[1.5rem_0.5rem_1.5rem_0.5rem] overflow-hidden shadow-sm border border-butter/30 hover:shadow-md transition-shadow flex flex-col">
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
        <p className="text-charcoal-brown/70 text-sm mb-4 leading-relaxed line-clamp-2">
          {course.benefits?.[0]}
        </p>
        <div className="flex items-center text-charcoal-brown/50 text-xs mb-4">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          {course.duration}
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
          <a
            href={`https://wa.me/6281284250718?text=${encodeURIComponent(`Halo Cece Lina Chang, saya ingin daftar kursus: ${course.title}\n\nBerikut data diri saya:\n- Email: \n- Nomor WhatsApp: \n- Asal Kota: \n- User TikTok: \n\n(Mohon lampirkan foto bukti transfer di chat ini ya Cece)`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2.5 text-sm font-bold rounded-full text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
          >
            Chat Cece, Daftar Kelas
          </a>
          <Link
            href={`/kursus/${course.slug}`}
            className="block text-center text-terracotta text-xs font-medium mt-2 hover:text-rust-ink transition-colors"
          >
            Lihat detail & kurikulum
          </Link>
        </div>
      </div>
    </div>
  );
}
