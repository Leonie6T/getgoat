import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-3 px-6 text-center">
      <p className="text-xl font-bold">Page not found.</p>
      <Link
        href="/goats"
        className="mt-2 flex min-h-14 w-full items-center justify-center rounded-xl bg-green text-xl font-bold text-white no-underline"
      >
        See goats for sale
      </Link>
    </main>
  );
}
