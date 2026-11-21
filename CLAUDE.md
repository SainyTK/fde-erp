@AGENTS.md

# FDE ERP

Read `README.md` first for what the app does and who may use each area.

## Architecture

- Next.js App Router with server components; routes live in `app/`, and each route only wires services and components together.
- `src/services/<area>` calls Supabase RPC functions; components never call Supabase directly.
- `src/components/<area>` holds one component per file with an `index.ts` entry; shared primitives are in `src/components/ui`.
- `src/types`, `src/constants` and `src/utils` hold shared types, fixed values and pure functions.

## Security model

- Permissions live in the database. Every table has row level security and no grants to `anon` or `authenticated`, except the salary columns of `employees`, which the `employee_salary_read` policy limits to your own row, or every row for HR.
- New features add a security definer function that starts with an access check (`erp_actor`, `sales_team`, `accounting_can_read` and similar), revoke it from `public, anon, authenticated`, and grant execute to `authenticated`.
- Hiding a button is never the permission; the function must refuse the call.
- Money is calculated in SQL. Any function that creates a financial document posts its journal entry in the same transaction.

## Working rules

- Add a new migration in `supabase/migrations/` for every schema change; never edit one that has been applied to the hosted project.
- Run `npm run lint` and `npm run build` before committing.
- Verify features by signing in as each affected role, and check `/api/health` after any change to invoices, payments or journals.
