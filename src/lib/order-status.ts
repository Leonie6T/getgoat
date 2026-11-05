import type { OrderStatus } from "@prisma/client";

export const STATUS_BADGE: Record<OrderStatus, { label: string; className: string }> = {
  PAID: { label: "PAID", className: "bg-amber-tint text-amber-ink" },
  COLLECTED: { label: "COLLECTED", className: "bg-green-tint text-green" },
  REFUND_NEEDED: { label: "REFUND NEEDED", className: "bg-[#fbe3dc] text-[#a3341b]" },
  REFUNDED: { label: "REFUNDED", className: "bg-ground text-muted" },
  PENDING: { label: "PAYING", className: "bg-ground text-muted" },
  AWAITING_PAYMENT: { label: "AWAITING PAYMENT", className: "bg-[#eef3f8] text-[#33404d]" },
  CANCELLED: { label: "CANCELLED", className: "bg-ground text-muted" },
  EXPIRED: { label: "EXPIRED", className: "bg-ground text-muted" },
};
