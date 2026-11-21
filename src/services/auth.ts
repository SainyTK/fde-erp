import type { SignInFailure } from "@/src/constants/sign-in";
import { createSupabaseServerClient } from "@/src/lib/supabase";

export async function signInEmployee(
  email: string,
  password: string,
): Promise<SignInFailure | null> {
  if (!email || !password) {
    return "invalid";
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.status === 429) {
      return "rate-limited";
    }
    if (error.code === "email_not_confirmed") {
      return "unconfirmed";
    }
    if (
      error.code === "invalid_credentials" ||
      error.code === "validation_failed"
    ) {
      return "invalid";
    }
    return "unavailable";
  }
  const { data: status, error: statusError } = await supabase.rpc(
    "employee_account_status",
  );
  if (!statusError && status === "active") {
    return null;
  }
  await supabase.auth.signOut({ scope: "local" });
  if (statusError) {
    return "unavailable";
  }
  return status === "inactive" ? "inactive" : "ineligible";
}

export async function getEligibleUser() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return null;
  }
  const { data: eligible, error: eligibilityError } = await supabase.rpc(
    "employee_is_eligible",
  );
  if (eligibilityError || eligible !== true) {
    return null;
  }
  return data.user;
}
