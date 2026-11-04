import "server-only";
import { del, get, issueSignedToken, presignUrl } from "@vercel/blob";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Goat photos and videos live in the private Vercel Blob store under `goats/`.
 * Without Blob credentials (local development) files go to `.data/media/`.
 */
export const blobConfigured = () => Boolean(process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN);

const DEV_ROOT = path.join(process.cwd(), ".data", "media");

export const PHOTO_TYPES = ["image/jpeg"];
export const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

/** Only goat media is served publicly; anything else (documents) stays private. */
export function isPublicMediaPath(pathname: string) {
  return /^goats\/[A-Za-z0-9_-]+\/[A-Za-z0-9._-]+$/.test(pathname);
}

function devPath(pathname: string) {
  const full = path.join(DEV_ROOT, pathname);
  if (!full.startsWith(DEV_ROOT + path.sep)) throw new Error("Bad media path");
  return full;
}

export async function devSave(pathname: string, data: ArrayBuffer) {
  const full = devPath(pathname);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, Buffer.from(data));
}

export async function readMedia(pathname: string): Promise<{ body: ReadableStream | Buffer; contentType: string } | null> {
  if (blobConfigured()) {
    const result = await get(pathname, { access: "private" });
    if (!result || !result.stream) return null;
    return { body: result.stream, contentType: result.blob.contentType ?? "application/octet-stream" };
  }
  try {
    const body = await readFile(devPath(pathname));
    return { body, contentType: contentTypeFor(pathname) };
  } catch {
    return null;
  }
}

/**
 * Videos need HTTP range requests (iOS Safari), which the Blob CDN supports.
 * Returns a short-lived presigned URL for a direct redirect, or null in local dev.
 */
export async function presignedVideoUrl(pathname: string) {
  if (!blobConfigured()) return null;
  const validUntil = Date.now() + 6 * 60 * 60 * 1000;
  const token = await issueSignedToken({ pathname, operations: ["get"], validUntil });
  const { presignedUrl } = await presignUrl(token, { operation: "get", pathname, access: "private", validUntil });
  return presignedUrl;
}

export async function deleteMedia(pathnames: string[]) {
  const list = pathnames.filter(Boolean);
  if (list.length === 0) return;
  if (blobConfigured()) {
    await del(list);
    return;
  }
  await Promise.all(list.map((p) => rm(devPath(p), { force: true })));
}

function contentTypeFor(pathname: string) {
  if (pathname.endsWith(".jpg")) return "image/jpeg";
  if (pathname.endsWith(".mp4")) return "video/mp4";
  if (pathname.endsWith(".mov")) return "video/quicktime";
  if (pathname.endsWith(".webm")) return "video/webm";
  return "application/octet-stream";
}
