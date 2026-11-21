import "server-only";
import { createClient } from "@supabase/supabase-js";

export type HealthChecks = {
  ledger_balanced: boolean;
  receivables_reconciled: boolean;
  invoice_status_consistent: boolean;
  checked_at: string;
};

export async function getSystemHealth() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return null;
  }
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.rpc("system_health");
  return error ? null : (data as HealthChecks);
}
