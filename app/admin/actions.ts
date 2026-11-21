"use server";

import { redirect } from "next/navigation";
import {
  createAccount,
  deleteAccount,
  updateAccount,
} from "@/src/services/admin";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function createLogin(formData: FormData) {
  const email = field(formData, "email").trim();
  const password = field(formData, "password");
  try {
    if (!email || password.length < 6) {
      throw new Error("Invalid input");
    }
    await createAccount(email, password);
  } catch {
    redirect("/admin?status=error");
  }
  redirect("/admin?status=created");
}

export async function updateLogin(formData: FormData) {
  const id = field(formData, "id");
  const email = field(formData, "email").trim();
  const password = field(formData, "password");
  try {
    if (!id || !email || (password && password.length < 6)) {
      throw new Error("Invalid input");
    }
    await updateAccount(id, email, password);
  } catch {
    redirect("/admin?status=error");
  }
  redirect("/admin?status=updated");
}

export async function deleteLogin(formData: FormData) {
  const id = field(formData, "id");
  try {
    if (!id) {
      throw new Error("Invalid input");
    }
    await deleteAccount(id);
  } catch {
    redirect("/admin?status=error");
  }
  redirect("/admin?status=deleted");
}
