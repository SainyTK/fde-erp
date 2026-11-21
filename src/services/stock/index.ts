import "server-only";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type {
  StockDashboard,
  StockFilters,
  StockMovements,
} from "@/src/types/stock";

export async function getStockDashboard(filters: StockFilters) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("stock_dashboard", {
    p_warehouse: filters.warehouse,
    p_category: filters.category,
    p_low: filters.low,
    p_page: filters.page,
  });
  return { data: data as StockDashboard | null, error };
}

export async function getStockMovements(
  product: number,
  warehouse: number | null,
  page: number,
) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("stock_movements", {
    p_product: product,
    p_warehouse: warehouse,
    p_page: page,
  });
  return { data: data as StockMovements | null, error };
}
