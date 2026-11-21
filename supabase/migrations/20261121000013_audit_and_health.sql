create table public.audit_log (
  id bigint generated always as identity primary key,
  changed_at timestamptz not null default now(),
  actor_employee_id bigint references public.employees (employee_id),
  actor text not null,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  changes jsonb not null
);
create index audit_log_changed_at_idx on public.audit_log (changed_at desc, id desc);
create index audit_log_record_idx on public.audit_log (table_name, record_id);
alter table public.audit_log enable row level security;
revoke all on public.audit_log from public, anon, authenticated;

create function public.audit_actor() returns table (employee_id bigint, label text)
language sql stable security definer set search_path = '' as $$
  select e.employee_id, coalesce(e.email, (select auth.jwt() ->> 'email'), 'system')
  from (select 1) one
  left join auth.users u on u.id = (select auth.uid())
  left join public.employees e on lower(e.email) = lower(u.email);
$$;

create function public.audit_row() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  old_row jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  new_row jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  diff jsonb;
  actor record;
begin
  if tg_op = 'UPDATE' then
    select coalesce(jsonb_object_agg(n.key, jsonb_build_object('from', old_row -> n.key, 'to', n.value)), '{}'::jsonb) into diff
    from jsonb_each(new_row) n where n.value is distinct from old_row -> n.key;
    if diff = '{}'::jsonb then
      return new;
    end if;
  else
    diff := coalesce(new_row, old_row);
  end if;
  select * into actor from public.audit_actor();
  insert into public.audit_log (actor_employee_id, actor, table_name, record_id, action, changes)
  values (actor.employee_id, actor.label, tg_table_name, coalesce(new_row, old_row) ->> tg_argv[0], tg_op, diff);
  return coalesce(new, old);
end;
$$;

create trigger audit_employees after insert or update or delete on public.employees
  for each row execute function public.audit_row('employee_id');
create trigger audit_employee_admins after insert or update or delete on public.employee_admins
  for each row execute function public.audit_row('employee_id');
create trigger audit_leave_requests after insert or update or delete on public.leave_requests
  for each row execute function public.audit_row('id');
create trigger audit_purchase_requisitions after insert or update or delete on public.purchase_requisitions
  for each row execute function public.audit_row('requisition_id');
create trigger audit_purchase_orders after insert or update or delete on public.purchase_orders
  for each row execute function public.audit_row('purchase_order_id');
create trigger audit_sales_orders after insert or update or delete on public.sales_orders
  for each row execute function public.audit_row('sales_order_id');
create trigger audit_sales_invoices after update or delete on public.sales_invoices
  for each row execute function public.audit_row('invoice_id');
create trigger audit_customer_payments after insert or update or delete on public.customer_payments
  for each row execute function public.audit_row('payment_id');

create function public.record_account_change(p_action text, p_account text, p_email text)
returns void language plpgsql security definer set search_path = '' as $$
declare actor record;
begin
  if not public.employee_is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_action not in ('INSERT', 'UPDATE', 'DELETE') then
    raise exception 'Unknown account action' using errcode = '22023';
  end if;
  select * into actor from public.audit_actor();
  insert into public.audit_log (actor_employee_id, actor, table_name, record_id, action, changes)
  values (actor.employee_id, actor.label, 'login_accounts', p_account, p_action, jsonb_build_object('email', p_email));
end;
$$;

create function public.audit_entries(p_table text default null, p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.employee_is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  return (
    with entries as (select * from public.audit_log where p_table is null or table_name = p_table),
    slice as (select * from entries order by changed_at desc, id desc limit 50 offset ((greatest(p_page, 1)::bigint - 1) * 50))
    select jsonb_build_object('total', (select count(*) from entries), 'page_size', 50,
      'tables', (select coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb) from (select distinct table_name from public.audit_log) t),
      'rows', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'changed_at', changed_at, 'actor', actor, 'table', table_name,
        'record', record_id, 'action', action, 'changes', changes) order by changed_at desc, id desc) from slice), '[]'::jsonb))
  );
end;
$$;

create function public.system_health()
returns jsonb language sql stable security definer set search_path = '' as $$
  with ledger as (
    select coalesce(round(sum(debit::numeric), 2), 0) as debit, coalesce(round(sum(credit::numeric), 2), 0) as credit,
      coalesce(round(sum(debit::numeric - credit::numeric) filter (where account_code = '1100'), 2), 0) as receivable
    from public.journal_lines
  ), open_items as (
    select coalesce(round(sum(i.total_amount - coalesce(p.amount, 0)), 2), 0) as amount,
      count(*) filter (where i.status = 'PAID' and coalesce(p.amount, 0) <> i.total_amount) +
      count(*) filter (where i.status = 'OPEN' and coalesce(p.amount, 0) <> 0) +
      count(*) filter (where i.status = 'PARTIALLY_PAID' and not (coalesce(p.amount, 0) > 0 and p.amount < i.total_amount)) as mismatched
    from public.sales_invoices i
    left join (select invoice_id, sum(amount) as amount from public.customer_payments group by 1) p using (invoice_id)
  ), unbalanced as (
    select count(*) as entries from (select journal_entry_id from public.journal_lines group by 1 having round(sum(debit::numeric), 2) <> round(sum(credit::numeric), 2)) x
  )
  select jsonb_build_object(
    'ledger_balanced', ledger.debit = ledger.credit and unbalanced.entries = 0,
    'receivables_reconciled', ledger.receivable = (select amount from open_items),
    'invoice_status_consistent', (select mismatched from open_items) = 0,
    'checked_at', now())
  from ledger, unbalanced;
$$;

revoke all on function public.audit_actor(), public.audit_row(), public.record_account_change(text, text, text),
  public.audit_entries(text, integer), public.system_health() from public, anon, authenticated;
grant execute on function public.record_account_change(text, text, text), public.audit_entries(text, integer) to authenticated;
grant execute on function public.system_health() to service_role;
