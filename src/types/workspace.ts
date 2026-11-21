export type WorkspaceEmployee = {
  employee_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string | null;
  job_title: string | null;
  monthly_salary: number;
};

export type Subordinate = Pick<
  WorkspaceEmployee,
  "employee_id" | "employee_code" | "first_name" | "last_name" | "job_title"
>;

type EmployeeProfile = Omit<
  WorkspaceEmployee,
  "last_name" | "monthly_salary"
> & {
  department_name: string | null;
  manager_name: string | null;
};

export type WorkspaceDetails = {
  employee: EmployeeProfile;
  roles: string[];
  subordinates: Subordinate[];
};

export type Workspace = WorkspaceDetails & {
  employee: EmployeeProfile & Pick<WorkspaceEmployee, "monthly_salary">;
  employees: WorkspaceEmployee[];
};
