const numberFormat = new Intl.NumberFormat("en-TH", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
export const formatNumber = (value: number) => numberFormat.format(value);
