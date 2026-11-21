import { Layers3 } from "lucide-react";

export function Brand() {
  return (
    <span className="inline-flex items-center gap-3 text-white">
      <span className="bg-brand-soft text-brand grid size-9 place-items-center rounded-lg">
        <Layers3 aria-hidden="true" className="size-5" />
      </span>
      <span className="font-semibold tracking-tight">FDE ERP</span>
    </span>
  );
}
