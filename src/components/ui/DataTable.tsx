import type { Key, ReactNode } from "react";

export function DataTable({
  label,
  columns,
  numericColumns = [],
  empty = "No matching records",
  rows,
}: {
  label: string;
  columns: string[];
  numericColumns?: string[];
  empty?: string;
  rows: { id: Key; cells: ReactNode[] }[];
}) {
  if (rows.length === 0) {
    return <p className="text-muted p-4 text-sm sm:px-6">{empty}</p>;
  }
  const alignment = (column: string) =>
    numericColumns.includes(column) ? "text-right" : "text-left";
  return (
    <section className="overflow-x-auto" aria-label={label}>
      <table className="w-full text-sm">
        <thead className="border-line border-b">
          <tr>
            {columns.map((column) => (
              <th
                className={`text-muted px-3 py-3 font-medium whitespace-nowrap sm:first:pl-6 sm:last:pr-6 ${alignment(column)}`}
                key={column}
                scope="col"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {rows.map(({ id, cells }) => (
            <tr key={id}>
              {cells.map((cell, index) => (
                <td
                  className={`px-3 py-3 tabular-nums sm:first:pl-6 sm:last:pr-6 ${numericColumns.includes(columns[index]) ? "text-right whitespace-nowrap" : "min-w-28 text-left"}`}
                  key={columns[index]}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
