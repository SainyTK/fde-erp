import Link from "next/link";
import { redirect } from "next/navigation";
import {
  AccountingTabs,
  IncomeStatementView,
} from "@/src/components/accounting";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback } from "@/src/components/ui";
import { accountingPeriod } from "@/src/constants/accounting";
import { getIncomeStatement } from "@/src/services/accounting";
import { getEligibleUser } from "@/src/services/auth";
import { positiveInteger } from "@/src/utils/query";

export default async function IncomeStatementPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const year =
    positiveInteger((await searchParams).year) ??
    Number(accountingPeriod.to.slice(0, 4));
  const { data, error } = await getIncomeStatement(year);
  return (
    <AppShell active="accounting">
      <PageHeading title="Accounting" />
      {data ? (
        <>
          <AccountingTabs active="income-statement" />
          <nav aria-label="Years" className="flex flex-wrap gap-2">
            {data.years.map((option) => (
              <Link
                aria-current={option === data.year ? "page" : undefined}
                className="border-line bg-surface hover:bg-brand-soft aria-[current=page]:border-brand aria-[current=page]:bg-brand-soft rounded-full border px-4 py-1.5 text-sm font-medium"
                href={`/accounting/income-statement?year=${option}`}
                key={option}
              >
                {option}
              </Link>
            ))}
          </nav>
          <IncomeStatementView data={data} />
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
