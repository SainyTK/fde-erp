import { redirect } from "next/navigation";
import { LeaveForm, LeaveRequestList } from "@/src/components/leave";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback, panelClass } from "@/src/components/ui";
import { getEligibleUser } from "@/src/services/auth";
import { getLeaveWorkspace } from "@/src/services/leave";

export default async function LeavePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const [{ workspace }, { status, error }] = await Promise.all([
    getLeaveWorkspace(),
    searchParams,
  ]);
  return (
    <AppShell active="leave">
      <PageHeading title="Leave" />
      {error && <Feedback error>{error}</Feedback>}
      {status === "saved" && <Feedback>Leave request saved.</Feedback>}
      {workspace ? (
        <>
          <section
            aria-labelledby="leave-balance"
            className={`${panelClass} p-4 sm:p-6`}
          >
            <h2 className="font-semibold" id="leave-balance">
              Remaining leave
            </h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              {workspace.balances.map(({ code, name, remaining }) => (
                <div key={code}>
                  <dt className="text-muted text-sm">{name}</dt>
                  <dd className="font-semibold tabular-nums">
                    {remaining} {remaining === 1 ? "day" : "days"}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
          <LeaveForm balances={workspace.balances} today={workspace.today} />
          <LeaveRequestList
            id="own-leave"
            title="Your requests"
            requests={workspace.requests.filter((request) => request.own)}
          />
          {workspace.requests.some((request) => !request.own) && (
            <LeaveRequestList
              id="team-leave"
              title="Employee requests"
              requests={workspace.requests.filter((request) => !request.own)}
            />
          )}
        </>
      ) : (
        <Feedback error>Leave could not be loaded.</Feedback>
      )}
    </AppShell>
  );
}
