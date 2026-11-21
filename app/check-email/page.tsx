import Link from "next/link";
import { AuthShell } from "@/src/components/auth";

export default function CheckEmailPage() {
  return (
    <AuthShell>
      <p className="text-sm font-semibold text-[#45815f]">Demo inbox</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Confirm your email
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#6b796f]">
        No email was sent. This message is a simulation.
      </p>
      <div className="mt-8 rounded-xl border border-[#e2e8e1] bg-[#f8faf7] p-5">
        <p className="text-xs font-semibold tracking-wide text-[#6b796f] uppercase">
          FDE ERP
        </p>
        <p className="mt-2 text-base font-semibold">Confirm your account</p>
        <p className="mt-2 text-sm leading-6 text-[#6b796f]">
          Follow this link to continue to the confirmation page.
        </p>
        <Link
          className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-[#285e45] px-5 text-sm font-semibold text-white hover:bg-[#1d4b36]"
          href="/verify-email"
        >
          Confirm email
        </Link>
      </div>
      <p className="mt-7 text-center text-sm text-[#6b796f]">
        <Link
          className="font-semibold text-[#285e45] underline-offset-4 hover:underline"
          href="/login"
        >
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
