import Link from "next/link";
import { DataTable, StatusBadge } from "@/src/components/ui";
import type { ReceivableInvoice } from "@/src/types/receivables";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";

export function OpenInvoiceTable({
  invoices,
  showCustomer,
}: {
  invoices: (Omit<ReceivableInvoice, "customer_id" | "customer"> &
    Partial<Pick<ReceivableInvoice, "customer_id" | "customer">>)[];
  showCustomer: boolean;
}) {
  return (
    <DataTable
      label="Open invoices"
      empty="No open invoices"
      columns={[
        "Invoice",
        ...(showCustomer ? ["Customer"] : []),
        "Due date",
        "Days overdue",
        "Outstanding",
        "Status",
      ]}
      numericColumns={["Days overdue", "Outstanding"]}
      rows={invoices.map((invoice) => ({
        id: invoice.id,
        cells: [
          <Link
            key="number"
            className="text-brand font-medium whitespace-nowrap underline"
            href={`/receivables/invoices/${invoice.id}`}
          >
            {invoice.number}
          </Link>,
          ...(showCustomer
            ? [
                <Link
                  key="customer"
                  className="text-brand block min-w-48 underline"
                  href={`/receivables/customers/${invoice.customer_id}`}
                >
                  {invoice.customer}
                </Link>,
              ]
            : []),
          <span key="due" className="whitespace-nowrap">
            {invoice.due_date}
          </span>,
          invoice.days_overdue > 0
            ? formatQuantity(invoice.days_overdue)
            : "Not due",
          formatAmount(invoice.outstanding),
          <StatusBadge key="status" status={invoice.status} />,
        ],
      }))}
    />
  );
}
