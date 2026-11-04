import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { isSeller } from "@/lib/session";
import {
  MAX_PHOTO_BYTES,
  MAX_VIDEO_BYTES,
  PHOTO_TYPES,
  VIDEO_TYPES,
  blobConfigured,
  devSave,
  isPublicMediaPath,
} from "@/lib/media";

/**
 * Upload endpoint for the seller's goat media.
 * - Vercel: issues a presigned URL so the phone uploads straight to the private Blob store.
 * - Local dev (no Blob credentials): accepts the file itself as multipart form data.
 */
export async function POST(request: Request) {
  if (!(await isSeller())) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  if (!blobConfigured()) return devUpload(request);

  const body = (await request.json()) as HandleUploadPresignedBody;
  try {
    const result = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        if (!isPublicMediaPath(pathname)) throw new Error("Invalid pathname");
        const isVideo = !pathname.endsWith(".jpg");
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: isVideo ? VIDEO_TYPES : PHOTO_TYPES,
          maximumSizeInBytes: isVideo ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES,
          validUntil: Date.now() + 15 * 60 * 1000,
        });
        return { token };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("upload token failed", error);
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}

async function devUpload(request: Request) {
  const form = await request.formData();
  const pathname = String(form.get("pathname") ?? "");
  const file = form.get("file");
  if (!isPublicMediaPath(pathname) || !(file instanceof Blob)) {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  await devSave(pathname, await file.arrayBuffer());
  return NextResponse.json({ pathname });
}

export async function GET() {
  return NextResponse.json({ mode: blobConfigured() ? "blob" : "dev" });
}
