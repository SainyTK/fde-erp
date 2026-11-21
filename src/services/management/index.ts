import "server-only";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type {
  ManagementDashboard,
  RevenueAnalysis,
  RevenueFilters,
} from "@/src/types/management";

export async function getManagementDashboard() {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("management_dashboard");
  return { data: data as ManagementDashboard | null, error };
}

export async function getRevenueAnalysis(filters: RevenueFilters) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("revenue_analysis", {
    p_from: filters.from,
    p_to: filters.to,
    p_segment: filters.segment,
    p_category: filters.category,
    p_customer: filters.customer,
    p_page: filters.page,
  });
  return { data: data as RevenueAnalysis | null, error };
}
