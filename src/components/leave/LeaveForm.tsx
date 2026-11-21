import { CalendarPlus } from "lucide-react";
import { requestLeave } from "@/app/leave/actions";
import {
  controlClass,
  PanelHeading,
  panelClass,
  SubmitButton,
} from "@/src/components/ui";
import type { LeaveBalance } from "@/src/types/leave";

export function LeaveForm({
  balances,
  today,
}: {
  balances: LeaveBalance[];
  today: string;
}) {
  return (
    <section className={panelClass} aria-labelledby="request-leave">
      <PanelHeading
        id="request-leave"
        icon={CalendarPlus}
        title="Request leave"
      />
      <form
        action={requestLeave}
        className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6"
      >
        <label className="grid gap-1 text-sm">
          Leave type
          <select className={controlClass} name="type" required>
            {balances.map(({ code, name }) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm">
          <input type="checkbox" name="half" /> Half day
        </label>
        <label className="grid gap-1 text-sm">
          Start date
          <input
            className={controlClass}
            min={today}
            name="start"
            type="date"
            required
          />
        </label>
        <label className="grid gap-1 text-sm">
          End date
          <input
            className={controlClass}
            min={today}
            name="end"
            type="date"
            required
          />
        </label>
        <label className="grid gap-1 text-sm sm:col-span-2">
          Reason
          <textarea
            className={`${controlClass} py-2`}
            name="reason"
            maxLength={1000}
            required
          />
        </label>
        <div>
          <SubmitButton pendingLabel="Submitting request">
            Submit request
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
