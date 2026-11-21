import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  OrderInvoices,
  OrderLines,
  OrderReceipts,
  OrderRequisition,
} from "@/src/components/procurement";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getPurchaseOrder } from "@/src/services/procurement";
import { positiveInteger } from "@/src/utils/query";

const messages: Record<string, string> = {
  created:
    "Purchase order created automatically because the amount is under THB 50,000.",
  approved: "Requisition approved and purchase order created.",
};

export default async function PurchaseOrderPage({
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
  const { data, error } = await getPurchaseOrder(id);
  if (!data && !error) {
    notFound();
  }
  const notice = result ? messages[result] : undefined;
  return (
    <AppShell active="purchasing">
      <Link className="text-brand text-sm underline" href="/purchasing">
        Back to purchasing
      </Link>
      <PageHeading
        title={data?.number ?? "Purchase order"}
        description={data?.supplier}
      />
      {notice && <Feedback>{notice}</Feedback>}
      {data ? (
        <>
          <OrderRequisition requisition={data.requisition} />
          <OrderLines order={data} />
          <OrderReceipts receipts={data.receipts} />
          <OrderInvoices invoices={data.invoices} />
        </>
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to purchasing."
            : "The purchase order could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
