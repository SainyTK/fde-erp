import "server-only";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type { AuditEntries } from "@/src/types/audit";

export async function getAuditEntries(table: string | null, page: number) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("audit_entries", {
    p_table: table,
    p_page: page,
  });
  return { data: data as AuditEntries | null, error };
}
