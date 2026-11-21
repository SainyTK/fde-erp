import { FilePen } from "lucide-react";
import { Facts, PanelHeading, panelClass } from "@/src/components/ui";
import { approvalLevels } from "@/src/constants/procurement";
import type { PurchaseOrderDetail } from "@/src/types/procurement";

export function OrderRequisition({
  requisition,
}: {
  requisition: PurchaseOrderDetail["requisition"];
}) {
  return (
    <section className={panelClass} aria-labelledby="requisition">
      <PanelHeading
        id="requisition"
        icon={FilePen}
        title="1. Requisition and approval"
      />
      {requisition.number ? (
        <Facts
          items={[
            { label: "Requisition", value: requisition.number },
            { label: "Requested", value: requisition.date },
            {
              label: "Approval",
              value: requisition.approval
                ? approvalLevels[requisition.approval]
                : "Not recorded",
            },
            {
              label: "Approved",
              value: requisition.decision
                ? `${requisition.decision}${requisition.approver ? ` by ${requisition.approver}` : ""}`
                : "Not recorded",
            },
          ]}
        />
      ) : (
        <p className="text-muted p-4 text-sm sm:px-6">
          This order was raised without a requisition.
        </p>
      )}
    </section>
  );
}
