import { ClipboardList } from "lucide-react";
import { reviewLeave } from "@/app/leave/actions";
import {
  controlClass,
  PanelHeading,
  panelClass,
  StatusBadge,
  SubmitButton,
  secondaryButtonClass,
} from "@/src/components/ui";
import type { LeaveRequest } from "@/src/types/leave";

export function LeaveRequestList({
  id,
  title,
  requests,
}: {
  id: string;
  title: string;
  requests: LeaveRequest[];
}) {
  return (
    <section className={panelClass} aria-labelledby={id}>
      <PanelHeading id={id} icon={ClipboardList} title={title} />
      {requests.length === 0 ? (
        <p className="text-muted p-4 text-sm sm:px-6">No requests</p>
      ) : (
        <ul className="divide-line divide-y">
          {requests.map((request) => (
            <li className="space-y-3 p-4 sm:px-6" key={request.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold">
                  {request.own
                    ? request.type
                    : `${request.employee} / ${request.type}`}
                </p>
                <StatusBadge status={request.status} />
              </div>
              <p className="text-muted text-sm">
                {request.start} to {request.end} / {request.days}{" "}
                {request.days === 1 ? "day" : "days"}
              </p>
              <p className="text-sm wrap-break-word">{request.reason}</p>
              {request.comment && (
                <p className="text-muted text-sm wrap-break-word">
                  Decision comment: {request.comment}
                </p>
              )}
              {request.can_review && (
                <form action={reviewLeave} className="flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={request.id} />
                  <label className="grid w-full gap-1 text-sm">
                    Decision comment
                    <input
                      name="comment"
                      className={controlClass}
                      maxLength={1000}
                      required
                    />
                  </label>
                  <button
                    className={secondaryButtonClass}
                    name="decision"
                    value="Approved"
                    type="submit"
                  >
                    Approve
                  </button>
                  <button
                    className={secondaryButtonClass}
                    name="decision"
                    value="Rejected"
                    type="submit"
                  >
                    Reject
                  </button>
                </form>
              )}
              {request.own && request.status === "Pending" && (
                <form action={reviewLeave}>
                  <input type="hidden" name="id" value={request.id} />
                  <input type="hidden" name="decision" value="Cancelled" />
                  <SubmitButton
                    className={secondaryButtonClass}
                    pendingLabel="Cancelling request"
                  >
                    Cancel request
                  </SubmitButton>
                </form>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
