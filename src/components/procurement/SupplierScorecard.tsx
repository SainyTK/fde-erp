import { Gauge } from "lucide-react";
import { DataTable, PanelHeading, panelClass } from "@/src/components/ui";
import type { SupplierScore } from "@/src/types/procurement";
import { formatPercent } from "@/src/utils/formatPercent";
import { formatQuantity } from "@/src/utils/formatQuantity";

export function SupplierScorecard({ scores }: { scores: SupplierScore[] }) {
  return (
    <section className={panelClass} aria-labelledby="supplier-scorecard">
      <PanelHeading
        id="supplier-scorecard"
        icon={Gauge}
        title="Supplier scorecard"
      />
      <DataTable
        label="Supplier scorecard"
        columns={[
          "Supplier",
          "Receipts",
          "On time",
          "Units rejected",
          "Invoices",
          "Invoice exceptions",
        ]}
        numericColumns={[
          "Receipts",
          "On time",
          "Units rejected",
          "Invoices",
          "Invoice exceptions",
        ]}
        rows={scores.map((score) => ({
          id: score.id,
          cells: [
            score.supplier,
            formatQuantity(score.receipts),
            formatPercent(score.on_time_rate),
            formatPercent(score.rejection_rate),
            formatQuantity(score.invoices),
            formatPercent(score.exception_rate),
          ],
        }))}
      />
    </section>
  );
}
