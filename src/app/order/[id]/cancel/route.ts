import { NextResponse } from "next/server";
import { releaseOrder } from "@/lib/orders";

/** Payfast cancel_url: the buyer stopped paying, so free the goat at once. */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await releaseOrder(id, "CANCELLED");
  return NextResponse.redirect(new URL(`/order/${id}`, request.url), 303);
}
