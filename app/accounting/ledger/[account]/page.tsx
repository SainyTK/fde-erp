import { notFound, redirect } from "next/navigation";
import { AccountingTabs, LedgerTable } from "@/src/components/accounting";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  controlClass,
  Feedback,
  panelClass,
  primaryButtonClass,
} from "@/src/components/ui";
import { accountingPeriod } from "@/src/constants/accounting";
import { getAccountLedger } from "@/src/services/accounting";
import { getEligibleUser } from "@/src/services/auth";
import { isoDate, positiveInteger } from "@/src/utils/query";

export default async function LedgerPage({
  params,
  searchParams,
}: {
  params: Promise<{ account: string }>;
  searchParams: Promise<{ from?: string; to?: string; page?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const [{ account }, query] = await Promise.all([params, searchParams]);
  if (!/^\d{4}$/.test(account)) {
    notFound();
  }
  const from = isoDate(query.from) ?? accountingPeriod.from;
  const to = isoDate(query.to) ?? accountingPeriod.to;
  const page = positiveInteger(query.page) ?? 1;
  const { data, error } = await getAccountLedger({ account, from, to, page });
  if (!data && !error) {
    notFound();
  }
  return (
    <AppShell active="accounting">
      <PageHeading title="Accounting" />
      {data ? (
        <>
          <AccountingTabs active="ledger" />
          <form
            action="/accounting/ledger"
            className={`${panelClass} grid gap-4 p-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end sm:px-6`}
          >
            <label className="grid gap-1 text-sm">
              Account
              <select
                className={controlClass}
                defaultValue={data.code}
                name="account"
              >
                {data.accounts.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} {option.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm">
              From
              <input
                className={controlClass}
                defaultValue={data.from}
                name="from"
                required
                type="date"
              />
            </label>
            <label className="grid gap-1 text-sm">
              To
              <input
                className={controlClass}
                defaultValue={data.to}
                name="to"
                required
                type="date"
              />
            </label>
            <button className={primaryButtonClass} type="submit">
              Apply
            </button>
          </form>
          <LedgerTable data={data} page={page} />
        </>
      ) : (
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to accounting."
            : "Accounting could not be loaded."}
        </Feedback>
      )}
    </AppShell>
  );
}
