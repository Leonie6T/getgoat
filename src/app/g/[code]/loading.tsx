export default function Loading() {
  return (
    <div className="mx-auto max-w-md" aria-busy="true" aria-label="Loading goat">
      <div className="h-[61px] border-b border-line bg-card" />
      <div className="h-[300px] animate-pulse bg-[#e4e4df]" />
      <div className="space-y-3 p-4">
        <div className="h-9 w-36 animate-pulse rounded bg-line" />
        <div className="h-4 w-48 animate-pulse rounded bg-line" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-[10px] bg-line" />
          ))}
        </div>
      </div>
    </div>
  );
}
