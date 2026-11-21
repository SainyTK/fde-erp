import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { PanelHeading, panelClass } from "@/src/components/ui";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatPercent } from "@/src/utils/formatPercent";

export function RevenueShare({
  id,
  icon,
  title,
  rows,
}: {
  id: string;
  icon: LucideIcon;
  title: string;
  rows: { key: string; label: string; amount: number; href: string }[];
}) {
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  return (
    <section className={panelClass} aria-labelledby={id}>
      <PanelHeading id={id} icon={icon} title={title} />
      <ul className="divide-line divide-y">
        {rows.map((row) => (
          <li key={row.key}>
            <Link
              className="hover:bg-canvas grid gap-2 px-4 py-3 sm:px-6"
              href={row.href}
            >
              <span className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
                <span className="text-brand font-medium underline">
                  {row.label}
                </span>
                <span className="tabular-nums">
                  {formatAmount(row.amount)}{" "}
                  <span className="text-muted">
                    {formatPercent(total ? row.amount / total : 0)}
                  </span>
                </span>
              </span>
              <span
                aria-hidden="true"
                className="bg-canvas block h-1.5 overflow-hidden rounded-full"
              >
                <span
                  className="bg-brand block h-full rounded-full"
                  style={{
                    width: `${total ? (row.amount / total) * 100 : 0}%`,
                  }}
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
