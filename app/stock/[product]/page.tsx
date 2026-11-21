import { ArrowLeftRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  DataTable,
  Feedback,
  Pagination,
  PanelHeading,
  panelClass,
} from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getStockMovements } from "@/src/services/stock";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";
import { formatStatus } from "@/src/utils/formatStatus";
import { positiveInteger, queryString } from "@/src/utils/query";

export default async function StockMovementsPage({
  params,
  searchParams,
}: {
  params: Promise<{ product: string }>;
  searchParams: Promise<{ warehouse?: string; page?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const [{ product }, query] = await Promise.all([params, searchParams]);
  const id = positiveInteger(product);
  if (!id) {
    notFound();
  }
  const warehouse = positiveInteger(query.warehouse);
  const page = positiveInteger(query.page) ?? 1;
  const { data, error } = await getStockMovements(id, warehouse, page);
  if (!data && !error) {
    notFound();
  }
  return (
    <AppShell active="stock">
      <Link
        className="text-brand text-sm underline"
        href={`/stock${queryString({ warehouse })}`}
      >
        Back to stock
      </Link>
      <PageHeading
        title={data?.name ?? "Stock movements"}
        description={data?.sku}
      />
      {data ? (
        <section className={panelClass} aria-labelledby="movements">
          <PanelHeading
            id="movements"
            icon={ArrowLeftRight}
            title="Stock movements"
          />
          <DataTable
            label="Stock movements"
            columns={["Date", "Movement", "Warehouse", "Quantity", "Unit cost"]}
            numericColumns={["Quantity", "Unit cost"]}
            rows={data.rows.map((row) => ({
              id: row.id,
              cells: [
                row.date,
                formatStatus(row.type),
                row.warehouse,
                formatQuantity(row.quantity),
                formatAmount(row.unit_cost),
              ],
            }))}
          />
          <Pagination
            page={page}
            size={data.page_size}
            total={data.total}
            href={(next) =>
              `/stock/${id}${queryString({ warehouse, page: next })}`
            }
          />
        </section>
      ) : (
        <Feedback error>Stock movements could not be loaded.</Feedback>
      )}
    </AppShell>
  );
}
