const amountFormat = new Intl.NumberFormat("en-TH", {
  style: "currency",
  currency: "THB",
});
export const formatAmount = (value: number) => amountFormat.format(value);
