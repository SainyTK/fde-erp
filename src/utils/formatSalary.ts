const salaryFormat = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2,
});

export function formatSalary(salary: number) {
  return salaryFormat.format(salary);
}
