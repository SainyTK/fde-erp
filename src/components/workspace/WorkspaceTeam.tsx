import type { Subordinate } from "@/src/types/workspace";

export function WorkspaceTeam({
  subordinates,
}: {
  subordinates: Subordinate[];
}) {
  return (
    <section
      aria-labelledby="team-title"
      className="rounded-2xl border border-[#dce5dd] bg-white p-6 sm:p-8"
    >
      <h2 className="text-xl font-semibold" id="team-title">
        Your team
      </h2>
      {subordinates.length === 0 ? (
        <p className="mt-5 text-sm text-[#66756b]">No direct reports.</p>
      ) : (
        <ul className="mt-5 divide-y divide-[#e7ece7]">
          {subordinates.map((person) => (
            <li
              className="flex flex-wrap items-center justify-between gap-2 py-4"
              key={person.employee_id}
            >
              <div>
                <p className="font-semibold">
                  {person.first_name} {person.last_name}
                </p>
                <p className="mt-1 text-sm text-[#66756b]">
                  {person.job_title || "Job title not available"}
                </p>
              </div>
              <span className="text-sm text-[#66756b]">
                {person.employee_code}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
