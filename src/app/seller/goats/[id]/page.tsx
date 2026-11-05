import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/ConfirmButton";
import { ShareLink } from "@/components/ShareButton";
import { SubmitButton } from "@/components/SubmitButton";
import { TopBar } from "@/components/TopBar";
import { db } from "@/lib/db";
import { STATUS_LABEL, formatRand, goatTitle } from "@/lib/goats";
import { blobConfigured } from "@/lib/media";
import { siteUrl } from "@/lib/site";
import { deleteGoat, setGoatHidden } from "../actions";
import { GoatForm } from "../GoatForm";
import { MediaManager } from "../MediaManager";

export default async function EditGoatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; saved?: string }>;
}) {
  const { id } = await params;
  const flags = await searchParams;
  const goat = await db.goat.findUnique({ where: { id }, include: { media: { orderBy: { sortOrder: "asc" } } } });
  if (!goat) notFound();

  const link = `${await siteUrl()}/g/${goat.code}`;
  const shareText = `${goatTitle(goat)} · ${formatRand(goat.priceCents)}\n${link}`;
  const canHide = goat.status === "AVAILABLE" || goat.status === "HIDDEN";

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-10">
      <TopBar back={{ href: "/seller", label: "My goats" }} title={goat.idMarkValue} right={
        <span className="rounded-full bg-ground px-2 py-1 text-[12px] font-bold">{STATUS_LABEL[goat.status]}</span>
      } />
      <main className="flex flex-col gap-6 p-4">
        {flags.new && (
          <p role="status" className="rounded-[10px] bg-green-tint px-3 py-2 text-[15px] text-green">
            Goat saved. Now add photos – buyers trust goats with clear photos.
          </p>
        )}
        {flags.saved && <p role="status" className="rounded-[10px] bg-green-tint px-3 py-2 text-[15px] text-green">Changes saved.</p>}

        <MediaManager
          goatId={goat.id}
          media={goat.media.map((m) => ({ id: m.id, kind: m.kind, pathname: m.pathname, thumbPathname: m.thumbPathname }))}
          mode={blobConfigured() ? "blob" : "dev"}
        />

        <div className="flex gap-2">
          <ShareLink text={shareText} label="Share on WhatsApp" className="flex-1" />
          <a
            href={`/g/${goat.code}`}
            target="_blank"
            className="flex min-h-11 items-center rounded-lg border border-line bg-card px-3 font-semibold no-underline"
          >
            View
          </a>
        </div>

        <section>
          <h2 className="mb-2 text-lg font-bold">Details</h2>
          <GoatForm goat={{ ...goat, weightKg: goat.weightKg?.toString() ?? null }} />
        </section>

        <section className="flex flex-col gap-2 border-t border-line pt-4">
          {canHide && (
            <form action={setGoatHidden.bind(null, goat.id, goat.status !== "HIDDEN")}>
              <SubmitButton pendingText="Saving…" className="min-h-12 w-full rounded-xl border border-line bg-card font-semibold">
                {goat.status === "HIDDEN" ? "Show in marketplace again" : "Hide from marketplace"}
              </SubmitButton>
            </form>
          )}
          <form action={deleteGoat.bind(null, goat.id)}>
            <ConfirmButton
              label="Delete goat"
              confirmLabel="Tap again to delete for good"
              pendingText="Deleting…"
              className="min-h-12 w-full rounded-xl border border-[#e6b7aa] bg-card font-semibold text-[#a3341b]"
            />
          </form>
        </section>
      </main>
    </div>
  );
}
