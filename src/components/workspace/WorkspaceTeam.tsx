import { UsersRound } from "lucide-react";
import { PanelHeading, panelClass } from "@/src/components/ui";
import type { Subordinate } from "@/src/types/workspace";

export function WorkspaceTeam({
  subordinates,
}: {
  subordinates: Subordinate[];
}) {
  return (
    <section aria-labelledby="team-title" className={panelClass}>
      <PanelHeading icon={UsersRound} id="team-title" title="Your team" />
      {subordinates.length === 0 ? (
        <p className="text-muted px-4 py-6 text-sm sm:px-6">
          No direct reports.
        </p>
      ) : (
        <ul className="divide-line divide-y">
          {subordinates.map((person) => (
            <li
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-4 sm:px-6"
              key={person.employee_id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden="true"
                  className="bg-brand-soft text-brand grid size-9 shrink-0 place-items-center rounded-full text-xs font-semibold"
                >
                  {Array.from(person.first_name)[0]}
                  {Array.from(person.last_name)[0]}
                </span>
                <div className="min-w-0 [overflow-wrap:anywhere]">
                  <p className="text-sm font-semibold">
                    {person.first_name} {person.last_name}
                  </p>
                  {person.job_title && (
                    <p className="text-muted text-sm">{person.job_title}</p>
                  )}
                </div>
              </div>
              <span className="bg-canvas text-muted rounded-md px-2 py-1 text-xs tabular-nums">
                {person.employee_code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
