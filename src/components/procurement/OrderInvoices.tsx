import { ReceiptText, Wallet } from "lucide-react";
import {
  DataTable,
  Facts,
  PanelHeading,
  panelClass,
  StatusBadge,
} from "@/src/components/ui";
import type { PurchaseOrderDetail } from "@/src/types/procurement";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatStatus } from "@/src/utils/formatStatus";

export function OrderInvoices({
  invoices,
}: {
  invoices: PurchaseOrderDetail["invoices"];
}) {
  const payments = invoices.flatMap((invoice) =>
    invoice.payments.map((payment) => ({
      ...payment,
      invoice: invoice.number,
    })),
  );
  return (
    <>
      <section className={panelClass} aria-labelledby="invoices">
        <PanelHeading
          id="invoices"
          icon={ReceiptText}
          title="4. Supplier invoices and three-way match"
        />
        {invoices.length === 0 ? (
          <p className="text-muted p-4 text-sm sm:px-6">No invoices yet</p>
        ) : (
          <ul className="divide-line divide-y">
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                <div className="flex flex-wrap items-center gap-2 px-4 pt-4 sm:px-6">
                  <p className="font-semibold">
                    {invoice.number}
                    <span className="text-muted font-normal">
                      {" "}
                      / {invoice.date}
                      {invoice.receipt && ` / for ${invoice.receipt}`}
                    </span>
                  </p>
                  <StatusBadge status={invoice.match} />
                  <StatusBadge status={invoice.status} />
                </div>
                {invoice.reason && (
                  <p className="text-danger px-4 pt-2 text-sm sm:px-6">
                    {invoice.reason}
                  </p>
                )}
                <Facts
                  items={[
                    {
                      label: "Receipt value before VAT",
                      value: formatAmount(invoice.receipt_value),
                    },
                    { label: "Billed", value: formatAmount(invoice.billed) },
                    {
                      label: "Approved to pay",
                      value: formatAmount(invoice.approved),
                    },
                    {
                      label: "Resolution",
                      value: invoice.resolution
                        ? formatStatus(invoice.resolution)
                        : "Not resolved",
                    },
                  ]}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={panelClass} aria-labelledby="payments">
        <PanelHeading id="payments" icon={Wallet} title="5. Payments" />
        <DataTable
          label="Supplier payments"
          empty="No payments yet"
          columns={["Payment", "Date", "Invoice", "Amount"]}
          numericColumns={["Amount"]}
          rows={payments.map((payment) => ({
            id: payment.id,
            cells: [
              payment.number,
              payment.date,
              payment.invoice,
              formatAmount(payment.amount),
            ],
          }))}
        />
      </section>
    </>
  );
}
