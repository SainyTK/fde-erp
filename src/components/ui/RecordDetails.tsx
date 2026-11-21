import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";

export function RecordDetails({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <details className="group">
      <summary className="hover:bg-canvas flex min-h-14 list-none items-center justify-between gap-3 px-4 py-3 focus-visible:outline-offset-[-3px] sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="min-w-0">
          <span className="block font-semibold [overflow-wrap:anywhere]">
            {title}
          </span>
          {description && (
            <span className="text-muted mt-0.5 block text-sm">
              {description}
            </span>
          )}
        </span>
        <ChevronDown
          aria-hidden="true"
          className="text-muted size-4 shrink-0 group-open:rotate-180"
        />
      </summary>
      <div className="border-line bg-canvas/60 border-t px-4 py-5 sm:px-6">
        {children}
      </div>
    </details>
  );
}
