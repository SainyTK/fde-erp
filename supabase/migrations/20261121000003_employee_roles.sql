alter table public.departments alter column department_id set not null;
create unique index departments_department_id_unique on public.departments (department_id);
create unique index employees_employee_id_unique on public.employees (employee_id);
create unique index employees_employee_code_unique on public.employees (employee_code);

alter table public.employees
  alter column employee_id set not null,
  alter column employee_code set not null,
  alter column department_id set not null,
  alter column monthly_salary set not null,
  add constraint employees_reporting_manager_check
    check ((employee_code = 'E0001' and manager_id is null) or (employee_code <> 'E0001' and manager_id is not null and manager_id <> employee_id)),
  add constraint employees_salary_nonnegative_check check (monthly_salary >= 0),
  add constraint employees_department_fk foreign key (department_id) references public.departments (department_id),
  add constraint employees_manager_fk foreign key (manager_id) references public.employees (employee_id);

alter table public.employees enable row level security;

revoke all on public.employees from public, anon, authenticated;
revoke select (monthly_salary) on public.employees from public, anon, authenticated;

create table public.employee_admins (
  employee_id bigint primary key references public.employees (employee_id) on delete cascade
);

alter table public.employee_admins enable row level security;
revoke all on public.employee_admins from public, anon, authenticated;

insert into public.employee_admins (employee_id)
select employee_id from public.employees where employee_code = 'E0001';

do $$
begin
  if not exists (select 1 from public.employee_admins) then
    raise exception 'Managing Director E0001 is required';
  end if;
end;
$$;

create function public.employee_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.employee_is_eligible() and exists (
    select 1
    from auth.users as account
    join public.employees as employee on lower(employee.email) = lower(account.email)
    join public.employee_admins as admin on admin.employee_id = employee.employee_id
    where account.id = (select auth.uid())
  );
$$;

revoke all on function public.employee_is_admin() from public, anon;
grant execute on function public.employee_is_admin() to authenticated;

create function public.employee_roles(p_employee_id bigint)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select '["Employee"]'::jsonb
    || case when exists (
      select 1 from public.employees as subordinate
      where subordinate.manager_id = employee.employee_id
    ) then '["Manager"]'::jsonb else '[]'::jsonb end
    || case when admin.employee_id is not null then '["Admin"]'::jsonb else '[]'::jsonb end
    || case when department.code = 'HRA' then '["HR"]'::jsonb else '[]'::jsonb end
  from public.employees as employee
  join public.departments as department on department.department_id = employee.department_id
  left join public.employee_admins as admin on admin.employee_id = employee.employee_id
  where employee.employee_id = p_employee_id;
$$;

revoke all on function public.employee_roles(bigint) from public, anon, authenticated;

create function public.employee_workspace()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  current_employee public.employees%rowtype;
  current_department public.departments%rowtype;
  is_hr boolean;
begin
  if not public.employee_is_eligible() then
    raise exception 'Account is not eligible' using errcode = '42501';
  end if;

  select employee.* into strict current_employee
  from public.employees as employee
  join auth.users as account on lower(employee.email) = lower(account.email)
  where account.id = (select auth.uid());

  select department.* into strict current_department
  from public.departments as department
  where department.department_id = current_employee.department_id;

  is_hr := current_department.code = 'HRA';

  return jsonb_build_object(
    'employee', jsonb_build_object(
      'employee_id', current_employee.employee_id,
      'employee_code', current_employee.employee_code,
      'first_name', current_employee.first_name,
      'last_name', current_employee.last_name,
      'email', current_employee.email,
      'job_title', current_employee.job_title,
      'department_id', current_employee.department_id,
      'department_name', current_department.name,
      'manager_id', current_employee.manager_id,
      'manager_name', (
        select concat_ws(' ', manager.first_name, manager.last_name)
        from public.employees as manager
        where manager.employee_id = current_employee.manager_id
      ),
      'monthly_salary', current_employee.monthly_salary
    ),
    'roles', public.employee_roles(current_employee.employee_id),
    'subordinates', coalesce((
      select jsonb_agg(jsonb_build_object(
        'employee_id', subordinate.employee_id,
        'employee_code', subordinate.employee_code,
        'first_name', subordinate.first_name,
        'last_name', subordinate.last_name,
        'job_title', subordinate.job_title
      ) order by subordinate.employee_code)
      from public.employees as subordinate
      where subordinate.manager_id = current_employee.employee_id
    ), '[]'::jsonb),
    'employees', case when is_hr then coalesce((
      select jsonb_agg(jsonb_build_object(
        'employee_id', employee.employee_id,
        'employee_code', employee.employee_code,
        'first_name', employee.first_name,
        'last_name', employee.last_name,
        'email', employee.email,
        'job_title', employee.job_title,
        'monthly_salary', employee.monthly_salary
      ) order by employee.employee_code)
      from public.employees as employee
    ), '[]'::jsonb) else '[]'::jsonb end
  );
end;
$$;

revoke all on function public.employee_workspace() from public, anon;
grant execute on function public.employee_workspace() to authenticated;

create function public.admin_employee_settings()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.employee_is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'employees', coalesce((
      select jsonb_agg(jsonb_build_object(
        'employee_id', employee.employee_id,
        'employee_code', employee.employee_code,
        'first_name', employee.first_name,
        'last_name', employee.last_name,
        'department_id', employee.department_id,
        'manager_id', employee.manager_id,
        'is_admin', admin.employee_id is not null,
        'roles', public.employee_roles(employee.employee_id)
      ) order by employee.employee_code)
      from public.employees as employee
      left join public.employee_admins as admin on admin.employee_id = employee.employee_id
    ), '[]'::jsonb),
    'departments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'department_id', department.department_id,
        'code', department.code,
        'name', department.name
      ) order by department.name)
      from public.departments as department
    ), '[]'::jsonb)
  );
end;
$$;

create function public.admin_update_employee_settings(
  p_employee_id bigint,
  p_department_id bigint,
  p_manager_id bigint,
  p_is_admin boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  own_employee_id bigint;
  creates_cycle boolean;
begin
  perform employee.employee_id
  from public.employees as employee
  order by employee.employee_id
  for update;

  if not public.employee_is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_is_admin is null then
    raise exception 'Admin status is required' using errcode = '22023';
  end if;

  select employee.employee_id into strict own_employee_id
  from public.employees as employee
  join auth.users as account on lower(employee.email) = lower(account.email)
  where account.id = (select auth.uid());

  if p_employee_id = own_employee_id and not p_is_admin then
    raise exception 'An admin cannot remove their own access' using errcode = '22023';
  end if;

  with recursive reporting_chain as (
    select employee.employee_id, employee.manager_id
    from public.employees as employee
    where employee.employee_id = p_manager_id
    union
    select manager.employee_id, manager.manager_id
    from public.employees as manager
    join reporting_chain as report on manager.employee_id = report.manager_id
  )
  select exists (
    select 1 from reporting_chain where employee_id = p_employee_id
  ) into creates_cycle;

  if creates_cycle then
    raise exception 'Reporting relationships cannot form a cycle' using errcode = '22023';
  end if;

  update public.employees
  set department_id = p_department_id, manager_id = p_manager_id
  where employee_id = p_employee_id;

  if not found then
    raise exception 'Employee not found' using errcode = '22023';
  end if;

  if p_is_admin then
    insert into public.employee_admins (employee_id) values (p_employee_id)
    on conflict (employee_id) do nothing;
  else
    delete from public.employee_admins where employee_id = p_employee_id;
  end if;
end;
$$;

revoke all on function public.admin_employee_settings() from public, anon;
revoke all on function public.admin_update_employee_settings(bigint, bigint, bigint, boolean) from public, anon;
grant execute on function public.admin_employee_settings() to authenticated;
grant execute on function public.admin_update_employee_settings(bigint, bigint, bigint, boolean) to authenticated;
