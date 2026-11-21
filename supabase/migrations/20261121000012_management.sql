create or replace function public.procurement_dashboard(p_status text default null, p_page integer default 1, p_hold_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.procurement_can_read() then raise exception 'Procurement access required' using errcode = '42501'; end if;
  return (
    with orders as (
      select p.purchase_order_id as id,p.po_number as number,s.name as supplier,p.order_date as date,p.status,p.total_amount as total
      from public.purchase_orders p join public.suppliers s using (supplier_id)
      where p_status is null or p.status=p_status or (p_status='NOT_RECEIVED' and p.status in ('OPEN','PARTIALLY_RECEIVED'))
    ), slice as (select * from orders order by date desc,id desc limit 30 offset ((greatest(p_page,1)::bigint-1)*30)),
    holds as (
      select i.supplier_invoice_id as id,i.document_number as number,i.purchase_order_id as order_id,s.name as supplier,i.match_status,i.hold_reason
      from public.supplier_invoices i join public.suppliers s using(supplier_id) where i.status='ON_HOLD'
    ), hold_slice as (select * from holds order by id desc limit 30 offset ((greatest(p_hold_page,1)::bigint-1)*30)),
    queue as (
      select r.requisition_id as id,r.requisition_number as number,s.name as supplier,r.estimated_amount as amount,
        public.procurement_approval_level(r.estimated_amount) as level,
        public.procurement_approver(public.procurement_approval_level(r.estimated_amount))=(select employee_id from public.erp_actor()) as can_approve
      from public.purchase_requisitions r join public.suppliers s using(supplier_id) where r.status='PENDING_APPROVAL'
    )
    select jsonb_build_object('orders',jsonb_build_object('total',(select count(*) from orders),'value',(select coalesce(sum(total),0) from orders),'page_size',30,
      'rows',coalesce((select jsonb_agg(to_jsonb(o) order by o.date desc,o.id desc) from slice o),'[]'::jsonb)),
      'holds',jsonb_build_object('total',(select count(*) from holds),'page_size',30,
      'rows',coalesce((select jsonb_agg(to_jsonb(h) order by h.id desc) from hold_slice h),'[]'::jsonb)),
      'statuses',(select jsonb_agg(status order by status) from (select distinct status from public.purchase_orders) s),
      'queue',coalesce((select jsonb_agg(to_jsonb(q) order by q.id desc) from queue q),'[]'::jsonb))
  );
end;
$$;

create index erp_sales_invoices_date_idx on public.sales_invoices (invoice_date);
create index erp_customers_segment_idx on public.customers (segment);

create function public.revenue_lines(p_from date, p_to date)
returns table (invoice_id bigint, invoice text, invoice_date date, customer_id bigint, customer text, segment text,
  category_id bigint, category text, sku text, product text, amount numeric)
language sql stable security definer set search_path = '' as $$
  select i.invoice_id, i.invoice_number, i.invoice_date, c.customer_id, c.name, c.segment, pc.category_id, pc.name, p.sku, p.name, l.line_amount
  from public.sales_invoices i join public.customers c using (customer_id)
  join public.sales_order_lines l on l.sales_order_id = i.sales_order_id
  join public.products p using (product_id) join public.product_categories pc on pc.category_id = p.category_id
  where i.invoice_date between p_from and p_to;
$$;

create function public.revenue_analysis(p_from date, p_to date, p_segment text default null, p_category bigint default null,
  p_customer bigint default null, p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.accounting_can_read() then
    raise exception 'Finance or management access required' using errcode = '42501';
  end if;
  return (
    with lines as (
      select * from public.revenue_lines(p_from, p_to) r
      where (p_segment is null or r.segment = p_segment) and (p_category is null or r.category_id = p_category)
        and (p_customer is null or r.customer_id = p_customer)
    ), slice as (
      select * from lines order by invoice_date desc, invoice_id desc, sku limit 50 offset ((greatest(p_page, 1)::bigint - 1) * 50)
    )
    select jsonb_build_object('from', p_from, 'to', p_to, 'total', (select count(*) from lines), 'page_size', 50,
      'amount', (select coalesce(round(sum(amount), 2), 0) from lines),
      'customer', (select name from public.customers where customer_id = p_customer),
      'segments', (select jsonb_agg(segment order by segment) from (select distinct segment from public.customers) s),
      'categories', (select jsonb_agg(jsonb_build_object('id', category_id, 'name', name) order by name) from public.product_categories),
      'rows', coalesce((select jsonb_agg(jsonb_build_object('id', invoice_id || '-' || sku, 'invoice_id', invoice_id, 'invoice', invoice,
        'date', invoice_date, 'customer', customer, 'segment', segment, 'category', category, 'sku', sku, 'product', product, 'amount', amount)
        order by invoice_date desc, invoice_id desc, sku) from slice), '[]'::jsonb))
  );
end;
$$;

create function public.management_dashboard()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  as_of date := public.erp_as_of_date();
  year_start date := date_trunc('year', public.erp_as_of_date())::date;
  statement jsonb;
  stock jsonb;
  purchasing jsonb;
begin
  if not public.accounting_can_read() then
    raise exception 'Finance or management access required' using errcode = '42501';
  end if;
  statement := public.accounting_income_statement(extract(year from as_of)::integer);
  stock := public.stock_dashboard(null, null, false, 1);
  purchasing := public.procurement_dashboard('NOT_RECEIVED', 1, 1);
  return (
    with lines as (select * from public.revenue_lines(year_start, as_of))
    select jsonb_build_object('as_of', as_of, 'from', year_start, 'year', extract(year from as_of)::integer,
      'revenue', (select coalesce(sum((m->>'revenue')::numeric), 0) from jsonb_array_elements(statement->'months') m),
      'cost_of_sales', (select coalesce(sum((m->>'cost_of_sales')::numeric), 0) from jsonb_array_elements(statement->'months') m),
      'months', statement->'months',
      'open_receivables', public.receivables_dashboard(null, 1)->'open_amount',
      'stock_value', (select coalesce(round(sum((m->>'value')::numeric), 2), 0) from jsonb_array_elements(stock->'months') m
        where m->>'month' = date_trunc('month', as_of)::date::text),
      'open_purchase_orders', purchasing->'orders'->'total',
      'open_purchase_value', purchasing->'orders'->'value',
      'segments', (select jsonb_agg(jsonb_build_object('segment', segment, 'amount', amount) order by amount desc)
        from (select segment, round(sum(amount), 2) as amount from lines group by 1) s),
      'categories', (select jsonb_agg(jsonb_build_object('id', category_id, 'category', category, 'amount', amount) order by amount desc)
        from (select category_id, category, round(sum(amount), 2) as amount from lines group by 1, 2) c),
      'customers', (select jsonb_agg(jsonb_build_object('id', customer_id, 'customer', customer, 'segment', segment, 'amount', amount) order by amount desc)
        from (select customer_id, customer, segment, round(sum(amount), 2) as amount from lines group by 1, 2, 3 order by 4 desc limit 10) t))
  );
end;
$$;

revoke all on function public.revenue_lines(date, date), public.revenue_analysis(date, date, text, bigint, bigint, integer),
  public.management_dashboard() from public, anon, authenticated;
grant execute on function public.revenue_analysis(date, date, text, bigint, bigint, integer), public.management_dashboard() to authenticated;
