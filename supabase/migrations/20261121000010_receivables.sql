create index erp_sales_invoices_customer_idx on public.sales_invoices (customer_id, status);
create unique index erp_sales_invoices_id_idx on public.sales_invoices (invoice_id);
create index erp_sales_invoices_open_idx on public.sales_invoices (due_date) where status <> 'PAID';
create sequence public.erp_customer_payment_id;
select setval('public.erp_customer_payment_id', coalesce(max(payment_id), 0) + 1, false) from public.customer_payments;
revoke all on sequence public.erp_customer_payment_id from public, anon, authenticated;

create function public.erp_as_of_date() returns date
language sql immutable set search_path = '' as $$ select public.stock_snapshot_date(); $$;

create function public.receivables_customers() returns table (customer_id bigint)
language sql stable security definer set search_path = '' as $$
  select c.customer_id from public.customers c
  where exists (select 1 from public.erp_actor() a where a.department_code in ('FIN', 'MGT'))
    or c.sales_rep_id in (select employee_id from public.sales_team());
$$;

create function public.receivables_can_record() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.erp_actor() a where a.department_code = 'FIN');
$$;

create function public.invoice_outstanding(p_invoice bigint) returns numeric
language sql stable security definer set search_path = '' as $$
  select i.total_amount - coalesce((select sum(p.amount) from public.customer_payments p where p.invoice_id = i.invoice_id), 0)
  from public.sales_invoices i where i.invoice_id = p_invoice;
$$;

create function public.customer_credit(p_customer bigint) returns table (open_invoices numeric, open_orders numeric)
language sql stable security definer set search_path = '' as $$
  select
    coalesce((select sum(i.total_amount - coalesce(paid.amount, 0)) from public.sales_invoices i
      left join lateral (select sum(p.amount) as amount from public.customer_payments p where p.invoice_id = i.invoice_id) paid on true
      where i.customer_id = p_customer and i.status <> 'PAID'), 0),
    coalesce((select sum(o.total_amount) from public.sales_orders o where o.customer_id = p_customer and o.status = 'OPEN'), 0);
$$;

create function public.receivables_bucket(p_days integer) returns text
language sql immutable set search_path = '' as $$
  select case when p_days <= 0 then 'NOT_DUE' when p_days <= 30 then 'DAYS_1_30' when p_days <= 60 then 'DAYS_31_60'
    when p_days <= 90 then 'DAYS_61_90' else 'DAYS_OVER_90' end;
$$;

create function public.receivables_open(p_customer bigint default null)
returns table (id bigint, number text, customer_id bigint, customer text, invoice_date date, due_date date,
  days_overdue integer, total numeric, paid numeric, outstanding numeric, status text, bucket text)
language sql stable security definer set search_path = '' as $$
  select i.invoice_id, i.invoice_number, c.customer_id, c.name, i.invoice_date, i.due_date,
    public.erp_as_of_date() - i.due_date, i.total_amount, coalesce(paid.amount, 0), i.total_amount - coalesce(paid.amount, 0), i.status,
    public.receivables_bucket(public.erp_as_of_date() - i.due_date)
  from public.sales_invoices i join public.customers c using (customer_id)
  left join lateral (select sum(p.amount) as amount from public.customer_payments p where p.invoice_id = i.invoice_id) paid on true
  where i.status <> 'PAID' and c.customer_id in (select customer_id from public.receivables_customers())
    and (p_customer is null or c.customer_id = p_customer);
$$;

create function public.receivables_dashboard(p_bucket text default null, p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.receivables_customers()) then
    raise exception 'Receivables access required' using errcode = '42501';
  end if;
  return (
    with open_items as (select * from public.receivables_open()),
    filtered as (select * from open_items where p_bucket is null or bucket = p_bucket),
    slice as (select * from filtered order by days_overdue desc, id limit 30 offset ((greatest(p_page, 1)::bigint - 1) * 30)),
    buckets as (
      select b.code, b.position, count(o.id) as invoices, coalesce(sum(o.outstanding), 0) as amount
      from (values ('NOT_DUE', 1), ('DAYS_1_30', 2), ('DAYS_31_60', 3), ('DAYS_61_90', 4), ('DAYS_OVER_90', 5)) b(code, position)
      left join open_items o on o.bucket = b.code group by b.code, b.position
    )
    select jsonb_build_object('as_of', public.erp_as_of_date(), 'page_size', 30, 'total', (select count(*) from filtered),
      'open_amount', (select coalesce(sum(outstanding), 0) from open_items),
      'can_record', public.receivables_can_record(),
      'buckets', (select jsonb_agg(jsonb_build_object('code', code, 'invoices', invoices, 'amount', amount) order by position) from buckets),
      'rows', coalesce((select jsonb_agg(to_jsonb(s) order by s.days_overdue desc, s.id) from slice s), '[]'::jsonb))
  );
end;
$$;

create function public.receivables_customer(p_customer bigint)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.receivables_customers() r where r.customer_id = p_customer) then
    return null;
  end if;
  return (
    with settled as (
      select i.invoice_id, i.due_date, max(p.payment_date) as settled_on
      from public.sales_invoices i join public.customer_payments p using (invoice_id)
      where i.customer_id = p_customer and i.status = 'PAID' group by i.invoice_id, i.due_date
    )
    select jsonb_build_object('name', c.name, 'code', c.customer_code, 'segment', c.segment, 'province', c.province,
      'rep', concat_ws(' ', e.first_name, e.last_name), 'credit_limit', c.credit_limit, 'payment_terms_days', c.payment_terms_days,
      'open_invoices', credit.open_invoices, 'open_orders', credit.open_orders,
      'available', c.credit_limit - credit.open_invoices - credit.open_orders,
      'paid_invoices', (select count(*) from settled),
      'average_days_late', (select round(avg(settled_on - due_date), 1) from settled),
      'on_time_rate', (select round(avg(case when settled_on <= due_date then 1 else 0 end), 4) from settled),
      'invoices', coalesce((select jsonb_agg(to_jsonb(o) - 'customer_id' - 'customer' order by o.days_overdue desc, o.id) from public.receivables_open(p_customer) o), '[]'::jsonb),
      'payments', coalesce((select jsonb_agg(x order by x->>'date' desc, (x->>'id')::bigint desc) from (
        select jsonb_build_object('id', p.payment_id, 'number', p.payment_number, 'date', p.payment_date, 'amount', p.amount,
          'method', p.method, 'invoice', i.invoice_number, 'invoice_id', i.invoice_id) as x
        from public.customer_payments p join public.sales_invoices i using (invoice_id)
        where p.customer_id = p_customer order by p.payment_date desc, p.payment_id desc limit 20) recent), '[]'::jsonb))
    from public.customers c join public.employees e on e.employee_id = c.sales_rep_id
    cross join lateral public.customer_credit(c.customer_id) credit
    where c.customer_id = p_customer
  );
end;
$$;

create function public.receivables_invoice(p_invoice bigint)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.sales_invoices i join public.receivables_customers() r using (customer_id) where i.invoice_id = p_invoice) then
    return null;
  end if;
  return (
    select jsonb_build_object('id', i.invoice_id, 'number', i.invoice_number, 'customer_id', c.customer_id, 'customer', c.name,
      'order_id', i.sales_order_id, 'order', o.order_number, 'invoice_date', i.invoice_date, 'due_date', i.due_date,
      'days_overdue', public.erp_as_of_date() - i.due_date, 'total', i.total_amount, 'status', i.status,
      'outstanding', public.invoice_outstanding(i.invoice_id), 'today', public.leave_today(), 'can_record', public.receivables_can_record(),
      'payments', coalesce((select jsonb_agg(jsonb_build_object('id', p.payment_id, 'number', p.payment_number, 'date', p.payment_date,
        'amount', p.amount, 'method', p.method) order by p.payment_date, p.payment_id) from public.customer_payments p where p.invoice_id = i.invoice_id), '[]'::jsonb))
    from public.sales_invoices i join public.customers c using (customer_id) left join public.sales_orders o using (sales_order_id)
    where i.invoice_id = p_invoice
  );
end;
$$;

create function public.record_customer_payment(p_invoice bigint, p_amount numeric, p_date date, p_method text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  invoice public.sales_invoices%rowtype;
  remaining numeric;
  payment_id bigint;
  next_status text;
begin
  if not public.receivables_can_record() then
    raise exception 'Only Finance can record customer payments' using errcode = '42501';
  end if;
  select * into invoice from public.sales_invoices where invoice_id = p_invoice for update;
  if invoice.invoice_id is null then
    raise exception 'Invoice not found' using errcode = '22023';
  end if;
  remaining := public.invoice_outstanding(p_invoice);
  if remaining <= 0 then
    raise exception 'This invoice is already paid' using errcode = '22023';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount <> round(p_amount, 2) or p_amount > remaining then
    raise exception 'Enter an amount between 0.01 and % THB', to_char(remaining, 'FM999,999,999,990.00') using errcode = '22023';
  end if;
  if p_date is null or p_date < invoice.invoice_date or p_date > public.leave_today() then
    raise exception 'The payment date must be between the invoice date and today' using errcode = '22023';
  end if;
  if p_method is null or p_method not in ('TRANSFER', 'CHEQUE', 'CASH') then
    raise exception 'Choose transfer, cheque or cash' using errcode = '22023';
  end if;
  payment_id := nextval('public.erp_customer_payment_id');
  insert into public.customer_payments (payment_id, payment_number, invoice_id, customer_id, payment_date, amount, method)
  values (payment_id, 'RC-W-' || payment_id, invoice.invoice_id, invoice.customer_id, p_date, p_amount, p_method);
  next_status := case when p_amount = remaining then 'PAID' else 'PARTIALLY_PAID' end;
  update public.sales_invoices set status = next_status where invoice_id = p_invoice;
  return next_status;
end;
$$;

create or replace function public.create_sales_order(p_customer bigint, p_requested date, p_lines jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  customer public.customers%rowtype;
  order_id bigint;
  net numeric;
  tax numeric;
  short record;
  credit record;
  order_total numeric;
begin
  if not exists (select 1 from public.sales_team()) then
    raise exception 'Sales access required' using errcode = '42501';
  end if;
  select * into customer from public.customers where customer_id = p_customer and is_active = 1
    and sales_rep_id in (select employee_id from public.sales_team());
  if customer.customer_id is null then
    raise exception 'Choose one of your customers' using errcode = '42501';
  end if;
  if p_requested is null or p_requested < public.leave_today() then
    raise exception 'The requested date cannot be in the past' using errcode = '22023';
  end if;
  if jsonb_typeof(p_lines) is distinct from 'array' or jsonb_array_length(p_lines) not between 1 and 50 then
    raise exception 'Add between 1 and 50 order lines' using errcode = '22023';
  end if;
  if exists (select 1 from public.sales_order_input(p_lines) i left join public.products p using (product_id)
      where p.product_id is null or p.is_active <> 1 or p.discontinued_date is not null or coalesce(p.list_price, 0) <= 0
        or i.quantity is null or i.quantity <= 0 or i.quantity <> trunc(i.quantity) or i.quantity > 100000
        or i.discount_pct < 0 or i.discount_pct > 15 or i.discount_pct <> round(i.discount_pct, 2))
    or (select count(distinct product_id) from public.sales_order_input(p_lines)) <> jsonb_array_length(p_lines) then
    raise exception 'Each line needs a different active product, a whole quantity, and a discount from 0 to 15 percent' using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('credit:' || customer.customer_id, 0));
  select sum(round(i.quantity * p.list_price * (1 - i.discount_pct / 100), 2)) into net
  from public.sales_order_input(p_lines) i join public.products p using (product_id);
  order_total := net + round(net * 0.07, 2);
  select * into credit from public.customer_credit(customer.customer_id);
  if credit.open_invoices + credit.open_orders + order_total > customer.credit_limit then
    raise exception 'This order would put the customer over their credit limit: % THB limit, % THB already owed or on open orders, % THB available',
      to_char(customer.credit_limit, 'FM999,999,999,990.00'), to_char(credit.open_invoices + credit.open_orders, 'FM999,999,999,990.00'),
      to_char(greatest(customer.credit_limit - credit.open_invoices - credit.open_orders, 0), 'FM999,999,999,990.00')
      using errcode = '22023';
  end if;
  perform pg_advisory_xact_lock(hashtextextended('stock:' || customer.default_warehouse_id, 0));
  select p.sku, i.quantity, greatest(coalesce(onhand.quantity, 0) - coalesce(reserved.quantity, 0), 0) as available into short
  from public.sales_order_input(p_lines) i join public.products p using (product_id)
  left join lateral (select sum(t.quantity) as quantity from public.inventory_transactions t
    where t.product_id = i.product_id and t.warehouse_id = customer.default_warehouse_id) onhand on true
  left join lateral (select sum(l.quantity) as quantity from public.sales_order_lines l join public.sales_orders o using (sales_order_id)
    where l.product_id = i.product_id and o.warehouse_id = customer.default_warehouse_id and o.status = 'OPEN') reserved on true
  where i.quantity > coalesce(onhand.quantity, 0) - coalesce(reserved.quantity, 0)
  order by i.line_no limit 1;
  if short.sku is not null then
    raise exception 'Not enough stock for % in the customer''s warehouse: % available, % ordered', short.sku, short.available, short.quantity
      using errcode = '22023';
  end if;
  order_id := nextval('public.erp_sales_order_id');
  insert into public.sales_order_lines (sales_order_line_id, sales_order_id, line_no, product_id, quantity, unit_price, discount_pct, line_amount)
  select nextval('public.erp_sales_order_line_id'), order_id, i.line_no, i.product_id, i.quantity, p.list_price, i.discount_pct,
    round(i.quantity * p.list_price * (1 - i.discount_pct / 100), 2)
  from public.sales_order_input(p_lines) i join public.products p using (product_id);
  select sum(line_amount) into net from public.sales_order_lines where sales_order_id = order_id;
  tax := round(net * 0.07, 2);
  insert into public.sales_orders (sales_order_id, order_number, customer_id, sales_rep_id, warehouse_id, order_date, requested_date,
    status, subtotal, vat_amount, total_amount, currency)
  values (order_id, 'SO-W-' || order_id, customer.customer_id, customer.sales_rep_id, customer.default_warehouse_id, public.leave_today(),
    p_requested, 'OPEN', net, tax, net + tax, 'THB');
  return order_id;
end;
$$;

revoke all on function public.erp_as_of_date(), public.receivables_customers(), public.receivables_can_record(),
  public.invoice_outstanding(bigint), public.customer_credit(bigint), public.receivables_bucket(integer), public.receivables_open(bigint),
  public.receivables_dashboard(text, integer), public.receivables_customer(bigint), public.receivables_invoice(bigint),
  public.record_customer_payment(bigint, numeric, date, text) from public, anon, authenticated;
grant execute on function public.receivables_dashboard(text, integer), public.receivables_customer(bigint), public.receivables_invoice(bigint),
  public.record_customer_payment(bigint, numeric, date, text) to authenticated;
