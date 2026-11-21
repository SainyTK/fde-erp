import { createSupabaseServerClient } from "@/src/lib/supabase";

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
