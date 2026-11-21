import { FileClock } from "lucide-react";
import { redirect } from "next/navigation";
import { AgeingBuckets, OpenInvoiceTable } from "@/src/components/receivables";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  Feedback,
  Pagination,
  PanelHeading,
  panelClass,
} from "@/src/components/ui";
import { ageingBuckets } from "@/src/constants/receivables";
import { getEligibleUser } from "@/src/services/auth";
import { getReceivables } from "@/src/services/receivables";
import { positiveInteger, queryString } from "@/src/utils/query";

export default async function ReceivablesPage({
  searchParams,
}: {
  searchParams: Promise<{ bucket?: string; page?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const params = await searchParams;
  const bucket =
    params.bucket && params.bucket in ageingBuckets ? params.bucket : null;
  const page = positiveInteger(params.page) ?? 1;
  const { data, error } = await getReceivables(bucket, page);
  return (
    <AppShell active="receivables">
      <PageHeading
        title="Receivables"
        description={data ? `As of ${data.as_of}` : null}
      />
      {data ? (
        <>
          <AgeingBuckets
            buckets={data.buckets}
            openAmount={data.open_amount}
            selected={bucket}
          />
          <section className={panelClass} aria-labelledby="open-invoices">
            <PanelHeading
              id="open-invoices"
              icon={FileClock}
              title={
                bucket
                  ? `Open invoices, ${ageingBuckets[bucket].toLowerCase()}`
                  : "Open invoices"
              }
            />
            <OpenInvoiceTable invoices={data.rows} showCustomer />
            <Pagination
              page={page}
              size={data.page_size}
              total={data.total}
              href={(next) =>
                `/receivables${queryString({ bucket, page: next })}`
              }
            />
          </section>
        </>
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to receivables."
            : "Receivables could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
