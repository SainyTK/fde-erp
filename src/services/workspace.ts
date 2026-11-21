import "server-only";

import { createSupabaseServerClient } from "@/src/lib/supabase";
import type { Workspace, WorkspaceDetails } from "@/src/types/workspace";
import { getOwnSalary, getSalaryDirectory } from "./salary";

export async function getWorkspace(): Promise<Workspace | null> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("employee_workspace");
  if (
    error ||
    !data?.employee ||
    !Array.isArray(data.roles) ||
    !Array.isArray(data.subordinates)
  ) {
    return null;
  }
  const details = data as WorkspaceDetails;
  try {
    const [salary, employees] = await Promise.all([
      getOwnSalary(client, details.employee.employee_id),
      details.roles.includes("HR") ? getSalaryDirectory(client) : [],
    ]);
    return {
      ...details,
      employee: { ...details.employee, monthly_salary: salary },
      employees,
    };
  } catch {
    return null;
  }
}
