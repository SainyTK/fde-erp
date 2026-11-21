create function public.employee_account_status()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when exists (
      select 1
      from auth.users as account
      join public.employees as employee on lower(employee.email) = lower(account.email)
      where account.id = (select auth.uid())
        and (employee.is_active is distinct from 1 or employee.termination_date <= current_date)
    ) then 'inactive'
    when public.employee_is_eligible() then 'active'
    else 'unavailable'
  end;
$$;

revoke all on function public.employee_account_status() from public, anon;
grant execute on function public.employee_account_status() to authenticated;
