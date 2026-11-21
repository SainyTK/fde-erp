import Link from "next/link";
import { EmployeeSettingsRow } from "@/src/components/admin";
import { SessionMonitor } from "@/src/components/session";
import { getEmployeeSettings } from "@/src/services/employee-settings";

export default async function EmployeeSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  let settings: Awaited<ReturnType<typeof getEmployeeSettings>>;
  try {
    settings = await getEmployeeSettings();
  } catch {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
        <Link
          href="/"
          className="text-sm font-semibold text-[#285e45] hover:underline"
        >
          Back to workspace
        </Link>
        <h1 className="mt-10 text-3xl font-semibold">Employee settings</h1>
        <p role="alert" className="mt-4 text-sm text-[#8f3f26]">
          Unable to load employee settings. Check your access and try again.
        </p>
      </main>
    );
  }
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10">
      <SessionMonitor />
      <nav className="flex flex-wrap gap-5 text-sm font-semibold text-[#285e45]">
        <Link href="/" className="hover:underline">
          Back to workspace
        </Link>
        <Link href="/admin" className="hover:underline">
          Login accounts
        </Link>
      </nav>
      <h1 className="mt-10 text-3xl font-semibold tracking-tight">
        Employee settings
      </h1>
      {status === "saved" && (
        <p role="status" className="mt-5 rounded-lg bg-white px-4 py-3 text-sm">
          Employee settings saved.
        </p>
      )}
      {status === "error" && (
        <p
          role="alert"
          className="mt-5 rounded-lg bg-white px-4 py-3 text-sm text-[#8f3f26]"
        >
          Unable to save employee settings. Check the selected values and your
          access, then try again.
        </p>
      )}
      {settings.employees.length === 0 && (
        <p className="mt-6 text-sm text-[#66756b]">No employees found.</p>
      )}
      {settings.employees.length > 0 && (
        <section
          aria-label="Employee settings"
          className="mt-6 overflow-x-auto rounded-xl border border-[#dde4dd] bg-white"
        >
          <table className="w-full min-w-[1080px] table-fixed border-collapse text-sm">
            <thead className="bg-[#f1f6f1] text-left text-xs font-semibold text-[#53665a]">
              <tr>
                <th className="w-[18%] px-5 py-4" scope="col">
                  Employee
                </th>
                <th className="w-[16%] px-4 py-4" scope="col">
                  Roles
                </th>
                <th className="w-[23%] px-4 py-4" scope="col">
                  Department
                </th>
                <th className="w-[25%] px-4 py-4" scope="col">
                  Reporting manager
                </th>
                <th className="w-[8%] px-4 py-4 text-center" scope="col">
                  Admin
                </th>
                <th className="w-[10%] px-5 py-4 text-right" scope="col">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {settings.employees.map((employee) => (
                <EmployeeSettingsRow
                  key={employee.employee_id}
                  employee={employee}
                  employees={settings.employees}
                  departments={settings.departments}
                />
              ))}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
