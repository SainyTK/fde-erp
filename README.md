# FDE ERP

FDE ERP is the internal system for a Thai building-materials distributor.
Employees sign in with their work email, and each person sees only what their role allows.

## Using the app

Production runs at https://fde-erp-eight.vercel.app.
Sign in with the email and password the Admin gave you.
The Admin creates every login from Login accounts.

This is a learning system, and every demo login below uses the password `test12345`.

| Role | Login |
| --- | --- |
| Admin and Managing Director | thanakorn.s@apro.co.th |
| Admin without a team | surasak.r@apro.co.th |
| Management, not Admin | anan.s@apro.co.th |
| Sales Manager | sasithorn.k@apro.co.th |
| Sales rep | somchai.y@apro.co.th |
| Second sales rep | ekkachai.y@apro.co.th |
| Purchasing Manager | jiraporn.t@apro.co.th |
| Buyer | phongsakorn.n@apro.co.th |
| Warehouse Manager | wichai.y@apro.co.th |
| Warehouse staff | chaiwat.w@apro.co.th |
| Finance Manager | narong.wo@apro.co.th |
| Finance officer | sompong.s@apro.co.th |
| HR Manager | anan.so@apro.co.th |
| HR officer | narong.so@apro.co.th |
| Employee with no business area (IT) | chaiwat.l@apro.co.th |

The [manual test plan](docs/manual-test-plan.md) walks through every workshop step by step with these logins, including what each role must be refused.

| Area | What you can do | Who can use it |
| --- | --- | --- |
| Workspace | See your profile, your team, and your own salary | Everyone; HR also sees every salary |
| Dashboard | Year-to-date revenue, gross margin, receivables, stock value and open purchase orders, with click-through to each source | Finance and Management |
| Leave | Request leave, see your balance, cancel a pending request, approve or reject your team's requests | Everyone; approval by the direct manager or HR |
| Stock | Stock on hand and value by product and warehouse, items below reorder point, monthly value, shrinkage, movements | Warehouse, Purchasing, Sales, Finance, Management |
| Sales | List, filter and open sales orders, place a new order | Sales reps see their own customers; managers see their team |
| Receivables | Open invoices by ageing bucket, customer credit, record customer payments | Finance records payments; Sales sees its own customers |
| Purchasing | Purchase orders, approval queue, invoices on hold, supplier scorecard, requisitions from low stock | Purchasing, Warehouse, Finance, Management |
| Accounting | Trial balance, income statement, account ledger, revenue by invoice line | Finance and Management |
| Employee settings, Login accounts, Audit log | Manage departments, managers, admin rights and logins, and see who changed what | Admin |

Business rules worth knowing before you start:

- Requisitions under 50,000 THB become purchase orders at once, 50,000 to 300,000 THB need the Purchasing Manager, and over 300,000 THB need the Managing Director.
- A sales order is refused when the customer's warehouse lacks stock or the order would take the customer over their credit limit.
- Amounts are always calculated in the database, and the browser only sends quantities, prices are never trusted from the client.
- Reports treat 2026-10-31 as today, because that is the last date in the imported data.

## Running it locally

You need Node.js 22, the Supabase CLI and Docker.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with the project URL, the publishable key and the service role key from the Supabase dashboard, or from `supabase status` for a local stack.
The service role key stays on the server; it is only used by the Admin pages and the health check.

```bash
npm run lint
npm run build
```

## Database

All tables live in Supabase Postgres.
The browser has no direct table access except the salary columns of `employees`, where a row level security policy returns your own row and every row only to HR.
Every other read and write goes through a security definer function in `supabase/migrations/` that checks the signed-in employee's department and reporting line first.
Apply migrations with `supabase db push --remote` and never edit a migration that has already been applied; add a new one instead.

## Operations

`GET /api/health` returns 200 when the database answers, debits equal credits, account 1100 equals open receivables, and invoice statuses match their payments, and 503 otherwise.
The GitHub workflow in `.github/workflows/health.yml` calls it every hour, using the `PRODUCTION_URL` repository variable, and GitHub emails the repository owner when it fails.
Every change to employees, admin rights, logins, leave, requisitions, purchase orders, sales orders, invoices and customer payments is written to the audit log.
Supabase takes daily backups of the database; restore a single table from a `supabase db dump` file when only one record is damaged.

## Known limits

- Public sign-up is still enabled in the hosted Supabase Auth settings, so anyone can register an employee email that has no login yet; turn it off under Authentication settings before real use.
- The Thai public holiday table for leave covers selected 2026 dates only; load the full company calendar each year.
- There are no backorders or stock transfers; an order larger than available stock is refused.
- Payroll, rent, utilities and VAT returns appear in the ledger but have no document page.
- Stock value from the stock ledger is 84.08 THB below the Inventory account, because each side rounds unit costs separately.
- Imported data ends on 2026-10-31, so reports use that date as today; switch `erp_as_of_date` to the current date when live data starts.
