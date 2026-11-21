alter table public.purchase_requisitions enable row level security;
alter table public.purchase_requisition_lines enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.purchase_order_lines enable row level security;
alter table public.goods_receipts enable row level security;
alter table public.goods_receipt_lines enable row level security;
alter table public.supplier_invoices enable row level security;
alter table public.supplier_payments enable row level security;
revoke all on public.purchase_requisitions, public.purchase_requisition_lines, public.purchase_orders, public.purchase_order_lines,
  public.goods_receipts, public.goods_receipt_lines, public.supplier_invoices, public.supplier_payments from public,anon,authenticated;

create unique index erp_requisition_id_idx on public.purchase_requisitions (requisition_id);
create unique index erp_purchase_order_id_idx on public.purchase_orders (purchase_order_id);
create unique index erp_purchase_order_requisition_idx on public.purchase_orders (requisition_id);
create index erp_receipt_order_idx on public.goods_receipts (purchase_order_id);
create index erp_receipt_line_idx on public.goods_receipt_lines (goods_receipt_id);
create index erp_supplier_invoice_order_idx on public.supplier_invoices (purchase_order_id);
create index erp_supplier_payment_invoice_idx on public.supplier_payments (supplier_invoice_id);
create index erp_purchase_requisition_lines_idx on public.purchase_requisition_lines (requisition_id);
create index erp_purchase_order_lines_idx on public.purchase_order_lines (purchase_order_id);
create sequence public.erp_requisition_id;
create sequence public.erp_requisition_line_id;
create sequence public.erp_purchase_order_id;
create sequence public.erp_purchase_order_line_id;
select setval('public.erp_requisition_id', coalesce(max(requisition_id),0)+1,false) from public.purchase_requisitions;
select setval('public.erp_requisition_line_id', coalesce(max(requisition_line_id),0)+1,false) from public.purchase_requisition_lines;
select setval('public.erp_purchase_order_id', coalesce(max(purchase_order_id),0)+1,false) from public.purchase_orders;
select setval('public.erp_purchase_order_line_id', coalesce(max(po_line_id),0)+1,false) from public.purchase_order_lines;
revoke all on sequence public.erp_requisition_id,public.erp_requisition_line_id,public.erp_purchase_order_id,public.erp_purchase_order_line_id from public,anon,authenticated;

create function public.procurement_can_read() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.erp_actor() a where a.department_code in ('PUR','WHS','FIN','MGT'));
$$;

create function public.procurement_approval_level(p_amount numeric) returns text language sql immutable set search_path = '' as $$
  select case when p_amount < 50000 then 'AUTO' when p_amount <= 300000 then 'PURCHASING_MANAGER' else 'MANAGING_DIRECTOR' end;
$$;

create function public.procurement_approver(p_level text) returns bigint language sql stable security definer set search_path = '' as $$
  select e.employee_id from public.employees e join public.departments d using (department_id)
  where e.is_active=1 and (e.termination_date is null or e.termination_date>current_date)
    and ((p_level='MANAGING_DIRECTOR' and e.employee_code='E0001')
      or (p_level='PURCHASING_MANAGER' and d.code='PUR' and e.job_title='Purchasing Manager'))
  order by e.employee_id limit 1;
$$;

create function public.procurement_dashboard(p_status text default null, p_page integer default 1, p_hold_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.procurement_can_read() then raise exception 'Procurement access required' using errcode = '42501'; end if;
  return (
    with orders as (
      select p.purchase_order_id as id,p.po_number as number,s.name as supplier,p.order_date as date,p.status,p.total_amount as total
      from public.purchase_orders p join public.suppliers s using (supplier_id)
      where p_status is null or p.status=p_status
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
    select jsonb_build_object('orders',jsonb_build_object('total',(select count(*) from orders),'page_size',30,
      'rows',coalesce((select jsonb_agg(to_jsonb(o) order by o.date desc,o.id desc) from slice o),'[]'::jsonb)),
      'holds',jsonb_build_object('total',(select count(*) from holds),'page_size',30,
      'rows',coalesce((select jsonb_agg(to_jsonb(h) order by h.id desc) from hold_slice h),'[]'::jsonb)),
      'statuses',(select jsonb_agg(status order by status) from (select distinct status from public.purchase_orders) s),
      'queue',coalesce((select jsonb_agg(to_jsonb(q) order by q.id desc) from queue q),'[]'::jsonb))
  );
end;
$$;

create function public.procurement_order(p_id bigint)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.procurement_can_read() then raise exception 'Procurement access required' using errcode = '42501'; end if;
  return (
    select jsonb_build_object('number',p.po_number,'status',p.status,'date',p.order_date,'expected',p.expected_date,'total',p.total_amount,'supplier',s.name,
      'requisition',jsonb_build_object('number',r.requisition_number,'date',r.request_date,'decision',r.decision_date,'approval',r.approval_level,
        'approver',nullif(concat_ws(' ',a.first_name,a.last_name),'')),
      'lines',coalesce((select jsonb_agg(jsonb_build_object('id',l.po_line_id,'sku',prod.sku,'product',prod.name,'quantity',l.quantity,'received',l.received_quantity,'unit_cost',l.unit_cost) order by l.line_no)
        from public.purchase_order_lines l join public.products prod using(product_id) where l.purchase_order_id=p.purchase_order_id),'[]'::jsonb),
      'receipts',coalesce((select jsonb_agg(jsonb_build_object('id',g.goods_receipt_id,'number',g.gr_number,'date',g.receipt_date,'delivery',g.delivery_no,
        'lines',coalesce((select jsonb_agg(jsonb_build_object('id',l.gr_line_id,'sku',prod.sku,'received',l.quantity_received,'accepted',l.quantity_accepted,'rejected',l.quantity_rejected,'reason',l.rejection_reason) order by l.gr_line_id)
          from public.goods_receipt_lines l join public.products prod using(product_id) where l.goods_receipt_id=g.goods_receipt_id),'[]'::jsonb)) order by g.delivery_no,g.goods_receipt_id)
        from public.goods_receipts g where g.purchase_order_id=p.purchase_order_id),'[]'::jsonb),
      'invoices',coalesce((select jsonb_agg(jsonb_build_object('id',i.supplier_invoice_id,'number',i.document_number,'date',i.invoice_date,'receipt',g.gr_number,
        'status',i.status,'match',i.match_status,'reason',i.hold_reason,'resolution',i.resolution,'receipt_value',i.receipt_value,'billed',i.billed_total_amount,'approved',i.total_amount,
        'payments',coalesce((select jsonb_agg(jsonb_build_object('id',pay.supplier_payment_id,'number',pay.payment_number,'date',pay.payment_date,'amount',pay.amount) order by pay.payment_date,pay.supplier_payment_id)
          from public.supplier_payments pay where pay.supplier_invoice_id=i.supplier_invoice_id),'[]'::jsonb)) order by i.invoice_date,i.supplier_invoice_id)
        from public.supplier_invoices i left join public.goods_receipts g using(goods_receipt_id) where i.purchase_order_id=p.purchase_order_id),'[]'::jsonb))
    from public.purchase_orders p join public.suppliers s using(supplier_id) left join public.purchase_requisitions r using(requisition_id)
    left join public.employees a on a.employee_id=r.approver_id where p.purchase_order_id=p_id
  );
end;
$$;

create function public.procurement_convert(p_id bigint, p_actor bigint)
returns bigint language plpgsql security definer set search_path = '' as $$
declare r public.purchase_requisitions%rowtype; order_id bigint; net numeric; tax numeric; due_days integer;
begin
  select * into r from public.purchase_requisitions where requisition_id=p_id for update;
  if r.status is distinct from 'PENDING_APPROVAL' then raise exception 'Requisition is no longer pending' using errcode='22023'; end if;
  select round(sum(quantity*estimated_unit_cost),2) into net from public.purchase_requisition_lines where requisition_id=p_id;
  if net is null or net <= 0 then raise exception 'Requisition has no valid lines' using errcode='22023'; end if;
  select coalesce(max(sp.lead_time_days),0)::integer into due_days from public.purchase_requisition_lines l
    join public.supplier_products sp on sp.product_id=l.product_id and sp.supplier_id=r.supplier_id where l.requisition_id=p_id;
  order_id:=nextval('public.erp_purchase_order_id');
  tax:=round(net*0.07,2);
  insert into public.purchase_orders (purchase_order_id,po_number,supplier_id,requisition_id,buyer_id,warehouse_id,order_date,expected_date,status,subtotal,vat_amount,total_amount)
  values(order_id,'PO-W-'||order_id,r.supplier_id,p_id,p_actor,r.warehouse_id,public.leave_today(),public.leave_today()+due_days,'OPEN',net,tax,net+tax);
  insert into public.purchase_order_lines (po_line_id,purchase_order_id,line_no,product_id,quantity,unit_cost,line_amount,received_quantity)
    select nextval('public.erp_purchase_order_line_id'),order_id,line_no,product_id,quantity,estimated_unit_cost,round(quantity*estimated_unit_cost,2),0
    from public.purchase_requisition_lines where requisition_id=p_id;
  update public.purchase_requisitions set status='CONVERTED',decision_date=public.leave_today(),approver_id=p_actor where requisition_id=p_id;
  return order_id;
end;
$$;

create function public.procurement_suggestion(p_product bigint,p_warehouse bigint) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('product',p.name,'sku',p.sku,'warehouse',w.name,'supplier',s.name,'supplier_id',s.supplier_id,'unit_cost',sp.unit_cost,
    'minimum',greatest(coalesce(sp.min_order_qty,1),1),'quantity',greatest(i.reorder_qty,coalesce(sp.min_order_qty,1),1))
  from public.inventory_policies i join public.products p using(product_id) join public.warehouses w using(warehouse_id)
  join lateral (select candidate.* from public.supplier_products candidate where candidate.product_id=p_product and candidate.unit_cost>0
      and (candidate.valid_from is null or candidate.valid_from<=public.leave_today())
    order by candidate.is_preferred desc nulls last,candidate.unit_cost,candidate.supplier_product_id limit 1) sp on true
  join public.suppliers s on s.supplier_id=sp.supplier_id
  left join public.stock_position(public.stock_snapshot_date(),p_warehouse,p_product) pos on true
  where i.product_id=p_product and i.warehouse_id=p_warehouse and coalesce(pos.quantity,0)<i.reorder_point
    and exists(select 1 from public.erp_actor() a where a.department_code in ('WHS','PUR','MGT'));
$$;

create function public.create_requisition(p_product bigint,p_warehouse bigint,p_quantity integer) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare actor bigint; suggestion jsonb; cost numeric; amount numeric; tier text; requisition bigint; order_id bigint;
begin
  select employee_id into actor from public.erp_actor() where department_code in ('WHS','PUR','MGT');
  if actor is null then raise exception 'Requisition access required' using errcode='42501'; end if;
  suggestion:=public.procurement_suggestion(p_product,p_warehouse);
  if suggestion is null or p_quantity is null or p_quantity<(suggestion->>'minimum')::integer then
    raise exception 'Choose a low-stock product and order at least the supplier minimum' using errcode='22023';
  end if;
  cost:=(suggestion->>'unit_cost')::numeric;
  amount:=round(cost*p_quantity,2);
  tier:=public.procurement_approval_level(amount);
  requisition:=nextval('public.erp_requisition_id');
  insert into public.purchase_requisitions(requisition_id,requisition_number,source,requested_by,warehouse_id,supplier_id,request_date,estimated_amount,approval_level,status,approver_id)
  values(requisition,'PR-W-'||requisition,'AUTO_REORDER',actor,p_warehouse,(suggestion->>'supplier_id')::bigint,public.leave_today(),amount,tier,'PENDING_APPROVAL',public.procurement_approver(tier));
  insert into public.purchase_requisition_lines(requisition_line_id,requisition_id,line_no,product_id,quantity,estimated_unit_cost)
  values(nextval('public.erp_requisition_line_id'),requisition,1,p_product,p_quantity,cost);
  if tier='AUTO' then order_id:=public.procurement_convert(requisition,actor); end if;
  return jsonb_build_object('order_id',order_id,'number','PR-W-'||requisition);
end;
$$;

create function public.decide_requisition(p_id bigint,p_approve boolean,p_reason text default null) returns bigint
language plpgsql security definer set search_path = '' as $$
declare r public.purchase_requisitions%rowtype; actor bigint; approver bigint; line_total numeric;
begin
  select employee_id into actor from public.erp_actor();
  select * into r from public.purchase_requisitions where requisition_id=p_id for update;
  select round(sum(quantity*estimated_unit_cost),2) into line_total from public.purchase_requisition_lines where requisition_id=p_id;
  approver:=public.procurement_approver(public.procurement_approval_level(greatest(r.estimated_amount,line_total)));
  if actor is null or approver is distinct from actor then raise exception 'Assigned approver required' using errcode='42501'; end if;
  if r.status is distinct from 'PENDING_APPROVAL' or p_approve is null then raise exception 'Requisition is no longer pending' using errcode='22023'; end if;
  if p_approve then return public.procurement_convert(p_id,actor); end if;
  if coalesce(length(btrim(p_reason)),0) not between 1 and 1000 then raise exception 'Enter a rejection reason' using errcode='22023'; end if;
  update public.purchase_requisitions set status='REJECTED',decision_date=public.leave_today(),approver_id=actor,rejection_reason=btrim(p_reason) where requisition_id=p_id;
  return null;
end;
$$;

create function public.procurement_scorecard()
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.procurement_can_read() then raise exception 'Procurement access required' using errcode = '42501'; end if;
  return coalesce((
    with receipts as (
      select p.supplier_id, count(*) as receipts, count(*) filter (where g.receipt_date <= p.expected_date) as on_time
      from public.goods_receipts g join public.purchase_orders p using (purchase_order_id) group by 1
    ), quality as (
      select p.supplier_id, sum(l.quantity_received) as received, sum(l.quantity_rejected) as rejected
      from public.goods_receipt_lines l join public.goods_receipts g using (goods_receipt_id)
      join public.purchase_orders p using (purchase_order_id) group by 1
    ), invoices as (
      select supplier_id, count(*) as invoices, count(*) filter (where match_status = 'EXCEPTION') as exceptions
      from public.supplier_invoices group by 1
    )
    select jsonb_agg(jsonb_build_object('id', s.supplier_id, 'supplier', s.name, 'receipts', r.receipts,
      'on_time_rate', round(r.on_time::numeric / nullif(r.receipts, 0), 4),
      'rejection_rate', round(q.rejected / nullif(q.received, 0), 4),
      'invoices', coalesce(i.invoices, 0), 'exception_rate', round(coalesce(i.exceptions, 0)::numeric / nullif(i.invoices, 0), 4))
      order by r.on_time::numeric / nullif(r.receipts, 0), s.name)
    from public.suppliers s join receipts r using (supplier_id) left join quality q using (supplier_id) left join invoices i using (supplier_id)
  ), '[]'::jsonb);
end;
$$;

revoke all on function public.procurement_can_read(),public.procurement_approval_level(numeric),public.procurement_approver(text),
  public.procurement_dashboard(text,integer,integer),public.procurement_order(bigint),public.procurement_convert(bigint,bigint),
  public.procurement_suggestion(bigint,bigint),public.create_requisition(bigint,bigint,integer),public.decide_requisition(bigint,boolean,text),
  public.procurement_scorecard() from public,anon,authenticated;
grant execute on function public.procurement_dashboard(text,integer,integer),public.procurement_order(bigint),
  public.procurement_suggestion(bigint,bigint),public.create_requisition(bigint,bigint,integer),public.decide_requisition(bigint,boolean,text),
  public.procurement_scorecard() to authenticated;
