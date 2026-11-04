"use client";

import { uploadPresigned } from "@vercel/blob/client";
import { useRef, useState, useTransition } from "react";
import { attachMedia, makeCover, removeMedia } from "./actions";

type Media = { id: string; kind: "PHOTO" | "VIDEO"; pathname: string; thumbPathname: string | null };

const MAX_PHOTOS = 8;
const MAX_VIDEO_MB = 80;

export function MediaManager({ goatId, media, mode }: { goatId: string; media: Media[]; mode: "blob" | "dev" }) {
  const photoInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const photos = media.filter((m) => m.kind === "PHOTO");
  const video = media.find((m) => m.kind === "VIDEO");
  const busy = Boolean(status) || isPending;

  async function upload(pathname: string, body: Blob, contentType: string) {
    if (mode === "blob") {
      await uploadPresigned(pathname, body, {
        access: "private",
        handleUploadUrl: "/seller/api/upload",
        contentType,
        multipart: body.size > 20 * 1024 * 1024,
      });
      return;
    }
    const form = new FormData();
    form.set("pathname", pathname);
    form.set("file", body);
    const res = await fetch("/seller/api/upload", { method: "POST", body: form });
    if (!res.ok) throw new Error("Upload failed");
  }

  async function onPhotos(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const room = MAX_PHOTOS - photos.length;
    const list = Array.from(files).slice(0, room);
    if (list.length === 0) return setError(`Up to ${MAX_PHOTOS} photos per goat.`);
    try {
      const items = [];
      for (const [i, file] of list.entries()) {
        setStatus(`Uploading photo ${i + 1} of ${list.length}…`);
        const id = crypto.randomUUID().slice(0, 8);
        const [full, thumb] = await Promise.all([resizeJpeg(file, 1600, 0.82), resizeJpeg(file, 480, 0.75)]);
        const pathname = `goats/${goatId}/${id}.jpg`;
        const thumbPathname = `goats/${goatId}/${id}-sm.jpg`;
        await upload(pathname, full, "image/jpeg");
        await upload(thumbPathname, thumb, "image/jpeg");
        items.push({ kind: "PHOTO" as const, pathname, thumbPathname });
      }
      setStatus("Saving…");
      await attachMedia(goatId, items);
    } catch (e) {
      setError(`Upload failed: ${(e as Error).message}. Check your signal and try again.`);
    } finally {
      setStatus(null);
      if (photoInput.current) photoInput.current.value = "";
    }
  }

  async function onVideo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setError(null);
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) return setError(`Video is too big. Max ${MAX_VIDEO_MB} MB (about 30 seconds).`);
    const ext = file.type === "video/quicktime" ? "mov" : file.type === "video/webm" ? "webm" : "mp4";
    try {
      setStatus("Uploading video… keep this page open.");
      const pathname = `goats/${goatId}/${crypto.randomUUID().slice(0, 8)}.${ext}`;
      await upload(pathname, file, file.type || "video/mp4");
      setStatus("Saving…");
      if (video) await removeMedia(video.id);
      await attachMedia(goatId, [{ kind: "VIDEO", pathname, thumbPathname: null }]);
    } catch (e) {
      setError(`Upload failed: ${(e as Error).message}. Check your signal and try again.`);
    } finally {
      setStatus(null);
      if (videoInput.current) videoInput.current.value = "";
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-bold">Photos and video</h2>
        <span className="text-[13px] text-muted">
          {photos.length}/{MAX_PHOTOS} photos · {video ? 1 : 0}/1 video
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={p.id} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/m/${p.thumbPathname ?? p.pathname}`}
              alt={`Photo ${i + 1}`}
              className={`aspect-square w-full rounded-lg object-cover ${i === 0 ? "ring-2 ring-green" : ""}`}
            />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-green px-1.5 text-[11px] font-bold text-white">Cover</span>
            )}
            <div className="mt-1 flex gap-1">
              {i > 0 && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => startTransition(() => makeCover(p.id))}
                  className="min-h-9 flex-1 rounded-md border border-line bg-card text-[12px] font-semibold"
                >
                  Cover
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => startTransition(() => removeMedia(p.id))}
                aria-label={`Remove photo ${i + 1}`}
                className="min-h-9 flex-1 rounded-md border border-line bg-card text-[12px] font-semibold text-[#a3341b]"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            disabled={busy}
            onClick={() => photoInput.current?.click()}
            className="flex aspect-square w-full items-center justify-center rounded-lg border-2 border-dashed border-[#6b6b66] bg-card text-[15px] font-semibold"
          >
            + Photo
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {video ? (
          <>
            <video src={`/m/${video.pathname}`} controls preload="metadata" className="h-24 max-w-[60%] rounded-lg bg-ink" />
            <button
              type="button"
              disabled={busy}
              onClick={() => startTransition(() => removeMedia(video.id))}
              className="min-h-11 rounded-lg border border-line bg-card px-3 text-sm font-semibold text-[#a3341b]"
            >
              Remove video
            </button>
          </>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => videoInput.current?.click()}
            className="min-h-12 rounded-lg border-2 border-dashed border-[#6b6b66] bg-card px-4 text-[15px] font-semibold"
          >
            + Video (max 30 s)
          </button>
        )}
      </div>

      <input ref={photoInput} type="file" accept="image/*" multiple hidden onChange={(e) => onPhotos(e.target.files)} />
      <input ref={videoInput} type="file" accept="video/*" hidden onChange={(e) => onVideo(e.target.files)} />

      {status && <p className="rounded-[10px] bg-green-tint px-3 py-2 text-[15px] text-green">{status}</p>}
      {error && (
        <p role="alert" className="rounded-[10px] bg-amber-tint px-3 py-2 text-[15px] text-amber-ink">
          {error}
        </p>
      )}
    </section>
  );
}

/** Shrinks a photo on the phone before upload: fast pages on slow data. */
async function resizeJpeg(file: File, maxSide: number, quality: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not read photo"))), "image/jpeg", quality),
  );
}
