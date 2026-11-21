import { Receipt } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountingTabs } from "@/src/components/accounting";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  controlClass,
  DataTable,
  Facts,
  Feedback,
  Pagination,
  PanelHeading,
  panelClass,
  primaryButtonClass,
} from "@/src/components/ui";
import { accountingPeriod } from "@/src/constants/accounting";
import { getEligibleUser } from "@/src/services/auth";
import { getRevenueAnalysis } from "@/src/services/management";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatNumber } from "@/src/utils/formatNumber";
import { formatQuantity } from "@/src/utils/formatQuantity";
import { isoDate, positiveInteger, queryString } from "@/src/utils/query";

export default async function RevenuePage({
  searchParams,
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    segment?: string;
    category?: string;
    customer?: string;
    page?: string;
  }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const params = await searchParams;
  const filters = {
    from: isoDate(params.from) ?? `${accountingPeriod.to.slice(0, 4)}-01-01`,
    to: isoDate(params.to) ?? accountingPeriod.to,
    segment:
      params.segment && /^[A-Za-z ]+$/.test(params.segment)
        ? params.segment
        : null,
    category: positiveInteger(params.category),
    customer: positiveInteger(params.customer),
    page: positiveInteger(params.page) ?? 1,
  };
  const { data, error } = await getRevenueAnalysis(filters);
  const { page: _page, ...query } = filters;
  return (
    <AppShell active="accounting">
      <PageHeading title="Accounting" />
      {data ? (
        <>
          <AccountingTabs active="revenue" />
          <form
            className={`${panelClass} grid gap-4 p-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:items-end`}
          >
            {filters.customer && (
              <input name="customer" type="hidden" value={filters.customer} />
            )}
            <label className="grid gap-1 text-sm">
              Customer segment
              <select
                className={controlClass}
                defaultValue={filters.segment ?? ""}
                name="segment"
              >
                <option value="">All segments</option>
                {data.segments.map((segment) => (
                  <option key={segment} value={segment}>
                    {segment}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              Product category
              <select
                className={controlClass}
                defaultValue={filters.category ?? ""}
                name="category"
              >
                <option value="">All categories</option>
                {data.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              From
              <input
                className={controlClass}
                defaultValue={filters.from}
                name="from"
                required
                type="date"
              />
            </label>
            <label className="grid gap-1 text-sm">
              To
              <input
                className={controlClass}
                defaultValue={filters.to}
                name="to"
                required
                type="date"
              />
            </label>
            <div className="lg:col-span-4">
              <button className={primaryButtonClass} type="submit">
                Apply filters
              </button>
            </div>
          </form>
          <section className={panelClass} aria-labelledby="revenue-lines">
            <PanelHeading
              id="revenue-lines"
              icon={Receipt}
              title={
                data.customer
                  ? `Revenue from ${data.customer} (THB)`
                  : "Revenue by invoice line (THB)"
              }
            />
            <Facts
              items={[
                {
                  label: "Revenue before VAT",
                  value: formatAmount(data.amount),
                },
                { label: "Invoice lines", value: formatQuantity(data.total) },
              ]}
            />
            <DataTable
              label="Revenue by invoice line"
              columns={[
                "Invoice date",
                "Invoice",
                "Customer",
                "Product",
                "Amount",
              ]}
              numericColumns={["Amount"]}
              rows={data.rows.map((row) => ({
                id: row.id,
                cells: [
                  <span key="date" className="whitespace-nowrap">
                    {row.date}
                  </span>,
                  <Link
                    key="invoice"
                    className="text-brand whitespace-nowrap underline"
                    href={`/receivables/invoices/${row.invoice_id}`}
                  >
                    {row.invoice}
                  </Link>,
                  <span key="customer" className="block min-w-40">
                    {row.customer}
                  </span>,
                  <span key="product" className="block min-w-48">
                    {row.sku} / {row.product}
                  </span>,
                  formatNumber(row.amount),
                ],
              }))}
            />
            <Pagination
              page={filters.page}
              size={data.page_size}
              total={data.total}
              href={(page) =>
                `/accounting/revenue${queryString({ ...query, page })}`
              }
            />
          </section>
        </>
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to accounting."
            : "Accounting could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
