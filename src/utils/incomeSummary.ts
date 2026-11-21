export function incomeSummary(
  revenue: number,
  costOfSales: number,
  otherExpenses: number,
) {
  const grossProfit = revenue - costOfSales;
  return {
    grossProfit,
    margin: revenue ? grossProfit / revenue : null,
    netIncome: grossProfit - otherExpenses,
  };
}
