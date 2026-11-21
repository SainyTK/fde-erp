import { ScrollText } from "lucide-react";
import {
  DataTable,
  Facts,
  PanelHeading,
  panelClass,
  StatusBadge,
} from "@/src/components/ui";
import type { SalesOrderDetail } from "@/src/types/sales";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";

export function SalesOrderOverview({ order }: { order: SalesOrderDetail }) {
  return (
    <section className={panelClass} aria-labelledby="sales-order">
      <PanelHeading id="sales-order" icon={ScrollText} title="1. Sales order" />
      <Facts
        items={[
          { label: "Order date", value: order.date },
          { label: "Requested", value: order.requested },
          { label: "Sales rep", value: order.rep },
          { label: "Warehouse", value: order.warehouse },
          { label: "Status", value: <StatusBadge status={order.status} /> },
          ...(order.cancelled
            ? [
                {
                  label: "Cancelled",
                  value: `${order.cancelled}${order.cancel_reason ? `, ${order.cancel_reason}` : ""}`,
                },
              ]
            : []),
        ]}
      />
      <DataTable
        label="Sales order lines"
        columns={[
          "Product",
          "Quantity",
          "List price",
          "Discount",
          "Line total",
        ]}
        numericColumns={["Quantity", "List price", "Discount", "Line total"]}
        rows={order.lines.map((line) => ({
          id: line.id,
          cells: [
            `${line.sku} / ${line.product}`,
            formatQuantity(line.quantity),
            formatAmount(line.unit_price),
            `${formatQuantity(line.discount)}%`,
            formatAmount(line.amount),
          ],
        }))}
      />
      <dl className="border-line grid gap-2 border-t p-4 text-sm sm:px-6 sm:pl-[calc(100%-24rem)]">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Subtotal</dt>
          <dd className="tabular-nums">{formatAmount(order.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">VAT 7%</dt>
          <dd className="tabular-nums">{formatAmount(order.vat)}</dd>
        </div>
        <div className="flex justify-between gap-4 text-base font-semibold">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatAmount(order.total)}</dd>
        </div>
      </dl>
    </section>
  );
}
