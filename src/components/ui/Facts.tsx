import type { ReactNode } from "react";

export function Facts({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid gap-4 p-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      {items.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-muted text-sm">{label}</dt>
          <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
