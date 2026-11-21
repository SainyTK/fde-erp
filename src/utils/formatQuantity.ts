const quantityFormat = new Intl.NumberFormat("en-TH", {
  maximumFractionDigits: 2,
});
export const formatQuantity = (value: number) => quantityFormat.format(value);
