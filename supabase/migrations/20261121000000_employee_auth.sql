create function public.employee_is_eligible()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as account
    where account.id = (select auth.uid())
      and account.email_confirmed_at is not null
      and (
        select count(*)
        from public.employees as employee
        where lower(employee.email) = lower(account.email)
          and employee.is_active = 1
          and (employee.termination_date is null or employee.termination_date > current_date)
      ) = 1
  );
$$;

revoke all on function public.employee_is_eligible() from public, anon;
grant execute on function public.employee_is_eligible() to authenticated;

create function public.enforce_employee_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is null or (
    select count(*)
    from public.employees as employee
    where lower(employee.email) = lower(new.email)
      and employee.is_active = 1
      and (employee.termination_date is null or employee.termination_date > current_date)
  ) <> 1 then
    raise exception 'Account is not eligible';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_employee_account() from public, anon, authenticated;

create trigger enforce_employee_account
before insert or update of email on auth.users
for each row execute function public.enforce_employee_account();
