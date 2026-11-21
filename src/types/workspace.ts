type EmployeeId = string | number;

export type WorkspaceEmployee = {
  employee_id: EmployeeId;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  job_title: string | null;
  monthly_salary: number | null;
};

export type Subordinate = Pick<
  WorkspaceEmployee,
  "employee_id" | "employee_code" | "first_name" | "last_name" | "job_title"
>;

export type Workspace = {
  employee: WorkspaceEmployee & {
    department_id: EmployeeId | null;
    department_name: string | null;
    manager_name: string | null;
  };
  roles: string[];
  subordinates: Subordinate[];
  employees: WorkspaceEmployee[];
};
