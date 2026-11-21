import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { SalesOrderFlow, SalesOrderOverview } from "@/src/components/sales";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getSalesOrder } from "@/src/services/sales";
import { positiveInteger } from "@/src/utils/query";

export default async function SalesOrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ order: string }>;
  searchParams: Promise<{ result?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const [{ order }, { result }] = await Promise.all([params, searchParams]);
  const id = positiveInteger(order);
  if (!id) {
    notFound();
  }
  const { data, error } = await getSalesOrder(id);
  if (!data && !error) {
    notFound();
  }
  return (
    <AppShell active="sales">
      <Link className="text-brand text-sm underline" href="/sales">
        Back to sales orders
      </Link>
      <PageHeading
        title={data?.number ?? "Sales order"}
        description={data ? `${data.customer_code} / ${data.customer}` : null}
      />
      {result === "created" && <Feedback>Sales order placed.</Feedback>}
      {data ? (
        <>
          <SalesOrderOverview order={data} />
          <SalesOrderFlow order={data} />
        </>
      ) : (
        <Feedback error>The sales order could not be loaded.</Feedback>
      )}
    </AppShell>
  );
}
