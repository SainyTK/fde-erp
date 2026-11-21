import { PackageCheck } from "lucide-react";
import { DataTable, PanelHeading, panelClass } from "@/src/components/ui";
import type { PurchaseOrderDetail } from "@/src/types/procurement";
import { formatQuantity } from "@/src/utils/formatQuantity";

export function OrderReceipts({
  receipts,
}: {
  receipts: PurchaseOrderDetail["receipts"];
}) {
  return (
    <section className={panelClass} aria-labelledby="receipts">
      <PanelHeading
        id="receipts"
        icon={PackageCheck}
        title="3. Goods receipts"
      />
      {receipts.length === 0 ? (
        <p className="text-muted p-4 text-sm sm:px-6">Nothing received yet</p>
      ) : (
        <ul className="divide-line divide-y">
          {receipts.map((receipt) => (
            <li key={receipt.id}>
              <p className="px-4 pt-4 font-semibold sm:px-6">
                {receipt.number}
                <span className="text-muted font-normal">
                  {" "}
                  / delivery {receipt.delivery} / {receipt.date}
                </span>
              </p>
              <DataTable
                label={`Goods receipt ${receipt.number}`}
                columns={[
                  "Product",
                  "Received",
                  "Accepted",
                  "Rejected",
                  "Rejection reason",
                ]}
                numericColumns={["Received", "Accepted", "Rejected"]}
                rows={receipt.lines.map((line) => ({
                  id: line.id,
                  cells: [
                    line.sku,
                    formatQuantity(line.received),
                    formatQuantity(line.accepted),
                    formatQuantity(line.rejected),
                    line.reason ?? "",
                  ],
                }))}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
