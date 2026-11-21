import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";

export function Feedback({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  const Icon = error ? CircleAlert : CircleCheck;
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm leading-6 ${error ? "border-danger/20 bg-danger-soft text-danger" : "border-brand/20 bg-brand-soft text-brand"}`}
      role={error ? "alert" : "status"}
    >
      <Icon aria-hidden="true" className="mt-1 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
