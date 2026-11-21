import type { NamedOption, PageData } from "@/src/types/stock";

export type SalesFilters = {
  status: string | null;
  customer: number | null;
  rep: number | null;
  from: string | null;
  to: string | null;
  page: number;
};

export type SalesOrderSummary = {
  id: number;
  number: string;
  date: string;
  status: string;
  customer: string;
  rep: string;
  total: number;
};

export type SalesOrderPage = PageData<SalesOrderSummary> & {
  statuses: string[];
  customers: NamedOption[];
  reps: NamedOption[];
};

export type SalesOrderDetail = {
  number: string;
  status: string;
  date: string;
  requested: string;
  cancelled: string | null;
  cancel_reason: string | null;
  customer: string;
  customer_code: string;
  rep: string;
  warehouse: string;
  subtotal: number;
  vat: number;
  total: number;
  lines: {
    id: number;
    sku: string;
    product: string;
    quantity: number;
    unit_price: number;
    discount: number;
    amount: number;
  }[];
  deliveries: { id: number; number: string; date: string; warehouse: string }[];
  invoices: {
    id: number;
    number: string;
    date: string;
    due: string;
    total: number;
    status: string;
    delivery: string | null;
    payments: {
      id: number;
      number: string;
      date: string;
      amount: number;
      method: string;
    }[];
  }[];
};

export type SalesOrderForm = {
  today: string;
  customers: { id: number; code: string; name: string; warehouse: string }[];
  products: { id: number; sku: string; name: string; price: number }[];
};

export type SalesOrderLineInput = {
  product: number;
  quantity: number;
  discount: number;
};
