import { History } from "lucide-react";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  controlClass,
  DataTable,
  Feedback,
  Pagination,
  PanelHeading,
  panelClass,
  primaryButtonClass,
} from "@/src/components/ui";
import { getAuditEntries } from "@/src/services/audit";
import { describeChanges } from "@/src/utils/describeChanges";
import { formatStatus } from "@/src/utils/formatStatus";
import { positiveInteger, queryString } from "@/src/utils/query";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Bangkok",
});

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string; page?: string }>;
}) {
  const params = await searchParams;
  const table =
    params.table && /^[a-z_]+$/.test(params.table) ? params.table : null;
  const page = positiveInteger(params.page) ?? 1;
  const { data, error } = await getAuditEntries(table, page);
  if (!data) {
    return (
      <AppShell active="audit">
        <PageHeading title="Audit log" />
        <Feedback error>
          {error?.code === "42501"
            ? "You do not have access to the audit log."
            : "The audit log could not be loaded."}
        </Feedback>
      </AppShell>
    );
  }
  return (
    <AppShell active="audit" showAdmin>
      <PageHeading title="Audit log" />
      <form
        className={`${panelClass} flex flex-wrap items-end gap-4 p-4 sm:px-6`}
      >
        <label className="grid gap-1 text-sm">
          Record type
          <select
            className={controlClass}
            defaultValue={table ?? ""}
            name="table"
          >
            <option value="">All record types</option>
            {data.tables.map((option) => (
              <option key={option} value={option}>
                {formatStatus(option)}
              </option>
            ))}
          </select>
        </label>
        <button className={primaryButtonClass} type="submit">
          Apply filters
        </button>
      </form>
      <section className={panelClass} aria-labelledby="audit-entries">
        <PanelHeading id="audit-entries" icon={History} title="Changes" />
        <DataTable
          label="Changes"
          empty="No changes recorded"
          columns={["When", "Who", "Record", "Action", "Change"]}
          rows={data.rows.map((row) => ({
            id: row.id,
            cells: [
              <span key="when" className="whitespace-nowrap">
                {timeFormat.format(new Date(row.changed_at))}
              </span>,
              row.actor,
              <span key="record" className="whitespace-nowrap">
                {formatStatus(row.table)} {row.record}
              </span>,
              formatStatus(row.action),
              <span
                key="change"
                className="block min-w-64 [overflow-wrap:anywhere]"
              >
                {describeChanges(row.action, row.changes)}
              </span>,
            ],
          }))}
        />
        <Pagination
          page={page}
          size={data.page_size}
          total={data.total}
          href={(next) => `/admin/audit${queryString({ table, page: next })}`}
        />
      </section>
    </AppShell>
  );
}
