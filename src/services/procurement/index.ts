import "server-only";
import { createSupabaseServerClient } from "@/src/lib/supabase";
import type {
  ProcurementDashboard,
  PurchaseOrderDetail,
  RequisitionSuggestion,
  SupplierScore,
} from "@/src/types/procurement";

export async function getProcurementDashboard(filters: {
  status: string | null;
  page: number;
  holdPage: number;
}) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("procurement_dashboard", {
    p_status: filters.status,
    p_page: filters.page,
    p_hold_page: filters.holdPage,
  });
  return { data: data as ProcurementDashboard | null, error };
}

export async function getSupplierScorecard() {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("procurement_scorecard");
  return { data: data as SupplierScore[] | null, error };
}

export async function getPurchaseOrder(id: number) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("procurement_order", { p_id: id });
  return { data: data as PurchaseOrderDetail | null, error };
}

export async function getRequisitionSuggestion(
  product: number,
  warehouse: number,
) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("procurement_suggestion", {
    p_product: product,
    p_warehouse: warehouse,
  });
  return { data: data as RequisitionSuggestion | null, error };
}

export async function createRequisition(
  product: number,
  warehouse: number,
  quantity: number,
) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("create_requisition", {
    p_product: product,
    p_warehouse: warehouse,
    p_quantity: quantity,
  });
  return {
    data: data as { order_id: number | null; number: string } | null,
    error,
  };
}

export async function decideRequisition(
  id: number,
  approve: boolean,
  reason: string,
) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client.rpc("decide_requisition", {
    p_id: id,
    p_approve: approve,
    p_reason: reason || null,
  });
  return { orderId: data as number | null, error };
}
