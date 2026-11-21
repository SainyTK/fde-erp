import { ShoppingCart } from "lucide-react";
import {
  DataTable,
  Facts,
  PanelHeading,
  panelClass,
  StatusBadge,
} from "@/src/components/ui";
import type { PurchaseOrderDetail } from "@/src/types/procurement";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";

export function OrderLines({ order }: { order: PurchaseOrderDetail }) {
  return (
    <section className={panelClass} aria-labelledby="order-lines">
      <PanelHeading
        id="order-lines"
        icon={ShoppingCart}
        title="2. Purchase order"
      />
      <Facts
        items={[
          { label: "Order date", value: order.date },
          { label: "Expected", value: order.expected },
          { label: "Total including VAT", value: formatAmount(order.total) },
          { label: "Status", value: <StatusBadge status={order.status} /> },
        ]}
      />
      <DataTable
        label="Purchase order lines"
        columns={["Product", "Ordered", "Received", "Unit cost", "Line total"]}
        numericColumns={["Ordered", "Received", "Unit cost", "Line total"]}
        rows={order.lines.map((line) => ({
          id: line.id,
          cells: [
            `${line.sku} / ${line.product}`,
            formatQuantity(line.quantity),
            formatQuantity(line.received),
            formatAmount(line.unit_cost),
            formatAmount(line.quantity * line.unit_cost),
          ],
        }))}
      />
    </section>
  );
}
