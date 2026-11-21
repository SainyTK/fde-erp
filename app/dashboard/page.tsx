import { Layers, Users } from "lucide-react";
import { redirect } from "next/navigation";
import {
  KpiTiles,
  RevenueShare,
  RevenueTrend,
  TopCustomers,
} from "@/src/components/management";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getManagementDashboard } from "@/src/services/management";
import { queryString } from "@/src/utils/query";

export default async function DashboardPage() {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const { data, error } = await getManagementDashboard();
  const revenueLink = (filter: Record<string, string | number>) =>
    data
      ? `/accounting/revenue${queryString({ ...filter, from: data.from, to: data.as_of })}`
      : "/accounting/revenue";
  return (
    <AppShell active="dashboard">
      <PageHeading
        title="Dashboard"
        description={data ? `${data.from} to ${data.as_of}` : null}
      />
      {data ? (
        <>
          <KpiTiles data={data} />
          <RevenueTrend data={data} />
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <RevenueShare
              icon={Users}
              id="segment-revenue"
              rows={data.segments.map((row) => ({
                key: row.segment,
                label: row.segment,
                amount: row.amount,
                href: revenueLink({ segment: row.segment }),
              }))}
              title="Revenue by customer segment"
            />
            <RevenueShare
              icon={Layers}
              id="category-revenue"
              rows={data.categories.map((row) => ({
                key: String(row.id),
                label: row.category,
                amount: row.amount,
                href: revenueLink({ category: row.id }),
              }))}
              title="Revenue by product category"
            />
          </div>
          <TopCustomers data={data} />
        </>
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to the dashboard."
            : "The dashboard could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
