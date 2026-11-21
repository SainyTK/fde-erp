import { BookOpen } from "lucide-react";
import Link from "next/link";
import {
  DataTable,
  Facts,
  Pagination,
  PanelHeading,
  panelClass,
} from "@/src/components/ui";
import type { AccountLedger } from "@/src/types/accounting";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatNumber } from "@/src/utils/formatNumber";
import { queryString } from "@/src/utils/query";

export function LedgerTable({
  data,
  page,
}: {
  data: AccountLedger;
  page: number;
}) {
  return (
    <section className={panelClass} aria-labelledby="ledger">
      <PanelHeading
        id="ledger"
        icon={BookOpen}
        title={`${data.code} ${data.name} (THB)`}
      />
      <Facts
        items={[
          {
            label: `Opening balance, ${data.from}`,
            value: formatAmount(data.opening),
          },
          { label: "Debits", value: formatAmount(data.debit) },
          { label: "Credits", value: formatAmount(data.credit) },
          {
            label: `Closing balance, ${data.to}`,
            value: formatAmount(data.closing),
          },
        ]}
      />
      <DataTable
        label="Ledger entries"
        empty="No entries in this period"
        columns={["Date", "Entry", "Description", "Debit", "Credit", "Balance"]}
        numericColumns={["Debit", "Credit", "Balance"]}
        rows={data.rows.map((row) => ({
          id: row.id,
          cells: [
            <span key="date" className="whitespace-nowrap">
              {row.date}
            </span>,
            <span key="entry" className="whitespace-nowrap">
              {row.entry}
            </span>,
            row.link ? (
              <Link
                key="description"
                className="text-brand block min-w-56 underline"
                href={row.link}
              >
                {row.description}
              </Link>
            ) : (
              <span key="description" className="block min-w-56">
                {row.description}
              </span>
            ),
            row.debit ? formatNumber(row.debit) : "",
            row.credit ? formatNumber(row.credit) : "",
            formatNumber(row.balance),
          ],
        }))}
      />
      <Pagination
        page={page}
        size={data.page_size}
        total={data.total}
        href={(next) =>
          `/accounting/ledger/${data.code}${queryString({ from: data.from, to: data.to, page: next })}`
        }
      />
    </section>
  );
}
