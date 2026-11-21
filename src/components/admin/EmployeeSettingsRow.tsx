import { saveEmployeeSettings } from "@/app/admin/employees/actions";
import { controlClass, RecordDetails, SubmitButton } from "@/src/components/ui";
import type {
  Department,
  EmployeeSettings,
} from "@/src/types/employee-settings";

export function EmployeeSettingsRow({
  employee,
  employees,
  departments,
}: {
  employee: EmployeeSettings;
  employees: EmployeeSettings[];
  departments: Department[];
}) {
  const employeeName = `${employee.first_name} ${employee.last_name}`;
  const roles = employee.roles.join(", ");
  const description = roles
    ? `${employee.employee_code} / ${roles}`
    : employee.employee_code;
  const isTopManager = employee.employee_code === "E0001";
  return (
    <RecordDetails description={description} title={employeeName}>
      <form action={saveEmployeeSettings} className="grid gap-4 md:grid-cols-2">
        <input name="employee_id" type="hidden" value={employee.employee_id} />
        <label className="grid gap-2 text-sm font-medium">
          <span>Department</span>
          <select
            className={controlClass}
            defaultValue={employee.department_id ?? ""}
            name="department_id"
            required
          >
            <option disabled value="">
              Select department
            </option>
            {departments.map((department) => (
              <option
                key={department.department_id}
                value={department.department_id}
              >
                {department.name} ({department.code})
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>Reporting manager</span>
          <select
            className={controlClass}
            defaultValue={employee.manager_id ?? ""}
            name="manager_id"
            required={!isTopManager}
          >
            <option disabled={!isTopManager} value="">
              {isTopManager ? "No manager" : "Select reporting manager"}
            </option>
            {!isTopManager &&
              employees
                .filter(
                  (candidate) => candidate.employee_id !== employee.employee_id,
                )
                .map((candidate) => (
                  <option
                    key={candidate.employee_id}
                    value={candidate.employee_id}
                  >
                    {candidate.first_name} {candidate.last_name} (
                    {candidate.employee_code})
                  </option>
                ))}
          </select>
        </label>
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            className="accent-brand size-5"
            defaultChecked={employee.is_admin}
            name="is_admin"
            type="checkbox"
          />
          Admin access
        </label>
        <div className="md:justify-self-end">
          <SubmitButton
            label={`Save changes for ${employeeName}`}
            pendingLabel="Saving changes"
          >
            Save changes
          </SubmitButton>
        </div>
      </form>
    </RecordDetails>
  );
}
