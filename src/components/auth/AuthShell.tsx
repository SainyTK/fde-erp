import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-[#275d45] text-lg font-bold text-white"
          >
            F
          </span>
          <span className="text-sm font-bold tracking-[0.14em] text-[#275d45] uppercase">
            FDE ERP
          </span>
        </div>
        <section className="rounded-2xl border border-[#e2e8e1] bg-white p-7 shadow-[0_12px_45px_rgba(37,64,46,0.06)] sm:p-9">
          {children}
        </section>
        <p className="mt-6 text-center text-xs leading-5 text-[#849187]">
          Access is available to active employees.
        </p>
      </div>
    </main>
  );
}
