import { saveEmployeeSettings } from "@/app/admin/employees/actions";
import type {
  Department,
  EmployeeSettings,
} from "@/src/types/employee-settings";

const selectClass =
  "h-11 w-full rounded-lg border border-[#d8e1d9] bg-white px-3 text-sm text-[#253b2e] focus:border-[#438762] focus:outline-none focus:ring-2 focus:ring-[#d8eadb]";

export function EmployeeSettingsRow({
  employee,
  employees,
  departments,
}: {
  employee: EmployeeSettings;
  employees: EmployeeSettings[];
  departments: Department[];
}) {
  const formId = `employee-settings-${employee.employee_id}`;
  const employeeName = `${employee.first_name} ${employee.last_name}`;

  return (
    <tr className="border-t border-[#e7ece7] align-middle hover:bg-[#f8faf8]">
      <th className="px-5 py-4 text-left" scope="row">
        <span className="block font-semibold text-[#253b2e]">
          {employeeName}
        </span>
        <span className="mt-1 block text-xs font-normal text-[#66756b]">
          {employee.employee_code}
        </span>
      </th>
      <td className="px-4 py-4 text-sm text-[#46564c]">
        {employee.roles.join(", ")}
      </td>
      <td className="px-4 py-4">
        <select
          aria-label={`Department for ${employeeName}`}
          className={selectClass}
          defaultValue={employee.department_id ?? ""}
          form={formId}
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
      </td>
      <td className="px-4 py-4">
        <select
          aria-label={`Reporting manager for ${employeeName}`}
          className={selectClass}
          defaultValue={employee.manager_id ?? ""}
          form={formId}
          name="manager_id"
          required={employee.employee_code !== "E0001"}
        >
          {employee.employee_code === "E0001" ? (
            <option value="">No manager</option>
          ) : (
            <option disabled value="">
              Select reporting manager
            </option>
          )}
          {employee.employee_code !== "E0001" &&
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
      </td>
      <td className="px-4 py-4 text-center">
        <input
          aria-label={`Admin role for ${employeeName}`}
          className="size-5 accent-[#285e45]"
          defaultChecked={employee.is_admin}
          form={formId}
          name="is_admin"
          type="checkbox"
        />
      </td>
      <td className="px-5 py-4 text-right">
        <form action={saveEmployeeSettings} id={formId}>
          <input
            name="employee_id"
            type="hidden"
            value={employee.employee_id}
          />
          <button
            aria-label={`Save changes for ${employeeName}`}
            className="min-h-11 rounded-lg bg-[#285e45] px-4 text-sm font-semibold text-white hover:bg-[#1d4b36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285e45]"
            type="submit"
          >
            Save
          </button>
        </form>
      </td>
    </tr>
  );
}
