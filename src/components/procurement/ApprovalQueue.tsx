import { ClipboardCheck } from "lucide-react";
import { reviewRequisition } from "@/app/purchasing/actions";
import {
  controlClass,
  PanelHeading,
  panelClass,
  StatusBadge,
  secondaryButtonClass,
} from "@/src/components/ui";
import { approvalLevels } from "@/src/constants/procurement";
import type { PendingRequisition } from "@/src/types/procurement";
import { formatAmount } from "@/src/utils/formatAmount";

export function ApprovalQueue({
  requisitions,
}: {
  requisitions: PendingRequisition[];
}) {
  return (
    <section className={panelClass} aria-labelledby="approval-queue">
      <PanelHeading
        id="approval-queue"
        icon={ClipboardCheck}
        title="Requisitions waiting for approval"
      />
      {requisitions.length === 0 ? (
        <p className="text-muted p-4 text-sm sm:px-6">No requisitions</p>
      ) : (
        <ul className="divide-line divide-y">
          {requisitions.map((requisition) => (
            <li className="space-y-3 p-4 sm:px-6" key={requisition.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {requisition.number} / {requisition.supplier}
                </p>
                <StatusBadge status="PENDING_APPROVAL" />
              </div>
              <p className="text-muted text-sm">
                {formatAmount(requisition.amount)} /{" "}
                {approvalLevels[requisition.level]}
              </p>
              {requisition.can_approve ? (
                <form
                  action={reviewRequisition}
                  className="flex flex-wrap gap-2"
                >
                  <input type="hidden" name="id" value={requisition.id} />
                  <label className="grid w-full gap-1 text-sm">
                    Rejection reason
                    <input
                      name="reason"
                      className={controlClass}
                      maxLength={1000}
                    />
                  </label>
                  <button
                    className={secondaryButtonClass}
                    name="decision"
                    value="approve"
                    type="submit"
                  >
                    Approve and create purchase order
                  </button>
                  <button
                    className={secondaryButtonClass}
                    name="decision"
                    value="reject"
                    type="submit"
                  >
                    Reject
                  </button>
                </form>
              ) : (
                <p className="text-muted text-sm">
                  Only the assigned approver can decide.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
