"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { trackConversion } from "@/lib/analytics";

/**
 * Click-to-load YouTube player. Only the thumbnail loads with the page; the
 * iframe (and its ~1MB of player scripts) waits for a tap, which keeps the
 * landing page fast on mobile data.
 */
export function YouTubePreview({ videoId, title, courseSlug }: { videoId: string; title: string; courseSlug?: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-kecap shadow-[0_18px_40px_-16px_rgba(34,26,23,0.55)] ring-1 ring-black/5">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setPlaying(true);
            trackConversion("video_play", courseSlug);
          }}
          className="group absolute inset-0 h-full w-full cursor-pointer focus-visible:outline-none"
          aria-label={`Putar video: ${title}`}
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 560px"
            className="object-cover"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" aria-hidden="true" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sambal text-white shadow-lg ring-4 ring-white/80 transition-transform duration-200 group-hover:scale-105 group-focus-visible:ring-mie motion-reduce:transition-none">
            <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
          </span>
          <span className="absolute bottom-3 left-4 text-left text-sm font-semibold text-white">
            Tonton cuplikan kelasnya
          </span>
        </button>
      )}
    </div>
  );
}
