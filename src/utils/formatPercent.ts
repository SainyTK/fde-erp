const percentFormat = new Intl.NumberFormat("en-TH", {
  style: "percent",
  maximumFractionDigits: 1,
});
export const formatPercent = (value: number | null) =>
  value === null ? "No data" : percentFormat.format(value);
