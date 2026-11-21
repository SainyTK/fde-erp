export type EmployeeSettings = {
  employee_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  department_id: number | null;
  manager_id: number | null;
  is_admin: boolean;
  roles: string[];
};

export type Department = {
  department_id: number;
  code: string;
  name: string;
};

export type EmployeeSettingsData = {
  employees: EmployeeSettings[];
  departments: Department[];
};

export type EmployeeSettingsUpdate = Pick<
  EmployeeSettings,
  "employee_id" | "department_id" | "manager_id" | "is_admin"
>;
