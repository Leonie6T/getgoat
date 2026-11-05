import { NextResponse } from "next/server";
import { runCleanup } from "@/lib/cleanup";

/**
 * Daily job (vercel.json). Vercel sends "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET
 * is set; without it, only Vercel's cron user agent is accepted. The job only tidies data.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authorised = secret
    ? request.headers.get("authorization") === `Bearer ${secret}`
    : (request.headers.get("user-agent") ?? "").startsWith("vercel-cron/");
  if (!authorised) return new NextResponse("Unauthorised", { status: 401 });

  const result = await runCleanup();
  console.info("Cleanup", result);
  return NextResponse.json(result);
}
