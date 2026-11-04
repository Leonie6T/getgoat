/** Shown at once while goats load on slow data. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-md" aria-busy="true" aria-label="Loading goats">
      <div className="h-[61px] border-b border-line bg-card" />
      <div className="mx-4 mb-3 mt-5 h-5 w-40 animate-pulse rounded bg-line" />
      <div className="grid grid-cols-2 gap-3 px-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-line bg-card">
            <div className="h-[140px] animate-pulse bg-[#e4e4df]" />
            <div className="space-y-2 p-2.5">
              <div className="h-5 w-20 animate-pulse rounded bg-line" />
              <div className="h-3 w-28 animate-pulse rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
