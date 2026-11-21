"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { primaryButtonClass } from "./styles";

export function SubmitButton({
  children,
  pendingLabel,
  className = primaryButtonClass,
  label,
}: {
  children: ReactNode;
  pendingLabel: string;
  className?: string;
  label?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      aria-label={pending ? pendingLabel : label}
      className={className}
      disabled={pending}
      type="submit"
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
