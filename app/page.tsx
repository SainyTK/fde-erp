import Link from "next/link";
import { redirect } from "next/navigation";
import { SessionMonitor } from "@/src/components/session";
import {
  EmployeeDirectory,
  WorkspaceProfile,
  WorkspaceTeam,
} from "@/src/components/workspace";
import { getEligibleUser } from "@/src/services/auth";
import { getWorkspace } from "@/src/services/workspace";
import { signOut } from "./login/actions";

export default async function HomePage() {
  const user = await getEligibleUser();
  if (!user) {
    redirect("/login");
  }
  const { workspace, error } = await getWorkspace();
  const showDirectory =
    workspace &&
    (workspace.employees.length > 0 ||
      workspace.roles.some((role) =>
        ["hr", "human resources"].includes(role.trim().toLowerCase()),
      ));
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 sm:px-10">
      <SessionMonitor />
      <header className="flex items-center justify-between border-b border-[#dde4dd] pb-6">
        <span className="text-sm font-bold tracking-[0.14em] text-[#275d45] uppercase">
          FDE ERP
        </span>
        <div className="flex items-center gap-4">
          {workspace?.roles.some(
            (role) => role.trim().toLowerCase() === "admin",
          ) && (
            <Link
              className="text-sm font-semibold text-[#285e45] hover:underline"
              href="/admin/employees"
            >
              Admin
            </Link>
          )}
          <form action={signOut}>
            <button
              className="rounded-lg border border-[#cbd6cc] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f0f5f0]"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      {error ? (
        <section
          className="mt-12 rounded-2xl border border-[#e3c8c1] bg-white p-6"
          role="alert"
        >
          <h1 className="text-xl font-semibold">Workspace unavailable</h1>
          <p className="mt-2 text-sm text-[#66756b]">
            Your workspace could not be loaded. Please try again.
          </p>
          <a
            className="mt-5 inline-block rounded-lg bg-[#285e45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d4b36]"
            href="/"
          >
            Try again
          </a>
        </section>
      ) : (
        <>
          <div className="mt-12 mb-8">
            <p className="text-sm font-semibold text-[#3e7659]">
              Employee workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Welcome, {workspace.employee.first_name}
            </h1>
            <p className="mt-3 text-sm text-[#66756b]">
              {workspace.employee.job_title || "Your workspace"}
            </p>
          </div>
          <div className="space-y-6">
            <WorkspaceProfile
              employee={workspace.employee}
              roles={workspace.roles}
            />
            <WorkspaceTeam subordinates={workspace.subordinates} />
            {showDirectory && (
              <EmployeeDirectory employees={workspace.employees} />
            )}
          </div>
        </>
      )}
    </main>
  );
}
