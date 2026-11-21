import type { IncomeStatement } from "@/src/types/accounting";

export type ManagementDashboard = {
  as_of: string;
  from: string;
  year: number;
  revenue: number;
  cost_of_sales: number;
  months: IncomeStatement["months"];
  open_receivables: number;
  stock_value: number;
  open_purchase_orders: number;
  open_purchase_value: number;
  segments: { segment: string; amount: number }[];
  categories: { id: number; category: string; amount: number }[];
  customers: {
    id: number;
    customer: string;
    segment: string;
    amount: number;
  }[];
};

export type RevenueFilters = {
  from: string;
  to: string;
  segment: string | null;
  category: number | null;
  customer: number | null;
  page: number;
};

export type RevenueAnalysis = {
  from: string;
  to: string;
  total: number;
  page_size: number;
  amount: number;
  customer: string | null;
  segments: string[];
  categories: { id: number; name: string }[];
  rows: {
    id: string;
    invoice_id: number;
    invoice: string;
    date: string;
    customer: string;
    segment: string;
    category: string;
    sku: string;
    product: string;
    amount: number;
  }[];
};

export type ChartPoint = {
  key: string;
  label: string;
  value: number;
  display: string;
};
