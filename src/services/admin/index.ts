import "server-only";

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type { Account } from "@/src/types/account";

export class AdminAccessError extends Error {}

async function authorizedClient() {
  const session = await createSupabaseServerClient();
  const { data, error } = await session.auth.getUser();
  if (error || !data.user) {
    throw new AdminAccessError();
  }
  const { data: eligible, error: eligibilityError } = await session.rpc(
    "employee_is_eligible",
  );
  if (eligibilityError || eligible !== true) {
    throw new AdminAccessError();
  }
  const { data: admin, error: adminError } =
    await session.rpc("employee_is_admin");
  if (adminError || admin !== true) {
    throw new AdminAccessError();
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase admin configuration is missing");
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function recordAccountChange(
  action: "INSERT" | "UPDATE" | "DELETE",
  account: string,
  email: string,
) {
  const session = await createSupabaseServerClient();
  const { error } = await session.rpc("record_account_change", {
    p_action: action,
    p_account: account,
    p_email: email,
  });
  if (error) {
    throw error;
  }
}

export async function listAccounts() {
  const client = await authorizedClient();
  const accounts: Account[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await client.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      throw error;
    }
    accounts.push(
      ...data.users.map((user) => ({ id: user.id, email: user.email ?? "" })),
    );
    if (data.users.length < perPage) {
      return accounts;
    }
    page += 1;
  }
}

export async function createAccount(email: string, password: string) {
  const client = await authorizedClient();
  const { data, error } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    throw error;
  }
  await recordAccountChange("INSERT", data.user.id, email);
}

export async function updateAccount(
  id: string,
  email: string,
  password: string,
) {
  const client = await authorizedClient();
  const { error } = await client.auth.admin.updateUserById(id, {
    email,
    email_confirm: true,
    ...(password ? { password } : {}),
  });
  if (error) {
    throw error;
  }
  await recordAccountChange("UPDATE", id, email);
}

export async function deleteAccount(id: string) {
  const client = await authorizedClient();
  const { data } = await client.auth.admin.getUserById(id);
  const { error } = await client.auth.admin.deleteUser(id);
  if (error) {
    throw error;
  }
  await recordAccountChange("DELETE", id, data.user?.email ?? "");
}
