"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Payfast's confirmation can arrive after the buyer returns; re-check every 3 s for 3 minutes. */
export function RefreshWhilePending() {
  const router = useRouter();
  useEffect(() => {
    let runs = 0;
    const timer = setInterval(() => {
      if (++runs > 60) return clearInterval(timer);
      router.refresh();
    }, 3000);
    return () => clearInterval(timer);
  }, [router]);
  return null;
}
