import { formatPercent } from "@/src/utils/formatPercent";

const compact = new Intl.NumberFormat("en-TH", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export type AxisScale = "amount" | "percent";

export function formatAxis(scale: AxisScale, value: number) {
  return scale === "percent" ? formatPercent(value) : compact.format(value);
}
