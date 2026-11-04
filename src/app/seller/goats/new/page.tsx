import { TopBar } from "@/components/TopBar";
import { GoatForm } from "../GoatForm";

export default function NewGoatPage() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <TopBar back={{ href: "/seller", label: "Cancel" }} title="Add goat" />
      <main className="p-4">
        <p className="mb-3 text-sm text-muted">Save the details first. Then add photos and video.</p>
        <GoatForm />
      </main>
    </div>
  );
}
