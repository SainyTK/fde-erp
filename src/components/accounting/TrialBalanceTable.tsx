import { Scale } from "lucide-react";
import Link from "next/link";
import { DataTable, PanelHeading, panelClass } from "@/src/components/ui";
import type { TrialBalance } from "@/src/types/accounting";
import { formatNumber } from "@/src/utils/formatNumber";
import { formatStatus } from "@/src/utils/formatStatus";

export function TrialBalanceTable({ data }: { data: TrialBalance }) {
  const balanced = data.debit_balance === data.credit_balance;
  return (
    <section className={panelClass} aria-labelledby="trial-balance">
      <PanelHeading
        id="trial-balance"
        icon={Scale}
        title={`Trial balance as of ${data.as_of} (THB)`}
      />
      <DataTable
        label="Trial balance"
        columns={["Account", "Type", "Debit", "Credit"]}
        numericColumns={["Debit", "Credit"]}
        rows={[
          ...data.rows.map((row) => ({
            id: row.code,
            cells: [
              <Link
                key="account"
                className="text-brand underline"
                href={`/accounting/ledger/${row.code}`}
              >
                {row.code} {row.name}
              </Link>,
              formatStatus(row.type),
              row.debit_balance ? formatNumber(row.debit_balance) : "",
              row.credit_balance ? formatNumber(row.credit_balance) : "",
            ],
          })),
          {
            id: "total",
            cells: [
              <span key="label" className="font-semibold">
                Total
              </span>,
              <span
                key="state"
                className={balanced ? "text-brand" : "text-danger"}
              >
                {balanced ? "Balanced" : "Out of balance"}
              </span>,
              <span key="debit" className="font-semibold">
                {formatNumber(data.debit_balance)}
              </span>,
              <span key="credit" className="font-semibold">
                {formatNumber(data.credit_balance)}
              </span>,
            ],
          },
        ]}
      />
    </section>
  );
}
