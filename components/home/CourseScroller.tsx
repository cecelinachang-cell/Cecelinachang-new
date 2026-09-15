import Image from 'next/image';
import Link from 'next/link';
import type { Course } from '@/lib/courses';

export function CourseScroller({ courses }: { courses: Course[] }) {
  if (courses.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-4 px-4 pb-2 sm:mx-0 sm:px-0">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/kursus/${course.slug}`}
          className="snap-start shrink-0 w-40 sm:w-48 bg-white rounded-[1.25rem_0.5rem_1.25rem_0.5rem] border border-butter/30 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="relative w-full aspect-[4/3]">
            <Image
              src={course.imageUrl || 'https://picsum.photos/seed/placeholder/400/300'}
              alt={course.title}
              fill
              sizes="200px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="p-3">
            <h3 className="font-serif text-sm font-bold text-rust-ink line-clamp-2 mb-1 leading-snug">
              {course.title}
            </h3>
            <span className="text-terracotta font-bold text-sm">{course.price}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
