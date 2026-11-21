import "server-only";

import type { createSupabaseServerClient } from "@/src/lib/supabase";
import type { WorkspaceEmployee } from "@/src/types/workspace";

type SessionClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function getOwnSalary(client: SessionClient, employeeId: number) {
  const { data, error } = await client
    .from("employees")
    .select("monthly_salary")
    .eq("employee_id", employeeId)
    .single();
  if (error || !data) {
    throw error ?? new Error("Salary unavailable");
  }
  return data.monthly_salary as number;
}

export async function getSalaryDirectory(client: SessionClient) {
  const employees: WorkspaceEmployee[] = [];
  let lastEmployeeCode: string | undefined;
  while (true) {
    const query = client
      .from("employees")
      .select(
        "employee_id, employee_code, first_name, last_name, email, job_title, monthly_salary",
      )
      .order("employee_code")
      .limit(500);
    if (lastEmployeeCode !== undefined) {
      query.gt("employee_code", lastEmployeeCode);
    }
    const { data, error } = await query;
    if (error) {
      throw error;
    }
    if (!data.length) {
      return employees;
    }
    employees.push(...data);
    lastEmployeeCode = data.at(-1)?.employee_code;
  }
}
