import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SalesOrderList } from "@/src/components/sales";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback, primaryButtonClass } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getSalesOrders } from "@/src/services/sales";
import { isoDate, positiveInteger, statusCode } from "@/src/utils/query";

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    customer?: string;
    rep?: string;
    from?: string;
    to?: string;
    page?: string;
  }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const params = await searchParams;
  const filters = {
    status: statusCode(params.status),
    customer: positiveInteger(params.customer),
    rep: positiveInteger(params.rep),
    from: isoDate(params.from),
    to: isoDate(params.to),
    page: positiveInteger(params.page) ?? 1,
  };
  const { data, error } = await getSalesOrders(filters);
  return (
    <AppShell active="sales">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading title="Sales orders" />
        {data && (
          <Link className={primaryButtonClass} href="/sales/orders/new">
            <Plus aria-hidden="true" className="size-4" />
            New sales order
          </Link>
        )}
      </div>
      {data ? (
        <SalesOrderList data={data} filters={filters} />
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to sales orders."
            : "Sales orders could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
