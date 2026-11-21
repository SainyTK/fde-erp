"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateEmployeeSettings } from "@/src/services/employee-settings";

function idField(formData: FormData, name: string, nullable: boolean) {
  const value = formData.get(name);
  if (nullable && value === "") {
    return null;
  }
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    throw new Error("Invalid identifier");
  }
  const id = Number(value);
  if (!Number.isSafeInteger(id)) {
    throw new Error("Invalid identifier");
  }
  return id;
}

export async function saveEmployeeSettings(formData: FormData) {
  try {
    const employeeId = idField(formData, "employee_id", false);
    const departmentId = idField(formData, "department_id", false);
    const managerId = idField(formData, "manager_id", true);
    const admin = formData.get("is_admin");
    if (
      employeeId === null ||
      employeeId === managerId ||
      (admin !== null && admin !== "on")
    ) {
      throw new Error("Invalid settings");
    }
    await updateEmployeeSettings({
      employee_id: employeeId,
      department_id: departmentId,
      manager_id: managerId,
      is_admin: admin === "on",
    });
  } catch {
    redirect("/admin/employees?status=error");
  }
  revalidatePath("/");
  revalidatePath("/admin/employees");
  redirect("/admin/employees?status=saved");
}
