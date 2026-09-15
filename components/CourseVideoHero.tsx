'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlayCircle } from 'lucide-react';

interface CourseVideoHeroProps {
  imageUrl: string;
  title: string;
  video?: string;
}

/**
 * Course detail hero image with an optional "watch the intro" overlay that
 * swaps to an embedded iframe on click. Requires frame-src for the video
 * host in next.config.ts's CSP (youtube/youtube-nocookie/vimeo).
 */
export function CourseVideoHero({ imageUrl, title, video }: CourseVideoHeroProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
      {playing && video ? (
        <iframe
          src={video}
          title={`Video perkenalan: ${title}`}
          className="w-full h-full absolute inset-0"
          allow="autoplay; fullscreen"
          allowFullScreen
        />
      ) : (
        <>
          <Image
            src={imageUrl || 'https://picsum.photos/seed/placeholder/800/600'}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            referrerPolicy="no-referrer"
            priority
          />
          {video && (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Tonton video perkenalan"
              className="absolute inset-0 flex items-center justify-center bg-black/40 group cursor-pointer w-full"
            >
              <span className="flex flex-col items-center">
                <span className="w-16 h-16 sm:w-24 sm:h-24 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-3 sm:mb-4">
                  <PlayCircle className="w-8 h-8 sm:w-12 sm:h-12 text-terracotta" />
                </span>
                <span className="text-white font-bold text-base sm:text-lg drop-shadow-md">Tonton Video Perkenalan</span>
              </span>
            </button>
          )}
        </>
      )}
    </div>
  );
}
