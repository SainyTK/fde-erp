import { StatLink } from "@/src/components/ui";
import type { ManagementDashboard } from "@/src/types/management";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatPercent } from "@/src/utils/formatPercent";
import { formatQuantity } from "@/src/utils/formatQuantity";
import { incomeSummary } from "@/src/utils/incomeSummary";

export function KpiTiles({ data }: { data: ManagementDashboard }) {
  const { margin } = incomeSummary(data.revenue, data.cost_of_sales, 0);
  const statement = `/accounting/income-statement?year=${data.year}`;
  return (
    <nav
      aria-label="Key figures"
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5"
    >
      <StatLink
        href={statement}
        label="Revenue, year to date"
        value={formatAmount(data.revenue)}
      />
      <StatLink
        href={statement}
        label="Gross margin, year to date"
        value={formatPercent(margin)}
      />
      <StatLink
        href="/receivables"
        label="Open receivables"
        value={formatAmount(data.open_receivables)}
      />
      <StatLink
        href="/stock"
        label="Stock value"
        value={formatAmount(data.stock_value)}
      />
      <StatLink
        detail={formatAmount(data.open_purchase_value)}
        href="/purchasing?status=NOT_RECEIVED"
        label="Open purchase orders"
        value={formatQuantity(data.open_purchase_orders)}
      />
    </nav>
  );
}
