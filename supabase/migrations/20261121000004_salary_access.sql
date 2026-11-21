create function public.employee_salary_scope()
returns table (own_employee_id bigint, can_read_all boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select employee.employee_id, public.employee_roles(employee.employee_id) ? 'HR'
  from auth.users as account
  join public.employees as employee on lower(account.email) = lower(employee.email)
  where account.id = (select auth.uid())
    and public.employee_is_eligible();
$$;

revoke all on function public.employee_salary_scope() from public, anon;
grant execute on function public.employee_salary_scope() to authenticated;

grant select (employee_id, employee_code, first_name, last_name, email, job_title, monthly_salary)
on public.employees to authenticated;

create policy employee_salary_read on public.employees
for select to authenticated
using (
  employee_id = (select own_employee_id from public.employee_salary_scope())
  or (select can_read_all from public.employee_salary_scope())
);

create or replace function public.employee_workspace()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_employee_id bigint;
begin
  if not public.employee_is_eligible() then
    raise exception 'Account is not eligible' using errcode = '42501';
  end if;

  select employee.employee_id into strict current_employee_id
  from public.employees as employee
  join auth.users as account on lower(employee.email) = lower(account.email)
  where account.id = (select auth.uid());

  return jsonb_build_object(
    'employee', (
      select jsonb_build_object(
        'employee_id', employee.employee_id,
        'employee_code', employee.employee_code,
        'first_name', employee.first_name,
        'email', employee.email,
        'job_title', employee.job_title,
        'department_name', department.name,
        'manager_name', nullif(concat_ws(' ', manager.first_name, manager.last_name), '')
      )
      from public.employees as employee
      join public.departments as department on department.department_id = employee.department_id
      left join public.employees as manager on manager.employee_id = employee.manager_id
      where employee.employee_id = current_employee_id
    ),
    'roles', public.employee_roles(current_employee_id),
    'subordinates', coalesce((
      select jsonb_agg(jsonb_build_object(
        'employee_id', subordinate.employee_id,
        'employee_code', subordinate.employee_code,
        'first_name', subordinate.first_name,
        'last_name', subordinate.last_name,
        'job_title', subordinate.job_title
      ) order by subordinate.employee_code)
      from public.employees as subordinate
      where subordinate.manager_id = current_employee_id
    ), '[]'::jsonb)
  );
end;
$$;
