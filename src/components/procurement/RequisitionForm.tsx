import { FilePen } from "lucide-react";
import { requestPurchase } from "@/app/purchasing/actions";
import {
  controlClass,
  Facts,
  PanelHeading,
  panelClass,
  SubmitButton,
} from "@/src/components/ui";
import type { RequisitionSuggestion } from "@/src/types/procurement";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";

export function RequisitionForm({
  product,
  warehouse,
  suggestion,
}: {
  product: number;
  warehouse: number;
  suggestion: RequisitionSuggestion;
}) {
  return (
    <section className={panelClass} aria-labelledby="new-requisition">
      <PanelHeading
        id="new-requisition"
        icon={FilePen}
        title="New purchase requisition"
      />
      <Facts
        items={[
          {
            label: "Product",
            value: `${suggestion.sku} / ${suggestion.product}`,
          },
          { label: "Warehouse", value: suggestion.warehouse },
          { label: "Suggested supplier", value: suggestion.supplier },
          { label: "Unit cost", value: formatAmount(suggestion.unit_cost) },
        ]}
      />
      <form
        action={requestPurchase}
        className="border-line grid gap-4 border-t p-4 sm:px-6"
      >
        <input type="hidden" name="product" value={product} />
        <input type="hidden" name="warehouse" value={warehouse} />
        <label className="grid max-w-xs gap-1 text-sm">
          Quantity (minimum {formatQuantity(suggestion.minimum)})
          <input
            className={controlClass}
            defaultValue={suggestion.quantity}
            min={suggestion.minimum}
            name="quantity"
            required
            step={1}
            type="number"
          />
        </label>
        <div>
          <SubmitButton pendingLabel="Creating requisition">
            Create requisition
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
