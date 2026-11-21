import { type StatusTone, statusTone } from "@/src/constants/status";
import { formatStatus } from "@/src/utils/formatStatus";

const toneClass: Record<StatusTone, string> = {
  positive: "border-brand/20 bg-brand-soft text-brand",
  negative: "border-danger/20 bg-danger-soft text-danger",
  neutral: "border-line bg-canvas text-ink",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${toneClass[statusTone(status)]}`}
    >
      {formatStatus(status)}
    </span>
  );
}
