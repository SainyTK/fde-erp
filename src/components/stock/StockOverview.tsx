import { Boxes, CalendarRange, TrendingDown } from "lucide-react";
import Link from "next/link";
import {
  controlClass,
  DataTable,
  Facts,
  Pagination,
  PanelHeading,
  panelClass,
  primaryButtonClass,
  StatusBadge,
} from "@/src/components/ui";
import type { StockDashboard, StockFilters } from "@/src/types/stock";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";
import { latestMonthTotal } from "@/src/utils/latestMonthTotal";
import { queryString } from "@/src/utils/query";

export function StockOverview({
  data,
  filters,
}: {
  data: StockDashboard;
  filters: StockFilters;
}) {
  const options = {
    warehouse: filters.warehouse,
    category: filters.category,
    low: filters.low ? "on" : null,
  };
  return (
    <>
      <form
        className={`${panelClass} flex flex-wrap items-end gap-4 p-4 sm:px-6`}
      >
        <label className="grid gap-1 text-sm">
          Warehouse
          <select
            name="warehouse"
            className={controlClass}
            defaultValue={filters.warehouse ?? ""}
          >
            <option value="">All warehouses</option>
            {data.warehouses.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Category
          <select
            name="category"
            className={controlClass}
            defaultValue={filters.category ?? ""}
          >
            <option value="">All categories</option>
            {data.categories.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm">
          <input type="checkbox" name="low" defaultChecked={filters.low} />{" "}
          Below reorder point
        </label>
        <button className={primaryButtonClass} type="submit">
          Apply filters
        </button>
      </form>
      <section className={panelClass} aria-labelledby="positions">
        <PanelHeading id="positions" icon={Boxes} title="Stock on hand" />
        <Facts
          items={[
            {
              label: "Stock value",
              value: formatAmount(latestMonthTotal(data.months)),
            },
            { label: "Positions", value: formatQuantity(data.total) },
          ]}
        />
        <DataTable
          label="Stock on hand"
          columns={[
            "Product",
            ...(filters.warehouse ? [] : ["Warehouse"]),
            "On hand",
            "Stock value",
            "Reorder point",
            "Days of cover",
            "Stock status",
            ...(data.can_request ? ["Purchasing"] : []),
          ]}
          numericColumns={[
            "On hand",
            "Stock value",
            "Reorder point",
            "Days of cover",
          ]}
          rows={data.rows.map((row) => ({
            id: `${row.product_id}-${row.warehouse_id}`,
            cells: [
              <div key="product" className="min-w-52">
                <Link
                  className="text-brand font-medium underline"
                  href={`/stock/${row.product_id}${queryString({ warehouse: row.warehouse_id })}`}
                >
                  {row.sku}
                </Link>
                <p className="text-muted">{row.product}</p>
              </div>,
              ...(filters.warehouse ? [] : [row.warehouse]),
              formatQuantity(row.quantity),
              formatAmount(row.value),
              formatQuantity(row.reorder_point),
              row.days_of_cover === null
                ? "No sales in 90 days"
                : formatQuantity(row.days_of_cover),
              <StatusBadge key="status" status={row.stock_status} />,
              ...(data.can_request
                ? [
                    row.low ? (
                      <Link
                        key="request"
                        className="text-brand whitespace-nowrap underline"
                        href={`/purchasing/requisitions/new${queryString({ product: row.product_id, warehouse: row.warehouse_id })}`}
                      >
                        Request purchase
                      </Link>
                    ) : null,
                  ]
                : []),
            ],
          }))}
        />
        <Pagination
          page={filters.page}
          size={data.page_size}
          total={data.total}
          href={(page) => `/stock${queryString({ ...options, page })}`}
        />
      </section>
      <section className={panelClass} aria-labelledby="shrinkage">
        <PanelHeading
          id="shrinkage"
          icon={TrendingDown}
          title="Shrinkage, last 12 months"
        />
        <DataTable
          label="Shrinkage, last 12 months"
          columns={[
            "Warehouse",
            "Units written off",
            "Value written off",
            "Net adjustment",
          ]}
          numericColumns={[
            "Units written off",
            "Value written off",
            "Net adjustment",
          ]}
          rows={data.shrinkage.map((row) => ({
            id: row.warehouse_id,
            cells: [
              row.warehouse,
              formatQuantity(row.units_lost),
              formatAmount(row.value_lost),
              formatAmount(row.net_value),
            ],
          }))}
        />
      </section>
      <section className={panelClass} aria-labelledby="monthly-value">
        <PanelHeading
          id="monthly-value"
          icon={CalendarRange}
          title="Monthly stock value"
        />
        <DataTable
          label="Monthly stock value"
          columns={["Month", "Warehouse", "Stock value"]}
          numericColumns={["Stock value"]}
          rows={data.months.map((row) => ({
            id: `${row.month}-${row.warehouse_id}`,
            cells: [
              row.month.slice(0, 7),
              row.warehouse,
              formatAmount(row.value),
            ],
          }))}
        />
      </section>
    </>
  );
}
