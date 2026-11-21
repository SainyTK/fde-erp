import { Banknote } from "lucide-react";
import { recordPayment } from "@/app/receivables/actions";
import {
  controlClass,
  PanelHeading,
  panelClass,
  SubmitButton,
} from "@/src/components/ui";
import { paymentMethods } from "@/src/constants/receivables";
import type { ReceivableInvoiceDetail } from "@/src/types/receivables";
import { formatStatus } from "@/src/utils/formatStatus";

export function PaymentForm({ invoice }: { invoice: ReceivableInvoiceDetail }) {
  return (
    <section className={panelClass} aria-labelledby="record-payment">
      <PanelHeading
        id="record-payment"
        icon={Banknote}
        title="Record payment"
      />
      <form
        action={recordPayment}
        className="grid gap-4 p-4 sm:grid-cols-3 sm:px-6"
      >
        <input type="hidden" name="invoice" value={invoice.id} />
        <label className="grid gap-1 text-sm">
          Amount (THB)
          <input
            className={controlClass}
            defaultValue={invoice.outstanding}
            max={invoice.outstanding}
            min={0.01}
            name="amount"
            required
            step={0.01}
            type="number"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Payment date
          <input
            className={controlClass}
            defaultValue={invoice.today}
            max={invoice.today}
            min={invoice.invoice_date}
            name="date"
            required
            type="date"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Method
          <select className={controlClass} name="method" required>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>
                {formatStatus(method)}
              </option>
            ))}
          </select>
        </label>
        <div className="sm:col-span-3">
          <SubmitButton pendingLabel="Recording payment">
            Record payment
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
