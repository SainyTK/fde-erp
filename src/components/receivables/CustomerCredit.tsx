import { Gauge } from "lucide-react";
import { Facts, PanelHeading, panelClass } from "@/src/components/ui";
import type { CustomerReceivables } from "@/src/types/receivables";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatPercent } from "@/src/utils/formatPercent";
import { formatQuantity } from "@/src/utils/formatQuantity";

export function CustomerCredit({
  customer,
}: {
  customer: CustomerReceivables;
}) {
  const used = customer.open_invoices + customer.open_orders;
  const share = customer.credit_limit > 0 ? used / customer.credit_limit : 0;
  return (
    <section className={panelClass} aria-labelledby="credit">
      <PanelHeading
        id="credit"
        icon={Gauge}
        title="Credit and payment behaviour"
      />
      <div className="border-line border-b px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span>
            <span className="font-semibold tabular-nums">
              {formatAmount(used)}
            </span>{" "}
            <span className="text-muted">
              of {formatAmount(customer.credit_limit)} credit limit used
            </span>
          </span>
          <span
            className={share > 1 ? "text-danger font-semibold" : "text-muted"}
          >
            {formatPercent(share)}
          </span>
        </div>
        <div
          aria-hidden="true"
          className="bg-canvas border-line mt-2 h-2 overflow-hidden rounded-full border"
        >
          <div
            className={`h-full ${share > 1 ? "bg-danger" : "bg-brand"}`}
            style={{ width: `${Math.min(share, 1) * 100}%` }}
          />
        </div>
      </div>
      <Facts
        items={[
          {
            label: "Owed on invoices",
            value: formatAmount(customer.open_invoices),
          },
          { label: "Open orders", value: formatAmount(customer.open_orders) },
          {
            label: "Available credit",
            value: formatAmount(Math.max(customer.available, 0)),
          },
          {
            label: "Payment terms",
            value: `${customer.payment_terms_days} days`,
          },
          {
            label: "Paid invoices",
            value: formatQuantity(customer.paid_invoices),
          },
          {
            label: "Average days late",
            value:
              customer.average_days_late === null
                ? "No paid invoices"
                : formatQuantity(customer.average_days_late),
          },
          {
            label: "Paid on time",
            value: formatPercent(customer.on_time_rate),
          },
          { label: "Sales rep", value: customer.rep },
        ]}
      />
    </section>
  );
}
