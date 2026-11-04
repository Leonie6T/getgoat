import { isPublicMediaPath, presignedVideoUrl, readMedia } from "@/lib/media";

/** Public goat media from the private Blob store. Pathnames are unique, so cache forever. */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const pathname = (await params).path.join("/");
  if (!isPublicMediaPath(pathname)) return new Response("Not found", { status: 404 });

  if (!pathname.endsWith(".jpg")) {
    const url = await presignedVideoUrl(pathname);
    if (url) return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "public, max-age=3600" } });
  }

  const media = await readMedia(pathname);
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(media.body as BodyInit, {
    headers: {
      "Content-Type": media.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
