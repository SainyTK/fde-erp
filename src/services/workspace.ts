import { createSupabaseServerClient } from "@/src/lib/supabase";
import type { Workspace } from "@/src/types/workspace";

export async function getWorkspace(): Promise<
  { workspace: Workspace; error: false } | { workspace: null; error: true }
> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("employee_workspace");
  if (
    error ||
    !data ||
    !data.employee ||
    !Array.isArray(data.roles) ||
    !Array.isArray(data.subordinates) ||
    !Array.isArray(data.employees)
  ) {
    return { workspace: null, error: true };
  }
  return { workspace: data as Workspace, error: false };
}
