import { ReceiptText, Wallet } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PaymentForm, PaymentTable } from "@/src/components/receivables";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  Facts,
  Feedback,
  PanelHeading,
  panelClass,
  StatusBadge,
} from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getReceivableInvoice } from "@/src/services/receivables";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";
import { positiveInteger } from "@/src/utils/query";

export default async function ReceivableInvoicePage({
  params,
  searchParams,
}: {
  params: Promise<{ invoice: string }>;
  searchParams: Promise<{ result?: string; error?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const [{ invoice }, query] = await Promise.all([params, searchParams]);
  const id = positiveInteger(invoice);
  if (!id) {
    notFound();
  }
  const { data, error } = await getReceivableInvoice(id);
  if (!data && !error) {
    notFound();
  }
  return (
    <AppShell active="receivables">
      <Link
        className="text-brand text-sm underline"
        href={
          data ? `/receivables/customers/${data.customer_id}` : "/receivables"
        }
      >
        {data ? `Back to ${data.customer}` : "Back to receivables"}
      </Link>
      <PageHeading
        title={data?.number ?? "Invoice"}
        description={data?.customer}
      />
      {query.error && <Feedback error>{query.error}</Feedback>}
      {query.result === "recorded" && <Feedback>Payment recorded.</Feedback>}
      {data ? (
        <>
          <section className={panelClass} aria-labelledby="invoice">
            <PanelHeading id="invoice" icon={ReceiptText} title="Invoice" />
            <Facts
              items={[
                { label: "Invoice date", value: data.invoice_date },
                { label: "Due date", value: data.due_date },
                {
                  label: "Days overdue",
                  value:
                    data.days_overdue > 0
                      ? formatQuantity(data.days_overdue)
                      : "Not due",
                },
                { label: "Sales order", value: data.order ?? "None" },
                { label: "Invoice total", value: formatAmount(data.total) },
                { label: "Outstanding", value: formatAmount(data.outstanding) },
                {
                  label: "Status",
                  value: <StatusBadge status={data.status} />,
                },
              ]}
            />
          </section>
          {data.can_record && data.outstanding > 0 && (
            <PaymentForm invoice={data} />
          )}
          <section className={panelClass} aria-labelledby="invoice-payments">
            <PanelHeading
              id="invoice-payments"
              icon={Wallet}
              title="Payments"
            />
            <PaymentTable payments={data.payments} />
          </section>
        </>
      ) : (
        <Feedback error>The invoice could not be loaded.</Feedback>
      )}
    </AppShell>
  );
}
