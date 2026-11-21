import "server-only";

import { createSupabaseServerClient } from "@/src/lib/supabase";
import { AdminAccessError } from "@/src/services/admin";
import type {
  EmployeeSettingsData,
  EmployeeSettingsUpdate,
} from "@/src/types/employee-settings";

export async function getEmployeeSettings(): Promise<EmployeeSettingsData> {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("admin_employee_settings");
  if (error?.code === "42501") {
    throw new AdminAccessError();
  }
  if (error || !data) {
    throw error ?? new Error("Employee settings unavailable");
  }
  return data as EmployeeSettingsData;
}

export async function updateEmployeeSettings(settings: EmployeeSettingsUpdate) {
  const client = await createSupabaseServerClient();
  const { error } = await client.rpc("admin_update_employee_settings", {
    p_employee_id: settings.employee_id,
    p_department_id: settings.department_id,
    p_manager_id: settings.manager_id,
    p_is_admin: settings.is_admin,
  });
  if (error) {
    throw error;
  }
}
