import "server-only";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type {
  SalesFilters,
  SalesOrderDetail,
  SalesOrderForm,
  SalesOrderLineInput,
  SalesOrderPage,
} from "@/src/types/sales";

export async function getSalesOrders(filters: SalesFilters) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("sales_orders_page", {
    p_status: filters.status,
    p_customer: filters.customer,
    p_rep: filters.rep,
    p_from: filters.from,
    p_to: filters.to,
    p_page: filters.page,
  });
  return { data: data as SalesOrderPage | null, error };
}

export async function getSalesOrder(id: number) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("sales_order", { p_id: id });
  return { data: data as SalesOrderDetail | null, error };
}

export async function getSalesOrderForm() {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("sales_order_form");
  return { data: data as SalesOrderForm | null, error };
}

export async function createSalesOrder(
  customer: number,
  requested: string,
  lines: SalesOrderLineInput[],
) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("create_sales_order", {
    p_customer: customer,
    p_requested: requested,
    p_lines: lines,
  });
  return { orderId: data as number | null, error };
}
