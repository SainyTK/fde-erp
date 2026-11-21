import { Layers3 } from "lucide-react";
import type { ReactNode } from "react";
import { Brand } from "@/src/components/shell";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-rows-[auto_1fr] lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-1">
      <header className="bg-rail relative isolate flex flex-col overflow-hidden px-5 py-5 text-white lg:min-h-dvh lg:p-10 xl:p-14">
        <Brand />
        <div className="hidden flex-1 flex-col justify-center lg:flex">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_0%_65%,var(--color-rail-active),transparent_72%)]"
          />
          <div
            aria-hidden="true"
            className="border-rail-muted/25 bg-rail-active/70 outline-rail-muted/15 mb-12 grid size-40 place-items-center rounded-[2rem] border outline outline-1 outline-offset-12"
          >
            <Layers3 className="text-rail-muted size-20" strokeWidth={1.05} />
          </div>
          <p className="max-w-sm text-5xl leading-tight font-semibold tracking-tight xl:text-6xl">
            Employee workspace
          </p>
        </div>
      </header>
      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:py-16">
        <div className="border-line bg-surface w-full max-w-md rounded-2xl border p-6 shadow-sm sm:p-9">
          {children}
        </div>
      </main>
    </div>
  );
}
