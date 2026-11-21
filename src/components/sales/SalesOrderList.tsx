import { ScrollText } from "lucide-react";
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
import type { SalesFilters, SalesOrderPage } from "@/src/types/sales";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatStatus } from "@/src/utils/formatStatus";
import { queryString } from "@/src/utils/query";

export function SalesOrderList({
  data,
  filters,
}: {
  data: SalesOrderPage;
  filters: SalesFilters;
}) {
  const { page: _page, ...query } = filters;
  return (
    <>
      <form
        className={`${panelClass} grid gap-4 p-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:items-end`}
      >
        <label className="grid gap-1 text-sm">
          Status
          <select
            name="status"
            className={controlClass}
            defaultValue={filters.status ?? ""}
          >
            <option value="">All statuses</option>
            {data.statuses.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Customer
          <select
            name="customer"
            className={controlClass}
            defaultValue={filters.customer ?? ""}
          >
            <option value="">All customers</option>
            {data.customers.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Sales rep
          <select
            name="rep"
            className={controlClass}
            defaultValue={filters.rep ?? ""}
          >
            <option value="">All sales reps</option>
            {data.reps.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          From
          <input
            name="from"
            type="date"
            className={controlClass}
            defaultValue={filters.from ?? ""}
          />
        </label>
        <label className="grid gap-1 text-sm">
          To
          <input
            name="to"
            type="date"
            className={controlClass}
            defaultValue={filters.to ?? ""}
          />
        </label>
        <div>
          <button className={primaryButtonClass} type="submit">
            Apply filters
          </button>
        </div>
      </form>
      <section className={panelClass} aria-labelledby="sales-orders">
        <PanelHeading
          id="sales-orders"
          icon={ScrollText}
          title={`Sales orders (${data.total.toLocaleString("en-TH")})`}
        />
        <DataTable
          label="Sales orders"
          columns={[
            "Order",
            "Order date",
            "Customer",
            "Sales rep",
            "Total",
            "Status",
          ]}
          numericColumns={["Total"]}
          rows={data.rows.map((order) => ({
            id: order.id,
            cells: [
              <Link
                key="number"
                className="text-brand font-medium whitespace-nowrap underline"
                href={`/sales/orders/${order.id}`}
              >
                {order.number}
              </Link>,
              <span key="date" className="whitespace-nowrap">
                {order.date}
              </span>,
              order.customer,
              <span key="rep" className="whitespace-nowrap">
                {order.rep}
              </span>,
              formatAmount(order.total),
              <StatusBadge key="status" status={order.status} />,
            ],
          }))}
        />
        <Pagination
          page={filters.page}
          size={data.page_size}
          total={data.total}
          href={(page) => `/sales${queryString({ ...query, page })}`}
        />
      </section>
    </>
  );
}
