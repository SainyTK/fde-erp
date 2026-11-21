export type StatusTone = "positive" | "negative" | "neutral";

const tones: Record<string, StatusTone> = {
  Approved: "positive",
  Rejected: "negative",
  Cancelled: "negative",
  CANCELLED: "negative",
  CLOSED_SHORT: "negative",
  REJECTED: "negative",
  ON_HOLD: "negative",
  EXCEPTION: "negative",
  INVOICED: "positive",
  RECEIVED: "positive",
  CONVERTED: "positive",
  PAID: "positive",
  MATCHED: "positive",
  BELOW_REORDER_POINT: "negative",
  DEAD_STOCK: "negative",
  IN_STOCK: "positive",
};

export function statusTone(status: string): StatusTone {
  return tones[status] ?? "neutral";
}
