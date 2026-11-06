import type { Metadata } from "next";
import { AccessForm } from "./AccessForm";

export const metadata: Metadata = { title: "Private test version", robots: { index: false, follow: false } };

/** Gate shown while SITE_PASSWORD is set (testing before go-live). */
export default async function AccessPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <main className="mx-auto flex min-h-dvh max-w-sm flex-col items-center justify-center gap-4 px-5 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/online-goat-market-128.png" alt="" width={88} height={88} className="rounded-full" />
      <h1 className="text-[24px] font-extrabold">Private test version</h1>
      <p className="text-muted">Online Goat Market is not open yet. Enter the test password to continue.</p>
      <AccessForm next={next ?? "/"} />
    </main>
  );
}
