import Link from "next/link";
import { redirect } from "next/navigation";
import { SalesOrderForm } from "@/src/components/sales";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getSalesOrderForm } from "@/src/services/sales";

export default async function NewSalesOrderPage() {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const { data, error } = await getSalesOrderForm();
  return (
    <AppShell active="sales">
      <Link className="text-brand text-sm underline" href="/sales">
        Back to sales orders
      </Link>
      <PageHeading title="New sales order" />
      {data ? (
        <SalesOrderForm data={data} />
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to sales orders."
            : "The order form could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
