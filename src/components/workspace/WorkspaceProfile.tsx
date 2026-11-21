import { ContactRound } from "lucide-react";
import { PanelHeading, panelClass } from "@/src/components/ui";
import type { Workspace } from "@/src/types/workspace";
import { formatSalary } from "@/src/utils/formatSalary";

export function WorkspaceProfile({
  employee,
  roles,
}: Pick<Workspace, "employee" | "roles">) {
  const details = [
    ["Employee code", employee.employee_code],
    ["Email", employee.email],
    ["Department", employee.department_name],
    ["Reporting manager", employee.manager_name || "None"],
    ["Monthly salary", formatSalary(employee.monthly_salary)],
    ["Roles", roles.length ? roles.join(", ") : "None"],
  ];
  return (
    <section aria-labelledby="profile-title" className={panelClass}>
      <PanelHeading
        icon={ContactRound}
        id="profile-title"
        title="Your profile"
      />
      <dl className="grid gap-x-6 gap-y-5 px-4 py-5 min-[360px]:grid-cols-2 sm:px-6">
        {details.map(([label, value]) => (
          <div className="min-w-0" key={label}>
            <dt className="text-muted text-sm">{label}</dt>
            <dd className="mt-1 font-medium [overflow-wrap:anywhere] tabular-nums">
              {value || "Not available"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
