import type { Workspace } from "@/src/types/workspace";

export function WorkspaceProfile({
  employee,
  roles,
}: Pick<Workspace, "employee" | "roles">) {
  const details = [
    ["Employee code", employee.employee_code],
    ["Email", employee.email],
    ["Job title", employee.job_title],
    ["Department", employee.department_name],
    ["Reporting manager", employee.manager_name || "None"],
    [
      "Monthly salary",
      employee.monthly_salary == null
        ? null
        : new Intl.NumberFormat().format(employee.monthly_salary),
    ],
    ["Roles", roles.length ? roles.join(", ") : null],
  ];
  return (
    <section
      aria-labelledby="profile-title"
      className="rounded-2xl border border-[#dce5dd] bg-white p-6 sm:p-8"
    >
      <h2 className="text-xl font-semibold" id="profile-title">
        Your profile
      </h2>
      <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {details.map(([label, value]) => (
          <div key={label}>
            <dt className="text-sm text-[#66756b]">{label}</dt>
            <dd className="mt-1 text-sm font-semibold break-words text-[#253b2e]">
              {value || "Not available"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
