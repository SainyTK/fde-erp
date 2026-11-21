import { FileClock, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CustomerCredit,
  OpenInvoiceTable,
  PaymentTable,
} from "@/src/components/receivables";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback, PanelHeading, panelClass } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getCustomerReceivables } from "@/src/services/receivables";
import { positiveInteger } from "@/src/utils/query";

export default async function CustomerReceivablesPage({
  params,
}: {
  params: Promise<{ customer: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const id = positiveInteger((await params).customer);
  if (!id) {
    notFound();
  }
  const { data, error } = await getCustomerReceivables(id);
  if (!data && !error) {
    notFound();
  }
  return (
    <AppShell active="receivables">
      <Link className="text-brand text-sm underline" href="/receivables">
        Back to receivables
      </Link>
      <PageHeading
        title={data?.name ?? "Customer"}
        description={
          data ? `${data.code} / ${data.segment} / ${data.province}` : null
        }
      />
      {data ? (
        <>
          <CustomerCredit customer={data} />
          <section className={panelClass} aria-labelledby="customer-invoices">
            <PanelHeading
              id="customer-invoices"
              icon={FileClock}
              title="Open invoices"
            />
            <OpenInvoiceTable invoices={data.invoices} showCustomer={false} />
          </section>
          <section className={panelClass} aria-labelledby="customer-payments">
            <PanelHeading
              id="customer-payments"
              icon={Wallet}
              title="Recent payments"
            />
            <PaymentTable payments={data.payments} />
          </section>
        </>
      ) : (
        <Feedback error>The customer could not be loaded.</Feedback>
      )}
    </AppShell>
  );
}
