import type { PageData } from "@/src/types/stock";

export type ReceivableInvoice = {
  id: number;
  number: string;
  customer_id: number;
  customer: string;
  invoice_date: string;
  due_date: string;
  days_overdue: number;
  total: number;
  paid: number;
  outstanding: number;
  status: string;
  bucket: string;
};

export type AgeingBucket = { code: string; invoices: number; amount: number };

export type ReceivablesDashboard = PageData<ReceivableInvoice> & {
  as_of: string;
  open_amount: number;
  can_record: boolean;
  buckets: AgeingBucket[];
};

export type CustomerPayment = {
  id: number;
  number: string;
  date: string;
  amount: number;
  method: string;
};

export type CustomerReceivables = {
  name: string;
  code: string;
  segment: string;
  province: string;
  rep: string;
  credit_limit: number;
  payment_terms_days: number;
  open_invoices: number;
  open_orders: number;
  available: number;
  paid_invoices: number;
  average_days_late: number | null;
  on_time_rate: number | null;
  invoices: Omit<ReceivableInvoice, "customer_id" | "customer">[];
  payments: (CustomerPayment & { invoice: string; invoice_id: number })[];
};

export type ReceivableInvoiceDetail = {
  id: number;
  number: string;
  customer_id: number;
  customer: string;
  order: string | null;
  invoice_date: string;
  due_date: string;
  days_overdue: number;
  total: number;
  status: string;
  outstanding: number;
  today: string;
  can_record: boolean;
  payments: CustomerPayment[];
};
