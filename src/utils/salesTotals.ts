const vatRate = 0.07;

const roundAmount = (value: number) => Math.round(value * 100) / 100;

export function lineAmount(quantity: number, price: number, discount: number) {
  return roundAmount(quantity * price * (1 - discount / 100));
}

export function orderTotals(amounts: number[]) {
  const subtotal = roundAmount(
    amounts.reduce((sum, amount) => sum + amount, 0),
  );
  const vat = roundAmount(subtotal * vatRate);
  return { subtotal, vat, total: roundAmount(subtotal + vat) };
}
