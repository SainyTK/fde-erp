import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RequisitionForm } from "@/src/components/procurement";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getRequisitionSuggestion } from "@/src/services/procurement";
import { positiveInteger, queryString } from "@/src/utils/query";

export default async function NewRequisitionPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; warehouse?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const query = await searchParams;
  const product = positiveInteger(query.product);
  const warehouse = positiveInteger(query.warehouse);
  if (!product || !warehouse) {
    notFound();
  }
  const { data } = await getRequisitionSuggestion(product, warehouse);
  return (
    <AppShell active="purchasing">
      <Link
        className="text-brand text-sm underline"
        href={`/stock${queryString({ warehouse, low: "on" })}`}
      >
        Back to stock
      </Link>
      <PageHeading title="Request purchase" />
      {data ? (
        <RequisitionForm
          product={product}
          warehouse={warehouse}
          suggestion={data}
        />
      ) : (
        <Feedback error>
          This item is not below its reorder point, has no supplier, or you do
          not have access to request purchases.
        </Feedback>
      )}
    </AppShell>
  );
}
