import { ChartColumn, Percent } from "lucide-react";
import Link from "next/link";
import { ColumnChart, LineChart } from "@/src/components/charts";
import { PanelHeading, panelClass } from "@/src/components/ui";
import type { ManagementDashboard } from "@/src/types/management";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatPercent } from "@/src/utils/formatPercent";
import { incomeSummary } from "@/src/utils/incomeSummary";

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  timeZone: "UTC",
});

export function RevenueTrend({ data }: { data: ManagementDashboard }) {
  const months = data.months.map((month) => ({
    key: month.month,
    label: monthFormat.format(new Date(month.month)),
    revenue: month.revenue,
    margin: incomeSummary(month.revenue, month.cost_of_sales, 0).margin ?? 0,
  }));
  const margins = months.map((month) => month.margin);
  const statement = `/accounting/income-statement?year=${data.year}`;
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className={panelClass} aria-labelledby="monthly-revenue">
        <PanelHeading
          id="monthly-revenue"
          icon={ChartColumn}
          title={`Monthly revenue, ${data.year}`}
        />
        <div className="p-4 sm:px-6">
          <ColumnChart
            label="Monthly revenue"
            points={months.map((month) => ({
              key: month.key,
              label: month.label,
              value: month.revenue,
              display: formatAmount(month.revenue),
            }))}
            scale="amount"
          />
          <Link className="text-brand text-sm underline" href={statement}>
            Income statement
          </Link>
        </div>
      </section>
      <section className={panelClass} aria-labelledby="monthly-margin">
        <PanelHeading
          id="monthly-margin"
          icon={Percent}
          title={`Gross margin by month, ${data.year}`}
        />
        <div className="p-4 sm:px-6">
          <LineChart
            label="Gross margin by month"
            max={Math.ceil(Math.max(...margins) * 100 + 0.5) / 100}
            min={Math.floor(Math.min(...margins) * 100 - 0.5) / 100}
            points={months.map((month) => ({
              key: month.key,
              label: month.label,
              value: month.margin,
              display: formatPercent(month.margin),
            }))}
            scale="percent"
          />
          <Link className="text-brand text-sm underline" href={statement}>
            Income statement
          </Link>
        </div>
      </section>
    </div>
  );
}
