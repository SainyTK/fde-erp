import { ReceiptText, Truck, Wallet } from "lucide-react";
import {
  DataTable,
  PanelHeading,
  panelClass,
  StatusBadge,
} from "@/src/components/ui";
import type { SalesOrderDetail } from "@/src/types/sales";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatStatus } from "@/src/utils/formatStatus";

export function SalesOrderFlow({ order }: { order: SalesOrderDetail }) {
  const payments = order.invoices.flatMap((invoice) =>
    invoice.payments.map((payment) => ({
      ...payment,
      invoice: invoice.number,
    })),
  );
  return (
    <>
      <section className={panelClass} aria-labelledby="deliveries">
        <PanelHeading id="deliveries" icon={Truck} title="2. Deliveries" />
        <DataTable
          label="Deliveries"
          empty="Not delivered yet"
          columns={["Delivery", "Ship date", "Warehouse"]}
          rows={order.deliveries.map((delivery) => ({
            id: delivery.id,
            cells: [delivery.number, delivery.date, delivery.warehouse],
          }))}
        />
      </section>
      <section className={panelClass} aria-labelledby="invoices">
        <PanelHeading id="invoices" icon={ReceiptText} title="3. Invoices" />
        <DataTable
          label="Invoices"
          empty="Not invoiced yet"
          columns={[
            "Invoice",
            "Invoice date",
            "Due date",
            "Delivery",
            "Total",
            "Status",
          ]}
          numericColumns={["Total"]}
          rows={order.invoices.map((invoice) => ({
            id: invoice.id,
            cells: [
              invoice.number,
              invoice.date,
              invoice.due,
              invoice.delivery ?? "",
              formatAmount(invoice.total),
              <StatusBadge key="status" status={invoice.status} />,
            ],
          }))}
        />
      </section>
      <section className={panelClass} aria-labelledby="payments">
        <PanelHeading id="payments" icon={Wallet} title="4. Payments" />
        <DataTable
          label="Customer payments"
          empty="No payments yet"
          columns={["Payment", "Date", "Invoice", "Method", "Amount"]}
          numericColumns={["Amount"]}
          rows={payments.map((payment) => ({
            id: payment.id,
            cells: [
              payment.number,
              payment.date,
              payment.invoice,
              formatStatus(payment.method),
              formatAmount(payment.amount),
            ],
          }))}
        />
      </section>
    </>
  );
}
