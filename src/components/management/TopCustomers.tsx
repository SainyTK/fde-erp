import { Trophy } from "lucide-react";
import Link from "next/link";
import { DataTable, PanelHeading, panelClass } from "@/src/components/ui";
import type { ManagementDashboard } from "@/src/types/management";
import { formatAmount } from "@/src/utils/formatAmount";
import { queryString } from "@/src/utils/query";

export function TopCustomers({ data }: { data: ManagementDashboard }) {
  return (
    <section className={panelClass} aria-labelledby="top-customers">
      <PanelHeading
        id="top-customers"
        icon={Trophy}
        title="Top customers, year to date"
      />
      <DataTable
        label="Top customers"
        columns={["Customer", "Revenue"]}
        numericColumns={["Revenue"]}
        rows={data.customers.map((customer) => ({
          id: customer.id,
          cells: [
            <span key="customer" className="grid">
              <Link
                className="text-brand underline"
                href={`/receivables/customers/${customer.id}`}
              >
                {customer.customer}
              </Link>
              <span className="text-muted">{customer.segment}</span>
            </span>,
            <Link
              key="revenue"
              className="text-brand underline"
              href={`/accounting/revenue${queryString({ customer: customer.id, from: data.from, to: data.as_of })}`}
            >
              {formatAmount(customer.amount)}
            </Link>,
          ],
        }))}
      />
    </section>
  );
}
