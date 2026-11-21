create function public.erp_actor()
returns table (employee_id bigint, manager_id bigint, employee_code text, department_code text)
language sql stable security definer set search_path = ''
as $$
  select e.employee_id, e.manager_id, e.employee_code, d.code
  from auth.users u join public.employees e on lower(e.email) = lower(u.email)
  join public.departments d on d.department_id = e.department_id
  where u.id = (select auth.uid()) and public.employee_is_eligible();
$$;
revoke all on function public.erp_actor() from public, anon, authenticated;

create table public.leave_types (
  code text primary key,
  name text not null,
  annual_days numeric not null check (annual_days >= 0)
);
insert into public.leave_types values ('annual', 'Annual leave', 10), ('sick', 'Sick leave', 30), ('personal', 'Personal leave', 3);

create table public.leave_holidays (holiday_date date primary key, name text not null);
insert into public.leave_holidays values
  ('2026-01-01', 'New Year''s Day'), ('2026-04-06', 'Chakri Day'),
  ('2026-04-13', 'Songkran'), ('2026-04-14', 'Songkran'), ('2026-04-15', 'Songkran'),
  ('2026-05-04', 'Coronation Day'), ('2026-06-03', 'Queen Suthida''s Birthday'),
  ('2026-07-28', 'King Vajiralongkorn''s Birthday'), ('2026-08-12', 'Mother''s Day'),
  ('2026-10-13', 'King Bhumibol Memorial Day'), ('2026-10-23', 'Chulalongkorn Day'),
  ('2026-12-07', 'Father''s Day substitute'), ('2026-12-10', 'Constitution Day'), ('2026-12-31', 'New Year''s Eve');

create table public.leave_requests (
  id bigint generated always as identity primary key,
  employee_id bigint not null references public.employees (employee_id),
  type_code text not null references public.leave_types (code),
  start_date date not null,
  end_date date not null check (end_date >= start_date),
  days numeric not null check (days > 0),
  reason text not null check (length(btrim(reason)) between 1 and 1000),
  status text not null default 'Pending' check (status in ('Pending', 'Approved', 'Rejected', 'Cancelled')),
  approver_id bigint references public.employees (employee_id),
  comment text,
  decided_at timestamptz
);
create index leave_requests_employee_idx on public.leave_requests (employee_id, start_date);
alter table public.leave_types enable row level security;
alter table public.leave_holidays enable row level security;
alter table public.leave_requests enable row level security;
revoke all on public.leave_types, public.leave_holidays, public.leave_requests from public, anon, authenticated;

create function public.leave_today() returns date
language sql stable set search_path = ''
as $$ select (now() at time zone 'Asia/Bangkok')::date; $$;

create function public.leave_may_review(p_requester bigint)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.erp_actor() a join public.employees e on e.employee_id = p_requester
    where (a.department_code = 'HRA' and a.employee_id <> p_requester) or e.manager_id = a.employee_id
      or (a.employee_id = p_requester and a.manager_id is null
        and exists (select 1 from public.employees r where r.manager_id = a.employee_id))
  );
$$;

create function public.leave_remaining(p_employee bigint, p_type text, p_year date)
returns numeric language sql stable security definer set search_path = ''
as $$
  select t.annual_days - coalesce(sum(r.days), 0)
  from public.leave_types t left join public.leave_requests r on r.type_code = t.code
    and r.employee_id = p_employee and r.status in ('Pending', 'Approved')
    and r.start_date >= date_trunc('year', p_year)::date
    and r.start_date < (date_trunc('year', p_year) + interval '1 year')::date
  where t.code = p_type group by t.annual_days;
$$;

create function public.leave_workspace()
returns jsonb language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'balances', (select jsonb_agg(jsonb_build_object('code', t.code, 'name', t.name, 'remaining', public.leave_remaining(a.employee_id, t.code, public.leave_today())) order by t.name) from public.leave_types t),
    'today', public.leave_today(),
    'requests', coalesce((
      select jsonb_agg(jsonb_build_object('id', r.id, 'employee', concat_ws(' ', e.first_name, e.last_name), 'type', t.name,
        'start', r.start_date, 'end', r.end_date, 'days', r.days, 'reason', r.reason, 'status', r.status, 'comment', r.comment,
        'own', r.employee_id = a.employee_id, 'can_review', r.status = 'Pending' and public.leave_may_review(r.employee_id)) order by r.id desc)
      from public.leave_requests r join public.employees e using (employee_id) join public.leave_types t on t.code = r.type_code
      where r.employee_id = a.employee_id or (public.leave_may_review(r.employee_id) and (r.status = 'Pending' or a.department_code = 'HRA'))
    ), '[]'::jsonb)
  ) from public.erp_actor() a;
$$;

create function public.submit_leave(p_type text, p_start date, p_end date, p_half boolean, p_reason text)
returns bigint language plpgsql security definer set search_path = ''
as $$
declare actor bigint; requested numeric; remaining numeric; request_id bigint;
begin
  select employee_id into actor from public.erp_actor();
  if actor is null then raise exception 'Active employee required' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended('leave:' || actor, 0));
  if p_start is null or p_end is null or p_start < public.leave_today() or p_end < p_start
    or extract(year from p_start) <> extract(year from p_end) or p_half is null
    or (p_half and p_start <> p_end) or coalesce(length(btrim(p_reason)), 0) not between 1 and 1000 then
    raise exception 'Enter a reason and a valid date range within one year' using errcode = '22023';
  end if;
  select count(*) into requested from generate_series(0, p_end - p_start) as g(offset_day)
    where extract(isodow from p_start + g.offset_day) < 6
    and not exists (select 1 from public.leave_holidays h where h.holiday_date = p_start + g.offset_day);
  if requested = 0 then raise exception 'Select at least one working day' using errcode = '22023'; end if;
  if p_half then requested := 0.5; end if;
  if exists (select 1 from public.leave_requests r where r.employee_id = actor and r.status in ('Pending', 'Approved')
    and r.start_date <= p_end and r.end_date >= p_start) then
    raise exception 'These dates overlap an existing request' using errcode = '22023';
  end if;
  remaining := public.leave_remaining(actor, p_type, p_start);
  if remaining is null or requested > remaining then raise exception 'Not enough leave balance for these dates' using errcode = '22023'; end if;
  insert into public.leave_requests (employee_id, type_code, start_date, end_date, days, reason)
  values (actor, p_type, p_start, p_end, requested, btrim(p_reason)) returning id into request_id;
  return request_id;
end;
$$;

create function public.decide_leave(p_id bigint, p_decision text, p_comment text default null)
returns void language plpgsql security definer set search_path = ''
as $$
declare actor bigint; request public.leave_requests%rowtype;
begin
  select employee_id into actor from public.erp_actor();
  select * into request from public.leave_requests where id = p_id for update;
  if actor is null or request.id is null or
    not coalesce(case when p_decision = 'Cancelled' then request.employee_id = actor
      when p_decision in ('Approved', 'Rejected') then public.leave_may_review(request.employee_id) end, false) then
    raise exception 'You cannot take this action on the request' using errcode = '42501';
  end if;
  if request.status <> 'Pending' then raise exception 'This request is no longer pending' using errcode = '22023'; end if;
  if p_decision <> 'Cancelled' and coalesce(length(btrim(p_comment)), 0) not between 1 and 1000 then
    raise exception 'Enter a decision comment' using errcode = '22023';
  end if;
  update public.leave_requests set status = p_decision, decided_at = now(),
    approver_id = case when p_decision <> 'Cancelled' then actor end,
    comment = case when p_decision <> 'Cancelled' then btrim(p_comment) end
  where id = p_id;
end;
$$;

revoke all on function public.leave_today(), public.leave_may_review(bigint), public.leave_remaining(bigint,text,date),
  public.leave_workspace(), public.submit_leave(text,date,date,boolean,text), public.decide_leave(bigint,text,text) from public, anon, authenticated;
grant execute on function public.leave_workspace(), public.submit_leave(text,date,date,boolean,text),
  public.decide_leave(bigint,text,text) to authenticated;
