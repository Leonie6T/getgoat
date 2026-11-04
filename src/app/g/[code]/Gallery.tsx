"use client";

import { useRef, useState } from "react";

type Photo = { src: string; thumb: string };

/** Swipeable photo strip (native scroll-snap), dots, thumbnails and an optional video. */
export function Gallery({ photos, video, alt }: { photos: Photo[]; video: string | null; alt: string }) {
  const strip = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const total = photos.length;

  if (total === 0 && !video) {
    return <div className="flex h-[260px] items-center justify-center bg-[#cfcfc9] text-muted">No photo yet</div>;
  }

  function go(i: number) {
    setShowVideo(false);
    setIndex(i);
    requestAnimationFrame(() => strip.current?.scrollTo({ left: i * strip.current.clientWidth, behavior: "smooth" }));
  }

  return (
    <div>
      <div className="relative h-[300px] bg-[#cfcfc9]">
        {showVideo && video ? (
          <video src={video} controls autoPlay playsInline className="size-full bg-ink object-contain" />
        ) : (
          <div
            ref={strip}
            onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
            className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none]"
            aria-label="Photos, swipe to see more"
          >
            {photos.map((p, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p.src}
                src={p.src}
                alt={`${alt}, photo ${i + 1} of ${total}`}
                loading={i === 0 ? "eager" : "lazy"}
                className="size-full shrink-0 snap-center object-cover"
              />
            ))}
          </div>
        )}
        {!showVideo && total > 1 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5" aria-hidden="true">
            {photos.map((p, i) => (
              <span key={p.src} className={`h-2 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-2 bg-white/60"}`} />
            ))}
          </div>
        )}
      </div>
      {(total > 1 || video) && (
        <div className="flex gap-2 overflow-x-auto px-4 py-2">
          {photos.map((p, i) => (
            <button
              key={p.thumb}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              onClick={() => go(i)}
              className={`size-16 shrink-0 overflow-hidden rounded-md ${!showVideo && i === index ? "ring-2 ring-ink" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.thumb} alt="" className="size-full object-cover" />
            </button>
          ))}
          {video && (
            <button
              type="button"
              onClick={() => setShowVideo(true)}
              className={`flex size-16 shrink-0 flex-col items-center justify-center rounded-md bg-[#3a3f3c] text-[12px] font-bold text-white ${
                showVideo ? "ring-2 ring-ink" : ""
              }`}
            >
              <span className="text-lg leading-none">▶</span>Video
            </button>
          )}
        </div>
      )}
    </div>
  );
}
