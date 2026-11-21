export function latestMonthTotal(rows: { month: string; value: number }[]) {
  const latest = rows
    .map((row) => row.month)
    .sort()
    .at(-1);
  const total = rows
    .filter((row) => row.month === latest)
    .reduce((sum, row) => sum + row.value, 0);
  return Math.round(total * 100) / 100;
}
