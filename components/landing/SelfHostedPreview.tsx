"use client";

import { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { trackConversion } from "@/lib/analytics";

export interface PreviewVideo {
  /** Path under /public, e.g. /videos/bakso.mp4. Vertical 9:16, H.264 with faststart. */
  src: string;
  /** Still frame shown before the tap. */
  poster: string;
  /** Text on the thumbnail. */
  label: string;
}

/**
 * Click-to-play preview for a vertical (9:16) video hosted in /public.
 * Before the tap it shows a 16:9 crop of the poster, so the buy button stays
 * on the first screen. After the tap it grows to 9:16 (capped at 80vh) and
 * plays. Nothing but the poster loads until the tap.
 */
export function SelfHostedPreview({ video, title, courseSlug }: { video: PreviewVideo; title: string; courseSlug?: string }) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="mx-auto aspect-[9/16] max-h-[80vh] overflow-hidden rounded-2xl bg-kecap shadow-[0_18px_40px_-16px_rgba(34,26,23,0.55)] ring-1 ring-black/5">
        <video
          src={video.src}
          poster={video.poster}
          title={title}
          autoPlay
          controls
          playsInline
          preload="auto"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl bg-kecap shadow-[0_18px_40px_-16px_rgba(34,26,23,0.55)] ring-1 ring-black/5">
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
          src={video.poster}
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 720px"
          className="object-cover object-[50%_45%]"
        />
        <span className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" aria-hidden="true" />
        <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sambal text-white shadow-lg ring-4 ring-white/80 transition-transform duration-200 group-hover:scale-105 group-focus-visible:ring-mie motion-reduce:transition-none">
          <Play className="ml-1 h-7 w-7 fill-current" aria-hidden="true" />
        </span>
        <span className="absolute bottom-3 left-4 text-left text-sm font-semibold text-white">{video.label}</span>
      </button>
    </div>
  );
}
