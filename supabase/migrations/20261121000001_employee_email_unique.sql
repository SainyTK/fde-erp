create unique index employees_email_lower_unique
on public.employees (lower(email));
