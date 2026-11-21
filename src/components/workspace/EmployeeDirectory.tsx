import { Wallet } from "lucide-react";
import { PanelHeading, panelClass, SearchList } from "@/src/components/ui";
import type { WorkspaceEmployee } from "@/src/types/workspace";
import { EmployeeSalaryRecord } from "./EmployeeSalaryRecord";

export function EmployeeDirectory({
  employees,
}: {
  employees: WorkspaceEmployee[];
}) {
  return (
    <section aria-labelledby="directory-title" className={panelClass}>
      <PanelHeading
        icon={Wallet}
        id="directory-title"
        title="Employee salaries"
      />
      <SearchList
        empty="No employees found."
        items={employees.map((person) => ({
          id: person.employee_id,
          search: [
            person.first_name,
            person.last_name,
            person.employee_code,
            person.job_title,
            person.email,
          ].join(" "),
          content: <EmployeeSalaryRecord person={person} />,
        }))}
        label="Search employees"
      />
    </section>
  );
}
