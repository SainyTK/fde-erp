do $$
declare t text;
begin
  for t in select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from public, anon, authenticated', t);
  end loop;
end;
$$;
alter default privileges in schema public revoke all on tables from public, anon, authenticated;

create index erp_sales_orders_rep_date_idx on public.sales_orders (sales_rep_id, order_date desc, sales_order_id desc);
create index erp_sales_orders_customer_idx on public.sales_orders (customer_id, order_date desc);
create index erp_sales_orders_date_idx on public.sales_orders (order_date desc, sales_order_id desc);
create unique index erp_sales_orders_id_idx on public.sales_orders (sales_order_id);
create index erp_sales_order_lines_order_idx on public.sales_order_lines (sales_order_id);
create index erp_deliveries_order_idx on public.deliveries (sales_order_id);
create index erp_sales_invoices_order_idx on public.sales_invoices (sales_order_id);
create index erp_customer_payments_invoice_idx on public.customer_payments (invoice_id);
create index erp_customers_rep_idx on public.customers (sales_rep_id);
create sequence public.erp_sales_order_id;
create sequence public.erp_sales_order_line_id;
select setval('public.erp_sales_order_id', coalesce(max(sales_order_id), 0) + 1, false) from public.sales_orders;
select setval('public.erp_sales_order_line_id', coalesce(max(sales_order_line_id), 0) + 1, false) from public.sales_order_lines;
revoke all on sequence public.erp_sales_order_id, public.erp_sales_order_line_id from public, anon, authenticated;

create function public.sales_team() returns table (employee_id bigint)
language sql stable security definer set search_path = '' as $$
  with recursive team as (
    select a.employee_id from public.erp_actor() a where a.department_code in ('SAL', 'MGT')
    union
    select e.employee_id from public.employees e join team t on e.manager_id = t.employee_id
  )
  select employee_id from team;
$$;

create function public.sales_order_visible(p_order bigint) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.sales_orders o join public.customers c using (customer_id)
    where o.sales_order_id = p_order
      and (o.sales_rep_id in (select employee_id from public.sales_team())
        or c.sales_rep_id in (select employee_id from public.sales_team()))
  );
$$;

create function public.sales_orders_page(p_status text default null, p_customer bigint default null, p_rep bigint default null,
  p_from date default null, p_to date default null, p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.sales_team()) then
    raise exception 'Sales access required' using errcode = '42501';
  end if;
  return (
    with team as (select employee_id from public.sales_team()),
    visible as (
      select o.sales_order_id as id, o.order_number as number, o.order_date as date, o.status,
        c.customer_id, c.name as customer, o.sales_rep_id as rep_id, concat_ws(' ', e.first_name, e.last_name) as rep,
        o.total_amount as total
      from public.sales_orders o join public.customers c using (customer_id)
      join public.employees e on e.employee_id = o.sales_rep_id
      where (o.sales_rep_id in (select employee_id from team) or c.sales_rep_id in (select employee_id from team))
        and (p_status is null or o.status = p_status)
        and (p_customer is null or o.customer_id = p_customer)
        and (p_rep is null or o.sales_rep_id = p_rep)
        and (p_from is null or o.order_date >= p_from)
        and (p_to is null or o.order_date <= p_to)
    ), slice as (
      select * from visible order by date desc, id desc limit 30 offset ((greatest(p_page, 1)::bigint - 1) * 30)
    )
    select jsonb_build_object('total', (select count(*) from visible), 'page_size', 30,
      'rows', coalesce((select jsonb_agg(to_jsonb(s) - 'customer_id' - 'rep_id' order by s.date desc, s.id desc) from slice s), '[]'::jsonb),
      'statuses', (select jsonb_agg(status order by status) from (select distinct status from public.sales_orders) s),
      'customers', coalesce((select jsonb_agg(jsonb_build_object('id', c.customer_id, 'name', c.name) order by c.name)
        from public.customers c where c.sales_rep_id in (select employee_id from team)), '[]'::jsonb),
      'reps', coalesce((select jsonb_agg(jsonb_build_object('id', e.employee_id, 'name', concat_ws(' ', e.first_name, e.last_name)) order by e.first_name, e.last_name)
        from public.employees e where e.employee_id in (select employee_id from team)
          and exists (select 1 from public.customers c where c.sales_rep_id = e.employee_id)), '[]'::jsonb))
  );
end;
$$;

create function public.sales_order(p_id bigint)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.sales_order_visible(p_id) then
    return null;
  end if;
  return (
    select jsonb_build_object('number', o.order_number, 'status', o.status, 'date', o.order_date, 'requested', o.requested_date,
      'cancelled', o.cancelled_date, 'cancel_reason', o.cancel_reason,
      'customer', c.name, 'customer_code', c.customer_code, 'rep', concat_ws(' ', e.first_name, e.last_name), 'warehouse', w.name,
      'subtotal', o.subtotal, 'vat', o.vat_amount, 'total', o.total_amount,
      'lines', coalesce((select jsonb_agg(jsonb_build_object('id', l.sales_order_line_id, 'sku', p.sku, 'product', p.name,
          'quantity', l.quantity, 'unit_price', l.unit_price, 'discount', l.discount_pct, 'amount', l.line_amount) order by l.line_no)
        from public.sales_order_lines l join public.products p using (product_id) where l.sales_order_id = o.sales_order_id), '[]'::jsonb),
      'deliveries', coalesce((select jsonb_agg(jsonb_build_object('id', d.delivery_id, 'number', d.delivery_number, 'date', d.ship_date, 'warehouse', dw.name) order by d.ship_date, d.delivery_id)
        from public.deliveries d join public.warehouses dw using (warehouse_id) where d.sales_order_id = o.sales_order_id), '[]'::jsonb),
      'invoices', coalesce((select jsonb_agg(jsonb_build_object('id', i.invoice_id, 'number', i.invoice_number, 'date', i.invoice_date, 'due', i.due_date,
          'total', i.total_amount, 'status', i.status, 'delivery', d.delivery_number,
          'payments', coalesce((select jsonb_agg(jsonb_build_object('id', pay.payment_id, 'number', pay.payment_number, 'date', pay.payment_date,
              'amount', pay.amount, 'method', pay.method) order by pay.payment_date, pay.payment_id)
            from public.customer_payments pay where pay.invoice_id = i.invoice_id), '[]'::jsonb)) order by i.invoice_date, i.invoice_id)
        from public.sales_invoices i left join public.deliveries d using (delivery_id) where i.sales_order_id = o.sales_order_id), '[]'::jsonb))
    from public.sales_orders o join public.customers c using (customer_id) join public.employees e on e.employee_id = o.sales_rep_id
    join public.warehouses w on w.warehouse_id = o.warehouse_id
    where o.sales_order_id = p_id
  );
end;
$$;

create function public.sales_order_form()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.sales_team()) then
    raise exception 'Sales access required' using errcode = '42501';
  end if;
  return jsonb_build_object('today', public.leave_today(),
    'customers', coalesce((select jsonb_agg(jsonb_build_object('id', c.customer_id, 'code', c.customer_code, 'name', c.name, 'warehouse', w.name) order by c.name)
      from public.customers c join public.warehouses w on w.warehouse_id = c.default_warehouse_id
      where c.is_active = 1 and c.sales_rep_id in (select employee_id from public.sales_team())), '[]'::jsonb),
    'products', coalesce((select jsonb_agg(jsonb_build_object('id', p.product_id, 'sku', p.sku, 'name', p.name, 'price', p.list_price) order by p.sku)
      from public.products p where p.is_active = 1 and p.discontinued_date is null and p.list_price > 0), '[]'::jsonb));
end;
$$;

create function public.sales_order_input(p_lines jsonb)
returns table (line_no bigint, product_id bigint, quantity numeric, discount_pct numeric)
language sql immutable set search_path = '' as $$
  select x.ordinality, (x.value->>'product')::bigint, (x.value->>'quantity')::numeric, coalesce((x.value->>'discount')::numeric, 0)
  from jsonb_array_elements(p_lines) with ordinality as x(value, ordinality);
$$;

create function public.create_sales_order(p_customer bigint, p_requested date, p_lines jsonb)
returns bigint language plpgsql security definer set search_path = '' as $$
declare
  customer public.customers%rowtype;
  order_id bigint;
  net numeric;
  tax numeric;
  short record;
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

revoke all on function public.sales_team(), public.sales_order_visible(bigint), public.sales_order_input(jsonb),
  public.sales_orders_page(text, bigint, bigint, date, date, integer), public.sales_order(bigint), public.sales_order_form(),
  public.create_sales_order(bigint, date, jsonb) from public, anon, authenticated;
grant execute on function public.sales_orders_page(text, bigint, bigint, date, date, integer), public.sales_order(bigint),
  public.sales_order_form(), public.create_sales_order(bigint, date, jsonb) to authenticated;
