alter table public.inventory_transactions enable row level security;
alter table public.inventory_policies enable row level security;
revoke all on public.inventory_transactions, public.inventory_policies from public, anon, authenticated;
create index inventory_txn_product_warehouse_date_idx on public.inventory_transactions (product_id, warehouse_id, txn_date);
create index inventory_txn_date_idx on public.inventory_transactions (txn_date);

create function public.stock_snapshot_date() returns date
language sql immutable set search_path = '' as $$ select date '2026-10-31'; $$;

create function public.stock_can_read() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.erp_actor() a where a.department_code in ('WHS','PUR','SAL','FIN','MGT'));
$$;

create function public.stock_position(p_as_of date, p_warehouse bigint default null, p_product bigint default null)
returns table (product_id bigint, warehouse_id bigint, quantity numeric, value numeric)
language sql stable security definer set search_path = '' as $$
  select t.product_id, t.warehouse_id, sum(t.quantity)::numeric, sum(t.quantity * t.unit_cost)::numeric
  from public.inventory_transactions t where t.txn_date <= p_as_of
    and (p_warehouse is null or t.warehouse_id = p_warehouse)
    and (p_product is null or t.product_id = p_product)
  group by t.product_id, t.warehouse_id;
$$;

create function public.stock_dashboard(p_warehouse bigint default null, p_category bigint default null,
  p_low boolean default false, p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.stock_can_read() then raise exception 'Stock access required' using errcode = '42501'; end if;
  return (
    with dates as (
      select date_trunc('month', min(txn_date))::date as first_month from public.inventory_transactions where txn_type <> 'OPENING'
    ), months as (
      select generate_series(first_month, date_trunc('month', public.stock_snapshot_date()), interval '1 month')::date as month from dates
    ), warehouse_data as (
      select warehouse_id as id, name from public.warehouses where p_warehouse is null or warehouse_id = p_warehouse
    ), changes as (
      select t.warehouse_id, greatest(d.first_month, date_trunc('month', t.txn_date)::date) as month, sum(t.quantity * t.unit_cost) as value
      from public.inventory_transactions t join warehouse_data w on w.id = t.warehouse_id
      join public.products p using (product_id) cross join dates d
      where t.txn_date <= public.stock_snapshot_date() and (p_category is null or p.category_id = p_category)
      group by 1, 2
    ), monthly as (
      select m.month, w.id as warehouse_id, w.name as warehouse,
        round(sum(coalesce(c.value,0)) over (partition by w.id order by m.month), 2) as value
      from months m cross join warehouse_data w left join changes c on c.warehouse_id=w.id and c.month=m.month
    ), demand as (
      select t.product_id, t.warehouse_id,
        -sum(t.quantity) filter (where t.txn_date > public.stock_snapshot_date() - 90) as shipped_90,
        max(t.txn_date) as last_shipment
      from public.inventory_transactions t join warehouse_data w on w.id = t.warehouse_id
      where t.txn_type = 'SHIPMENT' and t.txn_date <= public.stock_snapshot_date()
      group by 1, 2
    ), stock as (
      select p.product_id, p.sku, p.name as product, w.id as warehouse_id, w.name as warehouse,
        coalesce(s.quantity,0) as quantity, round(coalesce(s.value,0),2) as value, i.reorder_point,
        (coalesce(s.quantity,0) < i.reorder_point) as low,
        case when d.shipped_90 > 0 then round(coalesce(s.quantity,0) / (d.shipped_90 / 90.0)) end as days_of_cover,
        case when coalesce(s.quantity,0) < i.reorder_point then 'BELOW_REORDER_POINT'
          when coalesce(s.quantity,0) > 0 and (d.last_shipment is null or d.last_shipment <= public.stock_snapshot_date() - 180) then 'DEAD_STOCK'
          when coalesce(s.quantity,0) > 0 and coalesce(d.shipped_90,0) = 0 then 'SLOW_STOCK'
          when d.shipped_90 > 0 and coalesce(s.quantity,0) / (d.shipped_90 / 90.0) > 180 then 'SLOW_STOCK'
          else 'IN_STOCK' end as stock_status
      from public.inventory_policies i join public.products p using (product_id) join warehouse_data w on w.id=i.warehouse_id
      left join public.stock_position(public.stock_snapshot_date(),p_warehouse,null) s on s.product_id=p.product_id and s.warehouse_id=w.id
      left join demand d on d.product_id=p.product_id and d.warehouse_id=w.id
      where p_category is null or p.category_id=p_category
    ), shrinkage as (
      select w.id as warehouse_id, w.name as warehouse,
        coalesce(-sum(t.quantity) filter (where t.quantity < 0), 0) as units_lost,
        round(coalesce(-sum(t.quantity * t.unit_cost) filter (where t.quantity < 0), 0), 2) as value_lost,
        round(coalesce(sum(t.quantity * t.unit_cost), 0), 2) as net_value
      from warehouse_data w
      left join (public.inventory_transactions t join public.products p using (product_id))
        on t.warehouse_id = w.id and t.txn_type = 'ADJUSTMENT'
        and t.txn_date > (public.stock_snapshot_date() - interval '12 months')::date and t.txn_date <= public.stock_snapshot_date()
        and (p_category is null or p.category_id = p_category)
      group by 1, 2
    ), filtered as (
      select * from stock where not p_low or low
    ), slice as (
      select * from filtered order by sku,warehouse_id limit 40 offset ((greatest(p_page,1)::bigint - 1) * 40)
    )
    select jsonb_build_object('as_of',public.stock_snapshot_date(),'page_size',40,'total',(select count(*) from filtered),
      'rows',coalesce((select jsonb_agg(to_jsonb(s) order by s.sku,s.warehouse_id) from slice s),'[]'::jsonb),
      'months',coalesce((select jsonb_agg(to_jsonb(m) order by m.month desc,m.warehouse_id) from monthly m),'[]'::jsonb),
      'shrinkage',coalesce((select jsonb_agg(to_jsonb(k) order by k.value_lost desc) from shrinkage k),'[]'::jsonb),
      'warehouses',(select jsonb_agg(jsonb_build_object('id',warehouse_id,'name',name) order by name) from public.warehouses),
      'categories',(select jsonb_agg(jsonb_build_object('id',category_id,'name',name) order by name) from public.product_categories),
      'can_request',exists(select 1 from public.erp_actor() a where a.department_code in ('WHS','PUR','MGT')))
  );
end;
$$;

create function public.stock_movements(p_product bigint, p_warehouse bigint default null, p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.stock_can_read() then raise exception 'Stock access required' using errcode = '42501'; end if;
  return (
    with movements as (
      select t.inventory_txn_id as id,t.txn_date as date,t.txn_type as type,t.quantity,t.unit_cost,w.name as warehouse
      from public.inventory_transactions t join public.warehouses w using (warehouse_id)
      where t.product_id=p_product and t.txn_date<=public.stock_snapshot_date() and (p_warehouse is null or t.warehouse_id=p_warehouse)
    ), slice as (
      select * from movements order by date desc,id desc limit 40 offset ((greatest(p_page,1)::bigint - 1)*40)
    )
    select jsonb_build_object('name',p.name,'sku',p.sku,'total',(select count(*) from movements),'page_size',40,
      'rows',coalesce((select jsonb_agg(to_jsonb(s) order by s.date desc,s.id desc) from slice s),'[]'::jsonb))
    from public.products p where p.product_id=p_product
  );
end;
$$;

revoke all on function public.stock_snapshot_date(),public.stock_can_read(),public.stock_position(date,bigint,bigint),
  public.stock_dashboard(bigint,bigint,boolean,integer),public.stock_movements(bigint,bigint,integer) from public,anon,authenticated;
grant execute on function public.stock_dashboard(bigint,bigint,boolean,integer),public.stock_movements(bigint,bigint,integer) to authenticated;
