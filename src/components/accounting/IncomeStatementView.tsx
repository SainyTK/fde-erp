import { ListTree, TrendingUp } from "lucide-react";
import Link from "next/link";
import { DataTable, PanelHeading, panelClass } from "@/src/components/ui";
import type { IncomeStatement } from "@/src/types/accounting";
import { formatNumber } from "@/src/utils/formatNumber";
import { formatPercent } from "@/src/utils/formatPercent";
import { incomeSummary } from "@/src/utils/incomeSummary";

const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function IncomeStatementView({ data }: { data: IncomeStatement }) {
  const total = data.months.reduce(
    (sum, month) => ({
      revenue: sum.revenue + month.revenue,
      cost_of_sales: sum.cost_of_sales + month.cost_of_sales,
      other_expenses: sum.other_expenses + month.other_expenses,
    }),
    { revenue: 0, cost_of_sales: 0, other_expenses: 0 },
  );
  const rows = [
    ...data.months.map((month) => ({
      id: month.month,
      label: monthFormat.format(new Date(month.month)),
      ...month,
    })),
    { id: "total", label: `${data.year} total`, ...total },
  ];
  return (
    <>
      <section className={panelClass} aria-labelledby="monthly-income">
        <PanelHeading
          id="monthly-income"
          icon={TrendingUp}
          title={`Monthly income statement, ${data.year} (THB)`}
        />
        <DataTable
          label="Monthly income statement"
          columns={[
            "Month",
            "Revenue",
            "Cost of sales",
            "Gross profit",
            "Gross margin",
            "Other expenses",
            "Net income",
          ]}
          numericColumns={[
            "Revenue",
            "Cost of sales",
            "Gross profit",
            "Gross margin",
            "Other expenses",
            "Net income",
          ]}
          rows={rows.map((row) => {
            const result = incomeSummary(
              row.revenue,
              row.cost_of_sales,
              row.other_expenses,
            );
            const strong = row.id === "total" ? "font-semibold" : "";
            return {
              id: row.id,
              cells: [
                <span key="month" className={`whitespace-nowrap ${strong}`}>
                  {row.label}
                </span>,
                <span key="revenue" className={strong}>
                  {formatNumber(row.revenue)}
                </span>,
                <span key="cogs" className={strong}>
                  {formatNumber(row.cost_of_sales)}
                </span>,
                <span key="gross" className={strong}>
                  {formatNumber(result.grossProfit)}
                </span>,
                <span key="margin" className={strong}>
                  {formatPercent(result.margin)}
                </span>,
                <span key="other" className={strong}>
                  {formatNumber(row.other_expenses)}
                </span>,
                <span
                  key="net"
                  className={`${strong} ${result.netIncome < 0 ? "text-danger" : ""}`}
                >
                  {formatNumber(result.netIncome)}
                </span>,
              ],
            };
          })}
        />
      </section>
      <section className={panelClass} aria-labelledby="account-totals">
        <PanelHeading
          id="account-totals"
          icon={ListTree}
          title={`Revenue and expense accounts, ${data.year} (THB)`}
        />
        <DataTable
          label="Revenue and expense accounts"
          columns={["Account", "Amount"]}
          numericColumns={["Amount"]}
          rows={data.accounts.map((account) => ({
            id: account.code,
            cells: [
              <Link
                key="account"
                className="text-brand underline"
                href={`/accounting/ledger/${account.code}?from=${data.year}-01-01&to=${data.year}-12-31`}
              >
                {account.code} {account.name}
              </Link>,
              formatNumber(account.amount),
            ],
          }))}
        />
      </section>
    </>
  );
}
