import Link from "next/link";
import type { ReactNode } from "react";

export function StatLink({
  href,
  label,
  value,
  detail,
  current = false,
}: {
  href: string;
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  current?: boolean;
}) {
  return (
    <Link
      aria-current={current ? "page" : undefined}
      className="border-line bg-surface hover:bg-brand-soft aria-[current=page]:border-brand aria-[current=page]:bg-brand-soft grid min-w-0 content-start gap-1 rounded-xl border p-4 outline-offset-2"
      href={href}
    >
      <span className="text-muted text-sm">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
      {detail && (
        <span className="text-muted text-sm tabular-nums">{detail}</span>
      )}
    </Link>
  );
}
