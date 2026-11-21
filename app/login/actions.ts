"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import { getEligibleUser } from "@/src/services/auth";

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect("/login?status=invalid");
  }
  const { data: accountStatus } = await supabase.rpc("employee_account_status");
  if (accountStatus === "inactive") {
    await supabase.auth.signOut();
    redirect("/login?status=inactive");
  }
  const user = await getEligibleUser();
  if (!user) {
    await supabase.auth.signOut();
    redirect("/login?status=invalid");
  }
  redirect("/");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error?.code === "user_already_exists") {
    redirect("/signup?status=account-exists");
  }
  if (error || !data.session) {
    redirect("/signup?status=error");
  }
  const user = await getEligibleUser();
  await supabase.auth.signOut();
  if (!user) {
    redirect("/signup?status=error");
  }
  redirect("/check-email");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
