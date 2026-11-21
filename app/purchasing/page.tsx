import { redirect } from "next/navigation";
import {
  ApprovalQueue,
  HeldInvoiceList,
  PurchaseOrderList,
  SupplierScorecard,
} from "@/src/components/procurement";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import {
  getProcurementDashboard,
  getSupplierScorecard,
} from "@/src/services/procurement";
import { positiveInteger, statusCode } from "@/src/utils/query";

const messages: Record<string, string> = {
  rejected: "Requisition rejected.",
};

export default async function PurchasingPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    result?: string;
    page?: string;
    hold_page?: string;
    error?: string;
    number?: string;
  }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const params = await searchParams;
  const filters = {
    status: statusCode(params.status),
    page: positiveInteger(params.page) ?? 1,
    holdPage: positiveInteger(params.hold_page) ?? 1,
  };
  const [{ data, error }, scorecard] = await Promise.all([
    getProcurementDashboard(filters),
    getSupplierScorecard(),
  ]);
  const notice =
    params.result === "requested" && params.number
      ? `Requisition ${params.number} is waiting for approval.`
      : params.result
        ? messages[params.result]
        : undefined;
  return (
    <AppShell active="purchasing">
      <PageHeading title="Purchasing" />
      {params.error && <Feedback error>{params.error}</Feedback>}
      {notice && <Feedback>{notice}</Feedback>}
      {data ? (
        <>
          <ApprovalQueue requisitions={data.queue} />
          <PurchaseOrderList
            orders={data.orders}
            statuses={data.statuses}
            status={filters.status}
            page={filters.page}
            holdPage={filters.holdPage}
          />
          <HeldInvoiceList
            holds={data.holds}
            status={filters.status}
            page={filters.page}
            holdPage={filters.holdPage}
          />
          {scorecard.data && <SupplierScorecard scores={scorecard.data} />}
        </>
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to purchasing."
            : "Purchasing could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
