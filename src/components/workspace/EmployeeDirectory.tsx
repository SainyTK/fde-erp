import type { WorkspaceEmployee } from "@/src/types/workspace";

export function EmployeeDirectory({
  employees,
}: {
  employees: WorkspaceEmployee[];
}) {
  return (
    <section
      aria-labelledby="directory-title"
      className="rounded-2xl border border-[#dce5dd] bg-white p-6 sm:p-8"
    >
      <h2 className="text-xl font-semibold" id="directory-title">
        Employees
      </h2>
      {employees.length === 0 ? (
        <p className="mt-5 text-sm text-[#66756b]">No employees found.</p>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-[#dce5dd] text-[#66756b]">
              <tr>
                <th className="py-3 pr-5 font-medium" scope="col">
                  Employee
                </th>
                <th className="py-3 pr-5 font-medium" scope="col">
                  Code
                </th>
                <th className="py-3 pr-5 font-medium" scope="col">
                  Job title
                </th>
                <th className="py-3 pr-5 font-medium" scope="col">
                  Email
                </th>
                <th className="py-3 font-medium" scope="col">
                  Monthly salary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e7ece7]">
              {employees.map((person) => (
                <tr key={person.employee_id}>
                  <td className="py-4 pr-5 font-semibold">
                    {person.first_name} {person.last_name}
                  </td>
                  <td className="py-4 pr-5">{person.employee_code}</td>
                  <td className="py-4 pr-5">
                    {person.job_title || "Not available"}
                  </td>
                  <td className="py-4 pr-5">
                    {person.email || "Not available"}
                  </td>
                  <td className="py-4">
                    {person.monthly_salary == null
                      ? "Not available"
                      : new Intl.NumberFormat().format(person.monthly_salary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
