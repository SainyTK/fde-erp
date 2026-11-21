export const accountingPeriod = { from: "2025-01-01", to: "2026-10-31" };

export const accountingViews = [
  { id: "trial-balance", label: "Trial balance", href: "/accounting" },
  {
    id: "income-statement",
    label: "Income statement",
    href: "/accounting/income-statement",
  },
  { id: "ledger", label: "Account ledger", href: "/accounting/ledger/1100" },
  { id: "revenue", label: "Revenue", href: "/accounting/revenue" },
] as const;
