import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SoldStamp } from "@/components/GoatCard";
import { TopBar } from "@/components/TopBar";
import { db } from "@/lib/db";
import { MARK_LABEL, PREGNANT_LABEL, SEX_LABEL, ageLabel, buyerStatus, formatRand, goatTitle, mediaUrl } from "@/lib/goats";
import { SELLER_PHONE_TEL, siteUrl } from "@/lib/site";
import { Gallery } from "./Gallery";

export const dynamic = "force-dynamic";

const getGoat = cache(async (code: string) =>
  db.goat.findUnique({
    where: { code: code.toUpperCase() },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  }),
);

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const goat = await getGoat((await params).code);
  if (!goat || goat.status === "HIDDEN") return { title: "Goat not found" };
  const origin = await siteUrl();
  const cover = goat.media.find((m) => m.kind === "PHOTO");
  const title = `${goatTitle(goat)} · ${formatRand(goat.priceCents)}`;
  const description = [
    goat.pregnant === "YES" ? "Pregnant" : null,
    ageLabel(goat.ageMonths),
    goat.weightKg ? `${goat.weightKg} kg` : null,
    `Tag ${goat.idMarkValue}`,
  ]
    .filter(Boolean)
    .join(" · ");
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${origin}/g/${goat.code}`,
      images: cover ? [{ url: `${origin}${mediaUrl(cover.pathname)}` }] : [],
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function GoatPage({ params }: { params: Promise<{ code: string }> }) {
  const goat = await getGoat((await params).code);
  if (!goat || goat.status === "HIDDEN") notFound();

  const status = buyerStatus(goat);
  const sold = status === "SOLD" || status === "COLLECTED";
  const held = status === "RESERVED";
  const photos = goat.media.filter((m) => m.kind === "PHOTO");
  const video = goat.media.find((m) => m.kind === "VIDEO");
  const link = `${await siteUrl()}/g/${goat.code}`;
  const buyMessage = `Hi, I want to buy this goat: ${goatTitle(goat)}, ${formatRand(goat.priceCents)}, tag ${goat.idMarkValue}. ${link}`;

  const facts = [
    { label: "Sex", value: SEX_LABEL[goat.sex] },
    { label: "Age", value: ageLabel(goat.ageMonths) },
    { label: "Weight", value: goat.weightKg ? `${goat.weightKg} kg` : null },
    { label: "Colour", value: goat.colour },
  ].filter((f): f is { label: string; value: string } => Boolean(f.value));

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar back={{ href: "/goats", label: "All goats" }} />
      <div className="relative">
        <Gallery
          photos={photos.map((p) => ({ src: mediaUrl(p.pathname), thumb: mediaUrl(p.thumbPathname ?? p.pathname) }))}
          video={video ? mediaUrl(video.pathname) : null}
          alt={goatTitle(goat)}
        />
        {sold && <SoldStamp size="lg" />}
      </div>

      <main className="flex-1 px-4 pb-4">
        <div className="pt-2">
          <div className={`text-[34px] font-extrabold ${sold ? "text-muted line-through" : ""}`}>
            {formatRand(goat.priceCents)}
          </div>
          <div className="text-base text-muted">
            {goat.breed} goat · {MARK_LABEL[goat.idMarkType]} {goat.idMarkValue}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 py-3">
          {facts.map((f) => (
            <div key={f.label} className="rounded-[10px] border border-line bg-card p-2.5">
              <div className="text-[12px] text-muted">{f.label}</div>
              <div className="text-lg font-bold">{f.value}</div>
            </div>
          ))}
          {goat.sex === "DOE" && goat.pregnant && (
            <div
              className={`rounded-[10px] p-2.5 ${
                goat.pregnant === "YES" ? "border-2 border-green bg-green-tint" : "border border-line bg-card"
              }`}
            >
              <div className="text-[12px] text-muted">Pregnant</div>
              <div className="text-lg font-bold">
                {PREGNANT_LABEL[goat.pregnant]}
                {goat.pregnant === "YES" && goat.dueMonth ? ` · due ${goat.dueMonth}` : ""}
              </div>
            </div>
          )}
          {goat.sex === "DOE" && goat.hasKidded != null && (
            <div className="rounded-[10px] border border-line bg-card p-2.5">
              <div className="text-[12px] text-muted">Kids born</div>
              <div className="text-lg font-bold">
                {goat.hasKidded ? `Yes${goat.kiddingCount ? ` · ${goat.kiddingCount}×` : ""}` : "Not yet"}
              </div>
            </div>
          )}
        </div>
        {goat.notes && <p className="text-[15px]">{goat.notes}</p>}
      </main>

      <div className="sticky bottom-0 border-t border-line bg-card p-4">
        {sold ? (
          <p className="text-center text-lg font-bold text-muted">This goat is sold.</p>
        ) : held ? (
          <p className="text-center text-lg font-bold text-amber-ink">Someone is buying this goat now. Try again in 15 minutes.</p>
        ) : (
          // Online payment arrives in slice 4; until then the button opens a WhatsApp chat with the seller.
          <a
            href={`https://wa.me/${SELLER_PHONE_TEL.replace("+", "")}?text=${encodeURIComponent(buyMessage)}`}
            className="flex min-h-14 items-center justify-center rounded-xl bg-green text-xl font-bold text-white no-underline"
          >
            Buy this goat
          </a>
        )}
      </div>
    </div>
  );
}
