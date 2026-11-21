import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import {
  controlClass,
  DataTable,
  Pagination,
  PanelHeading,
  panelClass,
  primaryButtonClass,
  StatusBadge,
} from "@/src/components/ui";
import type { ProcurementDashboard } from "@/src/types/procurement";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";
import { formatStatus } from "@/src/utils/formatStatus";
import { queryString } from "@/src/utils/query";

export function PurchaseOrderList({
  orders,
  statuses,
  status,
  page,
  holdPage,
}: {
  orders: ProcurementDashboard["orders"];
  statuses: string[];
  status: string | null;
  page: number;
  holdPage: number;
}) {
  return (
    <section className={panelClass} aria-labelledby="purchase-orders">
      <PanelHeading
        id="purchase-orders"
        icon={ShoppingCart}
        title={`Purchase orders (${formatQuantity(orders.total)}, ${formatAmount(orders.value)})`}
      />
      <form className="border-line flex flex-wrap items-end gap-4 border-b p-4 sm:px-6">
        <label className="grid gap-1 text-sm">
          Status
          <select
            name="status"
            className={controlClass}
            defaultValue={status ?? ""}
          >
            <option value="">All statuses</option>
            <option value="NOT_RECEIVED">Open or partially received</option>
            {statuses.map((option) => (
              <option key={option} value={option}>
                {formatStatus(option)}
              </option>
            ))}
          </select>
        </label>
        <button className={primaryButtonClass} type="submit">
          Apply filters
        </button>
      </form>
      <DataTable
        label="Purchase orders"
        columns={[
          "Purchase order",
          "Supplier",
          "Order date",
          "Total",
          "Status",
        ]}
        numericColumns={["Total"]}
        rows={orders.rows.map((order) => ({
          id: order.id,
          cells: [
            <Link
              key="number"
              className="text-brand font-medium underline"
              href={`/purchasing/orders/${order.id}`}
            >
              {order.number}
            </Link>,
            order.supplier,
            order.date,
            formatAmount(order.total),
            <StatusBadge key="status" status={order.status} />,
          ],
        }))}
      />
      <Pagination
        page={page}
        size={orders.page_size}
        total={orders.total}
        href={(next) =>
          `/purchasing${queryString({ status, page: next, hold_page: holdPage === 1 ? null : holdPage })}`
        }
      />
    </section>
  );
}
