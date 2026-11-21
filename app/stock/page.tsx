import { redirect } from "next/navigation";
import { AppShell, PageHeading } from "@/src/components/shell";
import { StockOverview } from "@/src/components/stock";
import { Feedback } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getStockDashboard } from "@/src/services/stock";
import { positiveInteger } from "@/src/utils/query";

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{
    warehouse?: string;
    category?: string;
    low?: string;
    page?: string;
  }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const params = await searchParams;
  const filters = {
    warehouse: positiveInteger(params.warehouse),
    category: positiveInteger(params.category),
    low: params.low === "on",
    page: positiveInteger(params.page) ?? 1,
  };
  const { data, error } = await getStockDashboard(filters);
  return (
    <AppShell active="stock">
      <PageHeading
        title="Stock"
        description={data ? `As of ${data.as_of}` : null}
      />
      {data ? (
        <StockOverview data={data} filters={filters} />
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to stock."
            : "Stock could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
