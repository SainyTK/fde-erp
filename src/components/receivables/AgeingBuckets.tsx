import { StatLink } from "@/src/components/ui";
import { ageingBuckets } from "@/src/constants/receivables";
import type { AgeingBucket } from "@/src/types/receivables";
import { formatAmount } from "@/src/utils/formatAmount";
import { formatQuantity } from "@/src/utils/formatQuantity";

export function AgeingBuckets({
  buckets,
  openAmount,
  selected,
}: {
  buckets: AgeingBucket[];
  openAmount: number;
  selected: string | null;
}) {
  const invoices = buckets.reduce((sum, bucket) => sum + bucket.invoices, 0);
  return (
    <nav
      aria-label="Ageing buckets"
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
    >
      <StatLink
        current={selected === null}
        detail={`${formatQuantity(invoices)} invoices`}
        href="/receivables"
        label="All open"
        value={formatAmount(openAmount)}
      />
      {buckets.map((bucket) => (
        <StatLink
          current={selected === bucket.code}
          detail={`${formatQuantity(bucket.invoices)} invoices`}
          href={`/receivables?bucket=${bucket.code}`}
          key={bucket.code}
          label={ageingBuckets[bucket.code]}
          value={formatAmount(bucket.amount)}
        />
      ))}
    </nav>
  );
}
