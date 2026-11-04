import { Logo } from "@/components/Logo";

export default function GoatsPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-4">
      <header className="flex items-center justify-between">
        <Logo />
        <p className="text-right text-[13px] text-muted">
          Brofour Farming
          <br />
          <a href="tel:+27834426012" className="text-muted">083 442 6012</a>
        </p>
      </header>
      <h1 className="mt-6 font-display text-[30px] font-extrabold leading-tight tracking-tight">Goats for sale</h1>
      <div className="mt-6 rounded-[20px] bg-milk p-6 text-center shadow-[0_2px_0_var(--color-line)]">
        <p className="text-lg font-semibold">No goats listed yet.</p>
        <p className="mt-1 text-muted">Check back soon.</p>
      </div>
    </main>
  );
}
