import type { PageData } from "@/src/types/stock";

export type TrialBalance = {
  as_of: string;
  rows: {
    code: string;
    name: string;
    type: string;
    normal_balance: string;
    debit: number;
    credit: number;
    debit_balance: number;
    credit_balance: number;
  }[];
  debit: number;
  credit: number;
  debit_balance: number;
  credit_balance: number;
};

export type IncomeStatement = {
  year: number;
  years: number[];
  months: {
    month: string;
    revenue: number;
    cost_of_sales: number;
    other_expenses: number;
  }[];
  accounts: { code: string; name: string; type: string; amount: number }[];
};

export type AccountLedger = PageData<{
  id: number;
  entry: string;
  date: string;
  description: string;
  source_type: string;
  debit: number;
  credit: number;
  balance: number;
  link: string | null;
}> & {
  code: string;
  name: string;
  type: string;
  normal_balance: string;
  from: string;
  to: string;
  opening: number;
  closing: number;
  debit: number;
  credit: number;
  accounts: { code: string; name: string }[];
};
