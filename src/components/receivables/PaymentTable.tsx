import Link from "next/link";
import { DataTable } from "@/src/components/ui";
import type { CustomerPayment } from "@/src/types/receivables";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatStatus } from "@/src/utils/formatStatus";

export function PaymentTable({
  payments,
}: {
  payments: (CustomerPayment & { invoice?: string; invoice_id?: number })[];
}) {
  const showInvoice = payments.some((payment) => payment.invoice);
  return (
    <DataTable
      label="Payments"
      empty="No payments yet"
      columns={[
        "Payment",
        "Date",
        ...(showInvoice ? ["Invoice"] : []),
        "Method",
        "Amount",
      ]}
      numericColumns={["Amount"]}
      rows={payments.map((payment) => ({
        id: payment.id,
        cells: [
          <span key="number" className="whitespace-nowrap">
            {payment.number}
          </span>,
          <span key="date" className="whitespace-nowrap">
            {payment.date}
          </span>,
          ...(showInvoice
            ? [
                <Link
                  key="invoice"
                  className="text-brand whitespace-nowrap underline"
                  href={`/receivables/invoices/${payment.invoice_id}`}
                >
                  {payment.invoice}
                </Link>,
              ]
            : []),
          formatStatus(payment.method),
          formatAmount(payment.amount),
        ],
      }))}
    />
  );
}
