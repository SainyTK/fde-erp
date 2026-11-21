import Link from "next/link";
import { AuthShell } from "@/src/components/auth";

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <p className="text-sm font-semibold text-[#45815f]">Demo confirmation</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        You're ready to sign in
      </h1>
      <p className="mt-3 text-sm leading-6 text-[#6b796f]">
        This is a simulation. Email ownership was not checked.
      </p>
      <Link
        className="mt-8 flex h-12 items-center justify-center rounded-lg bg-[#285e45] text-sm font-semibold text-white hover:bg-[#1d4b36]"
        href="/login"
      >
        Sign in
      </Link>
    </AuthShell>
  );
}
