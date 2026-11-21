import { FileWarning } from "lucide-react";
import Link from "next/link";
import {
  DataTable,
  Pagination,
  PanelHeading,
  panelClass,
  StatusBadge,
} from "@/src/components/ui";
import type { ProcurementDashboard } from "@/src/types/procurement";
import { queryString } from "@/src/utils/query";

export function HeldInvoiceList({
  holds,
  status,
  page,
  holdPage,
}: {
  holds: ProcurementDashboard["holds"];
  status: string | null;
  page: number;
  holdPage: number;
}) {
  return (
    <section className={panelClass} aria-labelledby="held-invoices">
      <PanelHeading
        id="held-invoices"
        icon={FileWarning}
        title="Supplier invoices on hold"
      />
      <DataTable
        label="Supplier invoices on hold"
        empty="No invoices on hold"
        columns={[
          "Invoice",
          "Supplier",
          "Purchase order",
          "Match",
          "Hold reason",
        ]}
        rows={holds.rows.map((invoice) => ({
          id: invoice.id,
          cells: [
            <span key="number" className="whitespace-nowrap">
              {invoice.number}
            </span>,
            invoice.supplier,
            <Link
              key="order"
              className="text-brand underline"
              href={`/purchasing/orders/${invoice.order_id}`}
            >
              View order
            </Link>,
            <StatusBadge key="match" status={invoice.match_status} />,
            invoice.hold_reason,
          ],
        }))}
      />
      <Pagination
        page={holdPage}
        size={holds.page_size}
        total={holds.total}
        href={(next) =>
          `/purchasing${queryString({ status, page: page === 1 ? null : page, hold_page: next })}`
        }
      />
    </section>
  );
}
