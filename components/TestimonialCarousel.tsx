'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabasePublic, isSupabaseConfigured } from '@/lib/supabase';
import { withTimeout } from '@/lib/withTimeout';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Marginalia } from '@/components/Marginalia';
import { isOptimizableImage } from '@/lib/images';

interface Testimonial {
  id: string;
  image: string;
  createdAt?: string;
}

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: 'default-1',
    image: '/images/lapis-legit.webp'
  },
  {
    id: 'default-2',
    image: '/images/bakso-sapi-premium.webp'
  },
  {
    id: 'default-3',
    image: '/images/meat-pie.webp'
  },
  {
    id: 'default-4',
    image: '/images/ogura-softcake.webp'
  }
];

/**
 * `hideFallback`: render nothing instead of FALLBACK_TESTIMONIALS (course food
 * photos, not proof) when there are no real testimonials. Used on /lp pages.
 */
export function TestimonialCarousel({ hideFallback = false }: { hideFallback?: boolean } = {}) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fallback = hideFallback ? [] : FALLBACK_TESTIMONIALS;
    const fetchTestimonials = async () => {
      try {
        if (!isSupabaseConfigured()) {
          setTestimonials(fallback);
          setLoading(false);
          return;
        }

        // Testimonials are public content. Avoid the session-backed client here:
        // its auth initialization can be blocked by a stale browser lock and leave
        // this component's loading state unresolved indefinitely.
        const { data, error } = await withTimeout(
          supabasePublic
            .from('testimonials')
            .select('*')
            .order('createdAt', { ascending: false }),
          15_000,
          'Testimonial query timed out',
        );
          
        if (error) {
          const errMsg = error.message || (error as any).toString();
          if (errMsg.includes('schema cache')) {
             console.warn('Supabase schema not initialized yet.');
          } else if (errMsg === 'Failed to fetch' || errMsg.includes('Failed to fetch')) {
             console.warn('AdBlocker or database connection issue. Testimonial carousel fell back to offline slides.');
          } else {
             console.error('Error fetching testimonials:', errMsg);
          }
          setTestimonials(fallback);
        } else if (!data || data.length === 0) {
          setTestimonials(fallback);
        } else {
          // Map database field 'imageUrl' to component's 'image' property
          const mapped = data.map((item: any) => ({
            id: item.id,
            image: item.imageUrl || item.image || '',
            createdAt: item.createdAt || item.created_at
          })).filter(item => item.image !== '');

          setTestimonials(mapped.length > 0 ? mapped : fallback);
        }
      } catch (err: any) {
        if (err.message === 'Failed to fetch' || err.toString().includes('Failed to fetch')) {
          console.warn('AdBlocker or database connection issue. Testimonial carousel fell back to offline slides.');
        } else {
          console.error('Network or unexpected error fetching testimonials:', err);
        }
        setTestimonials(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [hideFallback]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  }, [testimonials.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (testimonials.length <= 1) return;
    
    const interval = setInterval(() => {
      nextSlide();
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [testimonials.length, nextSlide]);

  if (loading) {
    // No skeleton when the carousel may turn out empty: it would only flash.
    if (hideFallback) return null;
    return (
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse flex flex-col items-center space-y-6">
          <div className="w-20 h-20 bg-stone-200 rounded-full"></div>
          <div className="h-4 bg-stone-200 rounded w-3/4"></div>
          <div className="h-4 bg-stone-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return null; // Don't render anything if no testimonials
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative"
    >
      <div className="text-center mb-12">
        <h2 className="font-serif text-3xl font-bold text-rust-ink mb-2">Apa Kata Mereka?</h2>
        <Marginalia rotate={-3} className="text-lg">setiap pesan ini aku baca sendiri :&#39;)</Marginalia>
      </div>

      <div className="relative bg-white rounded-[1.75rem] shadow-xl p-4 md:p-8 border border-butter/30 overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="w-full max-w-lg aspect-[4/5] sm:aspect-square relative rounded-2xl overflow-hidden shadow-sm bg-stone-50 border border-stone-100">
            <AnimatePresence mode="wait">
              {testimonials[currentIndex]?.image && (
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.05, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 cursor-grab active:cursor-grabbing"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x;
                    if (swipe < -50) {
                      nextSlide();
                    } else if (swipe > 50) {
                      prevSlide();
                    }
                  }}
                >
                  <Image
                    src={testimonials[currentIndex].image}
                    alt={`Testimonial ${currentIndex + 1}`}
                    fill
                    className="object-contain"
                    referrerPolicy="no-referrer"
                    priority
                    unoptimized={!isOptimizableImage(testimonials[currentIndex].image)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Buttons */}
        {testimonials.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="tap-target absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md flex items-center justify-center text-terracotta hover:bg-butter/20 hover:scale-110 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-terracotta"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="tap-target absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white rounded-full shadow-md flex items-center justify-center text-terracotta hover:bg-butter/20 hover:scale-110 transition-all z-20 focus:outline-none focus:ring-2 focus:ring-terracotta"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Indicators */}
      {testimonials.length > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className="tap-target flex items-center justify-center"
              aria-label={`Go to testimonial ${index + 1}`}
            >
              <span
                className={`block w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-terracotta scale-125' : 'bg-butter/60 hover:bg-butter'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
