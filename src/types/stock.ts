export type StockFilters = {
  warehouse: number | null;
  category: number | null;
  low: boolean;
  page: number;
};
export type StockRow = {
  product_id: number;
  sku: string;
  product: string;
  warehouse_id: number;
  warehouse: string;
  quantity: number;
  value: number;
  reorder_point: number;
  low: boolean;
  days_of_cover: number | null;
  stock_status: string;
};
export type NamedOption = { id: number; name: string };
export type PageData<T> = { total: number; page_size: number; rows: T[] };
export type StockDashboard = PageData<StockRow> & {
  as_of: string;
  months: {
    month: string;
    warehouse_id: number;
    warehouse: string;
    value: number;
  }[];
  shrinkage: {
    warehouse_id: number;
    warehouse: string;
    units_lost: number;
    value_lost: number;
    net_value: number;
  }[];
  categories: NamedOption[];
  warehouses: NamedOption[];
  can_request: boolean;
};
export type StockMovements = PageData<{
  id: number;
  date: string;
  type: string;
  quantity: number;
  unit_cost: number;
  warehouse: string;
}> & { name: string; sku: string };
