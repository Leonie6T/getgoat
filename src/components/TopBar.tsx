import Link from "next/link";

/** White top bar from the wireframes: back link (optional), title, right-side slot. */
export function TopBar({
  back,
  title,
  right,
}: {
  back?: { href: string; label: string };
  title?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 border-b border-line bg-card px-4 py-2">
      {back && (
        <Link href={back.href} className="flex min-h-11 items-center no-underline">
          ← {back.label}
        </Link>
      )}
      {title && <div className="text-lg font-bold">{title}</div>}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  );
}
