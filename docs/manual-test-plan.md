# FDE ERP manual test plan (production)

Production: https://fde-erp-eight.vercel.app
This is a learning system, and every test account below uses the password `test12345`.
Each account was checked on 2026-11-21 to sign in and get the roles listed.

## Test accounts

| Role tested | Login | Employee | Roles the app shows |
| --- | --- | --- | --- |
| Admin, Managing Director, top approver | thanakorn.s@apro.co.th | E0001 Managing Director | Employee, Manager, Admin |
| Admin without reports | surasak.r@apro.co.th | E0002 Executive Assistant | Employee, Admin |
| Management, not admin | anan.s@apro.co.th | E0003 Executive Assistant | Employee |
| Sales Manager | sasithorn.k@apro.co.th | E0004 Sales Manager | Employee, Manager |
| Sales rep A | somchai.y@apro.co.th | E0005 Sales Representative | Employee |
| Sales rep B (new login) | ekkachai.y@apro.co.th | E0006 Key Account Executive | Employee |
| Purchasing Manager | jiraporn.t@apro.co.th | E0022 Purchasing Manager | Employee, Manager |
| Buyer (new login) | phongsakorn.n@apro.co.th | E0023 Buyer | Employee |
| Warehouse Manager | wichai.y@apro.co.th | E0027 Warehouse Manager | Employee, Manager |
| Warehouse staff (new login) | chaiwat.w@apro.co.th | E0028 Inventory Controller | Employee |
| Finance Manager | narong.wo@apro.co.th | E0047 Finance Manager | Employee, Manager |
| Finance officer | sompong.s@apro.co.th | E0051 AR/AP Officer | Employee |
| HR Manager | anan.so@apro.co.th | E0057 HR & Admin Manager | Employee, Manager, HR |
| HR officer | narong.so@apro.co.th | E0058 Admin Officer | Employee, HR |
| Plain employee, no business area (new login) | chaiwat.l@apro.co.th | E0054 IT Support | Employee |

Use one private browser window per account, or sign out between accounts.
Every write below creates a real production record and an audit log entry.
Records created through the app are numbered `SO-W-`, `PR-W-`, `PO-W-` and `RC-W-`, and none existed before testing started.

## Reference numbers (database, 2026-11-21, before any test writes)

| Check | Value |
| --- | --- |
| Trial balance, all dates | Debits 1,859,293,939.40 = Credits 1,859,293,939.40 |
| 2025 revenue | 169,212,024.67 THB, gross margin 26.8% |
| 2026 revenue to 2026-10-31 | 177,020,570.45 THB, gross margin 28.3% |
| Account 1100 balance | 44,972,923.28 THB |
| Open receivables | 44,972,923.28 THB (1,038 invoices) |
| Not due | 29,843,912.70 THB (673) |
| 1 to 30 days | 7,677,341.36 THB (205) |
| 31 to 60 days | 3,547,738.94 THB (74) |
| 61 to 90 days | 2,496,528.98 THB (44) |
| Over 90 days | 1,407,401.30 THB (42) |
| Stock value at 2026-10-31 | 16,932,419.85 THB |
| BLDG-0011 at Bangkok Distribution Center | 1,470 units, 212,244.10 THB |
| Requisitions pending | 3 for the Purchasing Manager, 4 for the Managing Director |
| `/api/health` | 200, all three checks true |

Open receivables and the AR balance change once you record payments in Workshop 1.9.

## Workshop 1.1: Load raw data

1. Sign in as thanakorn.s, open Stock, Sales and Accounting, and confirm each shows data dated up to 2026-10-31.
2. Expected: no empty tables and no load errors on any page.

## Workshop 1.2: Login and logout

1. Signed out, open https://fde-erp-eight.vercel.app/ and then /stock, /sales and /admin directly.
   Expected: every URL sends you to /login.
2. Sign in as somchai.y with a wrong password.
   Expected: an error, and you stay on /login.
3. Sign in as somchai.y with `test12345`.
   Expected: Workspace opens with "Welcome, Somchai".
4. Click Sign out, then press the browser Back button.
   Expected: you end up on /login and see no data.
5. Signed in as thanakorn.s, open Login accounts and try to create an account for phongsakorn.na@apro.co.th (E0052, terminated 2026-04-09).
   Expected: refused, because only active employees can get a login.
6. Try to create an account for an email that is not in employees, such as test@example.com.
   Expected: refused.
7. Known limit from the README: public sign-up is still on in Supabase Auth settings, so this is a finding until it is turned off.

## Workshop 1.3: User types

1. Sign in as each account in the table and open Workspace.
   Expected: "Your profile" shows the employee code, department, reporting manager, monthly salary and the roles listed in the table above.
2. thanakorn.s: reporting manager is empty, and "Your team" lists 8 people.
3. sasithorn.k: "Your team" lists 17 sales staff.
4. somchai.y: "Your team" is empty.
5. anan.so: has both Manager and HR, which proves one person can hold two types.
6. Change a user's type: as thanakorn.s, open Employee settings, find chaiwat.l (E0054), tick "Admin access" and save.
   Expected: "Employee settings saved."
7. Sign in as chaiwat.l (or reload).
   Expected: roles now include Admin, and the admin menu items appear.
8. As thanakorn.s, untick Admin access for chaiwat.l and save, then confirm chaiwat.l loses the admin menu and /admin shows "You do not have access to login accounts."
9. As thanakorn.s, try to untick your own Admin access.
   Expected: refused with "An admin cannot remove their own access".
10. As thanakorn.s, try to set sasithorn.k's reporting manager to somchai.y (her own report).
    Expected: refused, because reporting lines cannot form a cycle.

## Workshop 1.4: Permissions (role x action matrix)

| Action | Employee | Manager | HR | Admin |
| --- | --- | --- | --- | --- |
| See own salary | Can | Can | Can | Can |
| See other salaries | Cannot | Cannot | Can | Cannot |
| Make leave request | Can | Can | Can | Can |
| Approve leave | Cannot | Own team | Everyone except self | Only if also a manager or HR |
| Create, read, update, delete logins | Cannot | Cannot | Cannot | Can |

1. somchai.y: Workspace shows only your own salary and no "Employee salaries" panel.
2. sasithorn.k: "Your team" lists names and job titles with no salaries.
3. narong.so and anan.so: the "Employee salaries" panel lists every employee with a salary, and search works.
4. surasak.r (Admin, not HR): Login accounts works, and Workspace shows no salaries panel.
5. Admin CRUD as thanakorn.s on Login accounts:
   create a login for chaiwat.n@apro.co.th (E0018) with password test12345, search for it, change its password, sign in as it once, then delete it.
   Expected: "Account created.", "Account updated.", "Account deleted.", and three entries in Audit log.
6. As somchai.y, sasithorn.k, narong.so and chaiwat.l, open /admin, /admin/employees and /admin/audit directly.
   Expected: each shows a "You do not have access" message and no data.
7. API check (optional, ask an agent): signed in as somchai.y, call the `employee_workspace` RPC and try to read the `employees` table and `monthly_salary` directly with the publishable key.
   Expected: the RPC returns only your own salary and the direct table read is refused.

## Workshop 1.5: Leave

Leave uses the real date in Bangkok as today, so pick dates from tomorrow onward.

1. As somchai.y, open Leave and note the balances (Annual 10, Sick 30, Personal 3).
2. Request Annual leave Monday 2026-11-30 to Friday 2026-12-04 with a reason.
   Expected: "Leave request saved.", status Pending, 5 days, Annual balance drops to 5.
3. Try a second request that overlaps, 2026-12-02 to 2026-12-03.
   Expected: refused, "These dates overlap an existing request".
4. Try a start date in the past, 2026-11-20.
   Expected: refused.
5. Try Saturday 2026-12-05 to Sunday 2026-12-06.
   Expected: refused, "Select at least one working day".
6. Try 2026-12-09 to 2026-12-11.
   Expected: counts 2 days, because 2026-12-10 is Constitution Day.
   Cancel it afterwards.
7. Try a half day across two dates.
   Expected: refused, a half day must start and end on the same date.
8. Try Personal leave for 4 working days.
   Expected: refused, "Not enough leave balance".
9. Try 2026-12-30 to 2027-01-04.
   Expected: refused, a request must stay within one year.
10. As somchai.y, the request list must not offer Approve or Reject on your own request.
11. As sasithorn.k (his manager), open Leave.
    Expected: "Employee requests" shows Somchai's pending request with Approve and Reject.
12. Click Approve with an empty comment.
    Expected: refused, "Enter a decision comment".
13. Approve with a comment.
    Expected: status Approved, and somchai.y sees Approved with the comment.
14. As somchai.y, submit another request, then cancel it while Pending.
    Expected: status Cancelled and the balance returns.
15. As ekkachai.y, submit a request.
    As narong.so (HR, not his manager), reject it with a comment.
    Expected: HR can review anyone except themselves.
16. As narong.so, submit your own request and confirm you cannot approve it.
    Then approve it as anan.so (manager and HR).
17. As chaiwat.l (IT), open Leave.
    Expected: you see only your own requests, never Somchai's.
18. As thanakorn.s (no manager), submit a request.
    Expected: you can approve your own request, since the Managing Director has nobody above.
    Decide whether that matches the client's rule.
19. Optional API check: as somchai.y, call `decide_leave` on your own pending request with `Approved`.
    Expected: refused, "You cannot take this action on the request".
20. Admin Audit log: filter by leave and confirm the create, approve and cancel entries show who did it.

## Workshop 1.6: Stock dashboard

1. As wichai.y, open Stock.
   Expected: stock on hand and value by product and warehouse, monthly stock value chart, shrinkage for the last 12 months, days of cover and a stock status per row.
2. Filter Warehouse = Bangkok Distribution Center and a category, and confirm the URL keeps the filters.
3. Turn on the low-stock filter.
   Expected: 114 product and warehouse pairs below reorder point across all warehouses.
4. Click BLDG-0011 at Bangkok Distribution Center.
   Expected: on hand 1,470 units, value 212,244.10 THB, and a paged movement list.
5. Confirm the total stock value matches 16,932,419.85 THB (README notes it sits 84.08 THB below account 1300 because of rounding).
6. Access: phongsakorn.n, sasithorn.k, narong.wo and thanakorn.s can open Stock.
   narong.so and chaiwat.l get "You do not have access to stock."
7. "Request purchase" links appear for Warehouse, Purchasing and Management only.
   Confirm sasithorn.k and narong.wo see no such links.

## Workshop 1.7: Procurement

All tests use PLMB-0004 AquaFlow Automatic Water Pump 250W at Khon Kaen Branch Warehouse, unit cost 5,271.53 THB.
Open it from Stock with Warehouse = Khon Kaen and the low-stock filter, then click "Request purchase".

1. As phongsakorn.n (Buyer), request quantity 9 (47,443.77 THB).
   Expected: below 50,000, so a purchase order opens at once with "Requisition approved and purchase order created."
2. Request quantity 10 (52,715.30 THB).
   Expected: Pending, approver Purchasing Manager.
3. Request quantity 57 (300,477.21 THB).
   Expected: Pending, approver Managing Director.
4. As jiraporn.t (Purchasing Manager), open Purchasing.
   Expected: "Requisitions waiting for approval" shows the 52,715.30 request and the 3 older ones.
   Approve it and confirm a new PO-W- purchase order.
5. Confirm jiraporn.t cannot approve the 300,477.21 request.
   Optional API check: call `decide_requisition` on it as jiraporn.t.
   Expected: refused, "Assigned approver required".
6. As thanakorn.s, approve the 300,477.21 request, or reject it with a reason.
   Expected: rejecting without a reason is refused.
7. As narong.wo (Finance), open Purchasing.
   Expected: can read orders, invoices on hold and the scorecard, and has no Request purchase link.
8. As sasithorn.k and chaiwat.l, open /purchasing.
   Expected: "You do not have access to purchasing."
9. Open any older received purchase order and walk the five sections: 1. Requisition and approval, 2. Purchase order, 3. Goods receipts (with any rejected units and reasons), 4. Supplier invoices and three-way match, 5. Payments.
   Pick one that had several deliveries and explain each document.
10. "Supplier invoices on hold" lists each invoice with its hold reason and links to its purchase order.
11. "Supplier scorecard" shows on-time rate, units rejected and invoice exceptions per supplier.
12. As chaiwat.w (Inventory Controller), request purchase for another low item.
    Expected: allowed, because Warehouse can raise requisitions.

## Workshop 1.8: Sales orders

1. As somchai.y, open Sales.
   Expected: only orders for his customers, and the sales rep filter cannot widen it.
2. Filter by status, customer and date, copy the URL, open it in a new tab, and confirm the same view loads.
3. Click New sales order, choose C00231 Phatthana Home Center Co., Ltd. (credit limit 60,000, Bangkok Distribution Center), and add:
   BLDG-0011 quantity 10 with discount 5, and BLDG-0001 quantity 4 with discount 0.
   Expected by hand: line 1 = 10 x 215 x 0.95 = 2,042.50, line 2 = 4 x 325 = 1,300.00, subtotal 3,342.50, VAT 7% 233.98, total 3,576.48.
   Place the order and confirm the saved order shows exactly those numbers.
4. Credit limit: new order for C00231 with BLDG-0011 quantity 300 (69,015.00 THB with VAT).
   Expected: refused, over the credit limit, with the limit, owed and available amounts.
5. Stock: new order for C00231 with PAINT-0013 Duracoat Paint Roller quantity 2 (Bangkok has 1 available).
   Expected: refused, "Not enough stock for PAINT-0013".
6. A discount of 16% or the same product on two lines is refused.
7. Price tampering (optional, ask an agent): call `create_sales_order` with a `price` field in a line.
   Expected: the saved order still uses the list price.
8. URL check: as somchai.y, open https://fde-erp-eight.vercel.app/sales/orders/13976 (SO26-006623, a customer of ekkachai.y).
   Expected: the order does not load.
   Then open /sales/orders/13943 (his own SO26-006590).
   Expected: loads with lines and the flow: 1. Sales order, 2. Deliveries, 3. Invoices, 4. Payments.
9. As ekkachai.y, confirm he cannot see Somchai's new SO-W- order or choose C00231 in New sales order.
10. As sasithorn.k, confirm both reps' orders appear and the sales rep filter lists the whole team.
11. As thanakorn.s, confirm all orders are visible.
12. As anan.s (Management, no team), confirm Sales shows nothing to sell for.
13. As narong.wo, chaiwat.l and wichai.y, open /sales.
    Expected: an error message and no orders.

## Workshop 1.9: Receivables

1. As narong.wo, open Receivables.
   Expected: open amount 44,972,923.28 THB, and the five ageing buckets match the reference table.
2. Add the five bucket totals and confirm they equal the open amount.
3. Click each bucket and confirm the invoice list filters to it.
4. Open a customer, for example C00133 Chokdee Construction Co., Ltd.
   Expected: credit limit, owed on invoices, open orders, available credit, payment terms and average days late.
5. Two-part payment on IV26-006385 (invoice 13547, Thongchai Hardware, 963.00 THB, OPEN):
   open /receivables/invoices/13547, record 500.00 by transfer dated 2026-10-31.
   Expected: "Payment recorded.", status PARTIALLY_PAID, outstanding 463.00.
6. Try to record 500.00 again.
   Expected: refused, amount must be between 0.01 and 463.00.
7. Try a payment date before the invoice date (2026-10-25) or in the future.
   Expected: refused.
8. Record 463.00.
   Expected: status PAID and the form no longer accepts payments.
9. Open https://fde-erp-eight.vercel.app/api/health.
   Expected: 200 with all checks true after the payments.
10. As sompong.s (Finance officer), record a payment on another invoice.
    Expected: allowed.
11. As somchai.y, open Receivables.
    Expected: only his customers' invoices, and no Record payment form.
    Open /receivables/invoices/13547 and confirm he can read it but not pay.
12. As ekkachai.y, open /receivables/invoices/13547.
    Expected: does not load, because it is Somchai's customer.
13. As wichai.y and chaiwat.l, open /receivables.
    Expected: "You do not have access to receivables."
14. Credit link back to 1.8: as ekkachai.y, place an order for C00052 Siam Construction Shop worth more than 14,926.50 THB.
    Expected: refused, over the credit limit.

## Workshop 1.10: Accounting

1. As narong.wo, open Accounting.
   Expected: trial balance with total debits equal to total credits.
2. Income statement, year 2025.
   Expected: revenue about 169.2M THB and gross margin about 26.8%.
3. Open the ledger for account 1100.
   Expected: running balance ends at the open receivables amount, including your two test payments.
4. Click an entry in the ledger and confirm it opens its source document (invoice, payment, purchase order).
5. Confirm your 1.9 payments appear in the 1100 and cash ledgers dated 2026-10-31.
6. Revenue by invoice line: filter by date range, segment and category, and confirm totals change.
7. As thanakorn.s and anan.s, open Accounting.
   Expected: allowed.
8. As somchai.y, wichai.y, jiraporn.t, narong.so and chaiwat.l, open /accounting.
   Expected: "You do not have access to accounting."

## Workshop 1.11: Management dashboard

1. As thanakorn.s, open Dashboard.
   Expected: five KPIs (revenue year to date, gross margin year to date, open receivables, stock value, open purchase orders), monthly revenue and gross margin, revenue by segment and by category, and top customers.
2. Revenue year to date should be about 177.0M THB with gross margin about 28.3%.
3. Click each KPI and confirm it opens its source page with the same number:
   revenue to Accounting, receivables to Receivables, stock value to Stock, purchase orders to Purchasing.
4. Click a segment, a category and a top customer, and confirm each opens a filtered page.
5. Open the dashboard at phone width (narrow the window or use device mode) and confirm nothing overflows.
6. As narong.wo and anan.s, the dashboard loads.
7. As sasithorn.k, wichai.y and chaiwat.l, open /dashboard.
   Expected: an error message and no numbers.

## Workshop 1.12: Go live

1. Demo accounts: every account in the table signs in with `test12345`.
2. Audit log, as thanakorn.s:
   confirm entries for your leave requests and decisions, requisitions, purchase orders, sales orders, payments, employee settings and login changes, each with time, who and old and new values.
   Filter by record type.
3. As surasak.r (Admin), the audit log opens.
   As narong.wo, /admin/audit shows no access.
4. Health check: open /api/health and confirm 200.
   In GitHub Actions, run the "Health check" workflow by hand and confirm it passes.
5. Backup and restore (step 3, not done yet):
   take a `supabase db dump --data-only` of one table, delete one row on purpose, restore it from the dump, and confirm the page shows it again and `/api/health` stays green.
6. Attacker review (step 5): repeat every "Cannot" in Workshop 1.4 and every refusal above with direct API calls, using one account per role.
7. Handover (step 6): give a classmate only the README and one login and see if they can complete a sales order and a leave request without help.

## Cleanup after testing

Tests leave real records: leave requests, PR-W- and PO-W- purchase documents, SO-W- sales orders and RC-W- payments.
Decide whether to keep them as demo data or remove them through a migration-free SQL cleanup, then confirm `/api/health` is still 200.
