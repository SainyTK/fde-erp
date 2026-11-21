import Link from "next/link";
import { AuthShell } from "@/src/components/auth";
import { primaryButtonClass } from "@/src/components/ui";

export default function NotFoundPage() {
  return (
    <AuthShell>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted mt-2">
        This page does not exist, or your account cannot open it.
      </p>
      <Link className={`${primaryButtonClass} mt-6`} href="/">
        Go to workspace
      </Link>
    </AuthShell>
  );
}
