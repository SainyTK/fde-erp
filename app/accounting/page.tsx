import { redirect } from "next/navigation";
import { AccountingTabs, TrialBalanceTable } from "@/src/components/accounting";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  controlClass,
  Feedback,
  panelClass,
  primaryButtonClass,
} from "@/src/components/ui";
import { getTrialBalance } from "@/src/services/accounting";
import { getEligibleUser } from "@/src/services/auth";
import { isoDate } from "@/src/utils/query";

export default async function TrialBalancePage({
  searchParams,
}: {
  searchParams: Promise<{ as_of?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const asOf = isoDate((await searchParams).as_of);
  const { data, error } = await getTrialBalance(asOf);
  return (
    <AppShell active="accounting">
      <PageHeading title="Accounting" />
      {data ? (
        <>
          <AccountingTabs active="trial-balance" />
          <form
            className={`${panelClass} flex flex-wrap items-end gap-4 p-4 sm:px-6`}
          >
            <label className="grid gap-1 text-sm">
              As of
              <input
                className={controlClass}
                defaultValue={data.as_of}
                name="as_of"
                required
                type="date"
              />
            </label>
            <button className={primaryButtonClass} type="submit">
              Apply
            </button>
          </form>
          <TrialBalanceTable data={data} />
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
