import "server-only";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type {
  CustomerReceivables,
  ReceivableInvoiceDetail,
  ReceivablesDashboard,
} from "@/src/types/receivables";

export async function getReceivables(bucket: string | null, page: number) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("receivables_dashboard", {
    p_bucket: bucket,
    p_page: page,
  });
  return { data: data as ReceivablesDashboard | null, error };
}

export async function getCustomerReceivables(customer: number) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("receivables_customer", {
    p_customer: customer,
  });
  return { data: data as CustomerReceivables | null, error };
}

export async function getReceivableInvoice(invoice: number) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("receivables_invoice", {
    p_invoice: invoice,
  });
  return { data: data as ReceivableInvoiceDetail | null, error };
}

export async function recordCustomerPayment(input: {
  invoice: number;
  amount: number;
  date: string;
  method: string;
}) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("record_customer_payment", {
    p_invoice: input.invoice,
    p_amount: input.amount,
    p_date: input.date,
    p_method: input.method,
  });
  return { status: data as string | null, error };
}
