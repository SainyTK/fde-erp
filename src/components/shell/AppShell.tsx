import {
  BookOpen,
  Boxes,
  CalendarDays,
  ContactRound,
  HandCoins,
  History,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  ScrollText,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/login/actions";
import { SessionMonitor } from "@/src/components/session";
import { SubmitButton } from "@/src/components/ui";
import { Brand } from "./Brand";

const destinations = [
  {
    id: "workspace",
    label: "Workspace",
    href: "/",
    icon: LayoutGrid,
    adminOnly: false,
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  {
    id: "leave",
    label: "Leave",
    href: "/leave",
    icon: CalendarDays,
    adminOnly: false,
  },
  {
    id: "stock",
    label: "Stock",
    href: "/stock",
    icon: Boxes,
    adminOnly: false,
  },
  {
    id: "sales",
    label: "Sales",
    href: "/sales",
    icon: ScrollText,
    adminOnly: false,
  },
  {
    id: "receivables",
    label: "Receivables",
    href: "/receivables",
    icon: HandCoins,
    adminOnly: false,
  },
  {
    id: "purchasing",
    label: "Purchasing",
    href: "/purchasing",
    icon: ShoppingCart,
    adminOnly: false,
  },
  {
    id: "accounting",
    label: "Accounting",
    href: "/accounting",
    icon: BookOpen,
    adminOnly: false,
  },
  {
    id: "employees",
    label: "Employee settings",
    href: "/admin/employees",
    icon: ContactRound,
    adminOnly: true,
  },
  {
    id: "audit",
    label: "Audit log",
    href: "/admin/audit",
    icon: History,
    adminOnly: true,
  },
  {
    id: "accounts",
    label: "Login accounts",
    href: "/admin",
    icon: KeyRound,
    adminOnly: true,
  },
] as const;

export function AppShell({
  active,
  showAdmin = false,
  children,
}: {
  active: (typeof destinations)[number]["id"];
  showAdmin?: boolean;
  children: ReactNode;
}) {
  const links = destinations.filter((link) => showAdmin || !link.adminOnly);
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <SessionMonitor />
      <a
        className="focus:bg-surface sr-only z-50 focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:rounded-lg focus:p-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <header className="bg-rail grid grid-cols-[minmax(0,1fr)_auto] items-center px-4 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:items-stretch lg:overflow-y-auto lg:px-5 lg:py-6">
        <div className="col-start-1 row-start-1 flex min-h-16 items-center lg:min-h-0 lg:px-2">
          <Brand />
        </div>
        <nav
          aria-label="Main navigation"
          className="col-span-2 row-start-2 grid grid-cols-3 gap-2 pb-3 lg:mt-10 lg:flex lg:flex-col"
        >
          {links.map(({ id, label, href, icon: Icon }) => (
            <Link
              aria-current={active === id ? "page" : undefined}
              className="text-rail-muted hover:bg-rail-active aria-[current=page]:bg-rail-active flex min-h-11 flex-col items-center gap-1 rounded-lg py-2 text-center text-xs font-medium outline-white hover:text-white aria-[current=page]:text-white sm:flex-row sm:justify-center sm:px-2 sm:text-sm lg:justify-start lg:gap-3 lg:px-3 lg:text-left"
              href={href}
              key={id}
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <form
          action={signOut}
          className="lg:border-rail-active col-start-2 row-start-1 lg:mt-auto lg:border-t lg:pt-4"
        >
          <SubmitButton
            className="text-rail-muted hover:bg-rail-active inline-flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-medium outline-white hover:text-white disabled:cursor-wait disabled:opacity-60 lg:w-full lg:px-3"
            pendingLabel="Signing out"
          >
            <LogOut aria-hidden="true" className="size-4" />
            Sign out
          </SubmitButton>
        </form>
      </header>
      <main
        className="mx-auto w-full max-w-7xl min-w-0 space-y-6 px-4 py-7 sm:px-8 sm:py-10 lg:px-10"
        id="main-content"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
