create unique index erp_journal_entries_id_idx on public.journal_entries (journal_entry_id);
create index erp_journal_entries_date_idx on public.journal_entries (entry_date, journal_entry_id);
create index erp_journal_lines_entry_idx on public.journal_lines (journal_entry_id);
create index erp_journal_lines_account_idx on public.journal_lines (account_code, journal_entry_id);
create sequence public.erp_journal_entry_id;
create sequence public.erp_journal_line_id;
select setval('public.erp_journal_entry_id', coalesce(max(journal_entry_id), 0) + 1, false) from public.journal_entries;
select setval('public.erp_journal_line_id', coalesce(max(journal_line_id), 0) + 1, false) from public.journal_lines;
revoke all on sequence public.erp_journal_entry_id, public.erp_journal_line_id from public, anon, authenticated;

create function public.accounting_can_read() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.erp_actor() a where a.department_code in ('FIN', 'MGT'));
$$;

create function public.journal_source_link(p_type text, p_id bigint, p_description text) returns text
language sql stable security definer set search_path = '' as $$
  select case p_type
    when 'SALES_INVOICE' then '/receivables/invoices/' || p_id
    when 'CUSTOMER_PAYMENT' then (select '/receivables/invoices/' || p.invoice_id from public.customer_payments p where p.payment_id = p_id)
    when 'DELIVERY' then (select '/receivables/invoices/' || i.invoice_id from public.sales_invoices i where i.delivery_id = p_id limit 1)
    when 'GOODS_RECEIPT' then (select '/purchasing/orders/' || g.purchase_order_id from public.goods_receipts g where g.goods_receipt_id = p_id)
    when 'SUPPLIER_INVOICE' then (select '/purchasing/orders/' || s.purchase_order_id from public.supplier_invoices s where s.supplier_invoice_id = p_id)
    when 'SUPPLIER_PAYMENT' then (select '/purchasing/orders/' || s.purchase_order_id from public.supplier_payments p
      join public.supplier_invoices s using (supplier_invoice_id) where p.supplier_payment_id = p_id)
    when 'INVENTORY_ADJ' then (select '/stock/' || p.product_id || '?warehouse=' || substring(p_description from ' WH([0-9]+)$')
      from public.products p where p.sku = substring(p_description from ' ([A-Z]+-[0-9]{4}) WH[0-9]+$'))
  end;
$$;

create function public.accounting_trial_balance(p_as_of date)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.accounting_can_read() then
    raise exception 'Finance or management access required' using errcode = '42501';
  end if;
  return (
    with totals as (
      select l.account_code, sum(l.debit) as debit, sum(l.credit) as credit
      from public.journal_lines l join public.journal_entries e using (journal_entry_id)
      where e.entry_date <= coalesce(p_as_of, public.erp_as_of_date()) group by 1
    ), rows as (
      select a.account_code as code, a.name, a.account_type as type, a.normal_balance,
        round(coalesce(t.debit, 0), 2) as debit, round(coalesce(t.credit, 0), 2) as credit,
        round(greatest(coalesce(t.debit, 0) - coalesce(t.credit, 0), 0), 2) as debit_balance,
        round(greatest(coalesce(t.credit, 0) - coalesce(t.debit, 0), 0), 2) as credit_balance
      from public.chart_of_accounts a left join totals t using (account_code)
    )
    select jsonb_build_object('as_of', coalesce(p_as_of, public.erp_as_of_date()),
      'rows', (select jsonb_agg(to_jsonb(r) order by r.code) from rows r),
      'debit', (select sum(debit) from rows), 'credit', (select sum(credit) from rows),
      'debit_balance', (select sum(debit_balance) from rows), 'credit_balance', (select sum(credit_balance) from rows))
  );
end;
$$;

create function public.accounting_income_statement(p_year integer)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.accounting_can_read() then
    raise exception 'Finance or management access required' using errcode = '42501';
  end if;
  return (
    with amounts as (
      select date_trunc('month', e.entry_date)::date as month, a.account_code, a.name, a.account_type,
        sum(case when a.account_type = 'REVENUE' then l.credit - l.debit else l.debit - l.credit end) as amount
      from public.journal_lines l join public.journal_entries e using (journal_entry_id)
      join public.chart_of_accounts a using (account_code)
      where a.account_type in ('REVENUE', 'EXPENSE') and extract(year from e.entry_date) = p_year
      group by 1, 2, 3, 4
    ), months as (
      select month,
        round(coalesce(sum(amount) filter (where account_type = 'REVENUE'), 0), 2) as revenue,
        round(coalesce(sum(amount) filter (where account_code = '5000'), 0), 2) as cost_of_sales,
        round(coalesce(sum(amount) filter (where account_type = 'EXPENSE' and account_code <> '5000'), 0), 2) as other_expenses
      from amounts group by 1
    )
    select jsonb_build_object('year', p_year,
      'years', (select jsonb_agg(y order by y desc) from (select distinct extract(year from entry_date)::integer as y from public.journal_entries
        where source_type <> 'OPENING') years),
      'months', coalesce((select jsonb_agg(jsonb_build_object('month', month, 'revenue', revenue, 'cost_of_sales', cost_of_sales,
        'other_expenses', other_expenses) order by month) from months), '[]'::jsonb),
      'accounts', coalesce((select jsonb_agg(jsonb_build_object('code', account_code, 'name', name, 'type', account_type, 'amount', round(total, 2)) order by account_code)
        from (select account_code, name, account_type, sum(amount) as total from amounts group by 1, 2, 3) accounts), '[]'::jsonb))
  );
end;
$$;

create function public.accounting_ledger(p_account text, p_from date, p_to date, p_page integer default 1)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  account public.chart_of_accounts%rowtype;
  direction integer;
  opening numeric;
begin
  if not public.accounting_can_read() then
    raise exception 'Finance or management access required' using errcode = '42501';
  end if;
  select * into account from public.chart_of_accounts where account_code = p_account;
  if account.account_code is null then
    return null;
  end if;
  direction := case when account.normal_balance = 'DEBIT' then 1 else -1 end;
  select coalesce(sum((l.debit - l.credit) * direction), 0) into opening
  from public.journal_lines l join public.journal_entries e using (journal_entry_id)
  where l.account_code = p_account and e.entry_date < p_from;
  return (
    with lines as (
      select l.journal_line_id as id, e.journal_entry_id as entry_id, e.entry_number as entry, e.entry_date as date, e.description,
        e.source_type, e.source_id, l.debit, l.credit,
        opening + sum((l.debit - l.credit) * direction) over (order by e.entry_date, e.journal_entry_id, l.line_no) as balance
      from public.journal_lines l join public.journal_entries e using (journal_entry_id)
      where l.account_code = p_account and e.entry_date between p_from and p_to
    ), slice as (
      select * from lines order by date, entry_id, id limit 50 offset ((greatest(p_page, 1)::bigint - 1) * 50)
    )
    select jsonb_build_object('code', account.account_code, 'name', account.name, 'type', account.account_type,
      'normal_balance', account.normal_balance, 'from', p_from, 'to', p_to, 'opening', round(opening, 2),
      'closing', round(coalesce((select balance from lines order by date desc, entry_id desc, id desc limit 1), opening), 2),
      'debit', round(coalesce((select sum(debit) from lines), 0), 2), 'credit', round(coalesce((select sum(credit) from lines), 0), 2),
      'total', (select count(*) from lines), 'page_size', 50,
      'accounts', (select jsonb_agg(jsonb_build_object('code', c.account_code, 'name', c.name) order by c.account_code) from public.chart_of_accounts c),
      'rows', coalesce((select jsonb_agg(jsonb_build_object('id', s.id, 'entry', s.entry, 'date', s.date, 'description', s.description,
        'source_type', s.source_type, 'debit', s.debit, 'credit', s.credit, 'balance', round(s.balance, 2),
        'link', public.journal_source_link(s.source_type, s.source_id, s.description)) order by s.date, s.entry_id, s.id) from slice s), '[]'::jsonb))
  );
end;
$$;

create or replace function public.record_customer_payment(p_invoice bigint, p_amount numeric, p_date date, p_method text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  invoice public.sales_invoices%rowtype;
  remaining numeric;
  payment_id bigint;
  next_status text;
  entry_id bigint;
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
  entry_id := nextval('public.erp_journal_entry_id');
  insert into public.journal_entries (journal_entry_id, entry_number, entry_date, source_type, source_id, description)
  values (entry_id, 'JV-W-' || entry_id, p_date, 'CUSTOMER_PAYMENT', payment_id,
    'Receipt RC-W-' || payment_id || ' for ' || invoice.invoice_number);
  insert into public.journal_lines (journal_line_id, journal_entry_id, line_no, account_code, debit, credit)
  values (nextval('public.erp_journal_line_id'), entry_id, 1, '1000', p_amount, 0),
    (nextval('public.erp_journal_line_id'), entry_id, 2, '1100', 0, p_amount);
  next_status := case when p_amount = remaining then 'PAID' else 'PARTIALLY_PAID' end;
  update public.sales_invoices set status = next_status where invoice_id = p_invoice;
  return next_status;
end;
$$;

revoke all on function public.accounting_can_read(), public.journal_source_link(text, bigint, text),
  public.accounting_trial_balance(date), public.accounting_income_statement(integer), public.accounting_ledger(text, date, date, integer)
  from public, anon, authenticated;
grant execute on function public.accounting_trial_balance(date), public.accounting_income_statement(integer),
  public.accounting_ledger(text, date, date, integer) to authenticated;
