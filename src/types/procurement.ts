import type { PageData } from "@/src/types/stock";

export type PurchaseOrderSummary = {
  id: number;
  number: string;
  supplier: string;
  date: string;
  status: string;
  total: number;
};

export type HeldInvoice = {
  id: number;
  number: string;
  order_id: number;
  supplier: string;
  match_status: string;
  hold_reason: string;
};

export type PendingRequisition = {
  id: number;
  number: string;
  supplier: string;
  amount: number;
  level: string;
  can_approve: boolean;
};

export type ProcurementDashboard = {
  orders: PageData<PurchaseOrderSummary> & { value: number };
  holds: PageData<HeldInvoice>;
  statuses: string[];
  queue: PendingRequisition[];
};

export type SupplierScore = {
  id: number;
  supplier: string;
  receipts: number;
  on_time_rate: number | null;
  rejection_rate: number | null;
  invoices: number;
  exception_rate: number | null;
};

export type PurchaseOrderDetail = {
  number: string;
  status: string;
  date: string;
  expected: string;
  total: number;
  supplier: string;
  requisition: {
    number: string | null;
    date: string | null;
    decision: string | null;
    approval: string | null;
    approver: string | null;
  };
  lines: {
    id: number;
    sku: string;
    product: string;
    quantity: number;
    received: number;
    unit_cost: number;
  }[];
  receipts: {
    id: number;
    number: string;
    date: string;
    delivery: number;
    lines: {
      id: number;
      sku: string;
      received: number;
      accepted: number;
      rejected: number;
      reason: string | null;
    }[];
  }[];
  invoices: {
    id: number;
    number: string;
    date: string;
    receipt: string | null;
    status: string;
    match: string;
    reason: string | null;
    resolution: string | null;
    receipt_value: number;
    billed: number;
    approved: number;
    payments: { id: number; number: string; date: string; amount: number }[];
  }[];
};

export type RequisitionSuggestion = {
  product: string;
  sku: string;
  warehouse: string;
  supplier: string;
  unit_cost: number;
  minimum: number;
  quantity: number;
};
