import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { SoldStamp } from "@/components/GoatCard";
import { TopBar } from "@/components/TopBar";
import { SiteFooter } from "@/components/SiteFooter";
import { IconAge, IconBaby, IconChat, IconColour, IconFemale, IconSex, IconWeight } from "@/components/icons";
import { db } from "@/lib/db";
import { MARK_LABEL, PREGNANT_LABEL, SEX_LABEL, ageLabel, buyerStatus, formatRand, goatTitle, mediaUrl } from "@/lib/goats";
import { COLLECTION_POINT, collectionFrom, formatDay, sellerWhatsApp, siteUrl } from "@/lib/site";
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
      siteName: "Online Goat Market",
      images: [{ url: cover ? `${origin}${mediaUrl(cover.pathname)}` : `${origin}/brand/online-goat-market-1200.jpg` }],
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

  const facts = [
    { label: "Sex", value: SEX_LABEL[goat.sex], Icon: goat.sex === "DOE" ? IconFemale : IconSex },
    { label: "Age", value: ageLabel(goat.ageMonths), Icon: IconAge },
    { label: "Weight", value: goat.weightKg ? `${goat.weightKg} kg` : null, Icon: IconWeight },
    { label: "Colour", value: goat.colour, Icon: IconColour },
  ].filter((f): f is { label: string; value: string; Icon: typeof IconSex } => Boolean(f.value));

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
              <div className="flex items-center gap-1.5 text-[13px] text-muted">
                <f.Icon className="size-4" />
                {f.label}
              </div>
              <div className="text-lg font-bold">{f.value}</div>
            </div>
          ))}
          {goat.sex === "DOE" && goat.pregnant && (
            <div
              className={`rounded-[10px] p-2.5 ${
                goat.pregnant === "YES" ? "border-2 border-green bg-green-tint" : "border border-line bg-card"
              }`}
            >
              <div className="flex items-center gap-1.5 text-[13px] text-muted">
                <IconBaby className="size-4" />
                Pregnant
              </div>
              <div className="text-lg font-bold">
                {PREGNANT_LABEL[goat.pregnant]}
                {goat.pregnant === "YES" && goat.dueMonth ? ` · due ${goat.dueMonth}` : ""}
              </div>
            </div>
          )}
          {goat.sex === "DOE" && goat.hasKidded != null && (
            <div className="rounded-[10px] border border-line bg-card p-2.5">
              <div className="flex items-center gap-1.5 text-[13px] text-muted">
                <IconBaby className="size-4" />
                Kids born
              </div>
              <div className="text-lg font-bold">
                {goat.hasKidded ? `Yes${goat.kiddingCount ? ` · ${goat.kiddingCount}×` : ""}` : "Not yet"}
              </div>
            </div>
          )}
        </div>
        {goat.notes && <p className="text-[15px]">{goat.notes}</p>}
        <div className="mt-4 rounded-[10px] border border-line bg-card p-3 text-[15px]">
          <div className="font-bold">Collection</div>
          <div>{COLLECTION_POINT}</div>
          <div>
            Available from <strong>{formatDay(collectionFrom(new Date()))}</strong> if you pay today.
          </div>
        </div>
        <a
          href={sellerWhatsApp(`Hi, I have a question about ${goatTitle(goat)} (tag ${goat.idMarkValue}). ${link}`)}
          className="mt-3 flex min-h-12 items-center justify-center gap-1.5 rounded-lg border border-line bg-card font-semibold no-underline"
        >
          <IconChat className="size-5" /> Ask on WhatsApp
        </a>
      </main>

      <div className="sticky bottom-0 border-t border-line bg-card px-4 pb-3 pt-3">
        {sold ? (
          <p className="text-center text-lg font-bold text-muted">This goat is sold.</p>
        ) : held ? (
          <p className="text-center text-lg font-bold text-amber-ink">Someone is buying this goat now. Try again in 5 minutes.</p>
        ) : (
          <>
            <Link
              href={`/g/${goat.code}/buy`}
              className="flex min-h-14 items-center justify-center rounded-xl bg-green text-xl font-bold text-white no-underline"
            >
              Buy this goat
            </Link>
            <p className="mt-1 text-center text-[12px] text-muted">Pay safely online with Payfast</p>
          </>
        )}
      </div>
      <SiteFooter />
    </div>
  );
}
