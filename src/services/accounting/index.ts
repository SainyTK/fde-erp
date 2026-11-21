import "server-only";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type {
  AccountLedger,
  IncomeStatement,
  TrialBalance,
} from "@/src/types/accounting";

export async function getTrialBalance(asOf: string | null) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("accounting_trial_balance", {
    p_as_of: asOf,
  });
  return { data: data as TrialBalance | null, error };
}

export async function getIncomeStatement(year: number) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("accounting_income_statement", {
    p_year: year,
  });
  return { data: data as IncomeStatement | null, error };
}

export async function getAccountLedger(input: {
  account: string;
  from: string;
  to: string;
  page: number;
}) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("accounting_ledger", {
    p_account: input.account,
    p_from: input.from,
    p_to: input.to,
    p_page: input.page,
  });
  return { data: data as AccountLedger | null, error };
}
