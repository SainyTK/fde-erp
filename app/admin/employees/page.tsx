import { UsersRound } from "lucide-react";
import { EmployeeSettingsRow } from "@/src/components/admin";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  Feedback,
  PanelHeading,
  panelClass,
  SearchList,
} from "@/src/components/ui";
import { AdminAccessError } from "@/src/services/admin";
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
  } catch (error) {
    return (
      <AppShell active="employees">
        <PageHeading title="Employee settings" />
        <Feedback error>
          {error instanceof AdminAccessError
            ? "You do not have access to employee settings."
            : "Employee settings could not be loaded."}
        </Feedback>
      </AppShell>
    );
  }
  return (
    <AppShell active="employees" showAdmin>
      <PageHeading
        title="Employee settings"
        description="Manage departments, reporting managers, and admin access."
      />
      {status === "saved" && <Feedback>Employee settings saved.</Feedback>}
      {status === "error" && (
        <Feedback error>
          Could not save employee settings. Check the selected values and try
          again.
        </Feedback>
      )}
      <section aria-labelledby="employees-title" className={panelClass}>
        <PanelHeading
          icon={UsersRound}
          id="employees-title"
          title="Employees"
        />
        <SearchList
          empty="No employees found."
          items={settings.employees.map((employee) => ({
            id: employee.employee_id,
            search: [
              employee.first_name,
              employee.last_name,
              employee.employee_code,
              ...employee.roles,
            ].join(" "),
            content: (
              <EmployeeSettingsRow
                departments={settings.departments}
                employee={employee}
                employees={settings.employees}
              />
            ),
          }))}
          label="Search employees"
        />
      </section>
    </AppShell>
  );
}
