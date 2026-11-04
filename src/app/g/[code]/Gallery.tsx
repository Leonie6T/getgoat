"use client";

import { useState } from "react";

type Photo = { src: string; thumb: string };

export function Gallery({ photos, video, alt }: { photos: Photo[]; video: string | null; alt: string }) {
  const [index, setIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const total = photos.length;

  if (total === 0 && !video) {
    return <div className="flex h-[260px] items-center justify-center bg-[#cfcfc9] text-muted">No photo yet</div>;
  }

  return (
    <div>
      <div className="relative h-[280px] bg-ink">
        {showVideo && video ? (
          <video src={video} controls autoPlay playsInline className="size-full object-contain" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photos[index]?.src} alt={`${alt}, photo ${index + 1}`} className="size-full object-cover" />
        )}
        {!showVideo && total > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => setIndex((index - 1 + total) % total)}
              className="absolute left-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => setIndex((index + 1) % total)}
              className="absolute right-2 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-xl"
            >
              ›
            </button>
            <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[13px] text-white">
              {index + 1} / {total}
            </span>
          </>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto px-4 py-2">
        {photos.map((p, i) => (
          <button
            key={p.thumb}
            type="button"
            aria-label={`Show photo ${i + 1}`}
            onClick={() => {
              setShowVideo(false);
              setIndex(i);
            }}
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
            className={`flex size-16 shrink-0 items-center justify-center rounded-md bg-[#3a3f3c] text-[12px] font-bold text-white ${
              showVideo ? "ring-2 ring-ink" : ""
            }`}
          >
            ▶ Video
          </button>
        )}
      </div>
    </div>
  );
}
