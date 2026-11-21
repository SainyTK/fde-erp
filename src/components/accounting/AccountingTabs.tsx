import Link from "next/link";
import { accountingViews } from "@/src/constants/accounting";

export function AccountingTabs({
  active,
}: {
  active: (typeof accountingViews)[number]["id"];
}) {
  return (
    <nav
      aria-label="Accounting reports"
      className="border-line flex flex-wrap gap-1 border-b"
    >
      {accountingViews.map((view) => (
        <Link
          aria-current={view.id === active ? "page" : undefined}
          className="text-muted hover:text-ink aria-[current=page]:border-brand aria-[current=page]:text-ink -mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium"
          href={view.href}
          key={view.id}
        >
          {view.label}
        </Link>
      ))}
    </nav>
  );
}
