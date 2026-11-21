import type { WorkspaceEmployee } from "@/src/types/workspace";
import { formatSalary } from "@/src/utils/formatSalary";

export function EmployeeSalaryRecord({
  person,
}: {
  person: WorkspaceEmployee;
}) {
  return (
    <div className="grid gap-3 px-4 py-4 sm:px-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-center xl:gap-5">
      <div className="min-w-0 [overflow-wrap:anywhere]">
        <p className="font-semibold">
          {person.first_name} {person.last_name}
        </p>
        <p className="text-muted text-sm">
          {person.employee_code}
          {person.job_title && ` / ${person.job_title}`}
        </p>
      </div>
      <dl className="grid gap-3 min-[400px]:grid-cols-2 xl:col-span-2 xl:grid-cols-[minmax(0,1fr)_10rem] xl:gap-5">
        <div className="min-w-0">
          <dt className="text-muted text-xs">Email</dt>
          <dd className="mt-0.5 text-sm [overflow-wrap:anywhere]">
            {person.email || "Not available"}
          </dd>
        </div>
        <div className="xl:text-right">
          <dt className="text-muted text-xs">Monthly salary</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums">
            {formatSalary(person.monthly_salary)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
