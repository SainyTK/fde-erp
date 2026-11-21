import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell, PageHeading } from "@/src/components/shell";
import { Feedback } from "@/src/components/ui";
import {
  EmployeeDirectory,
  WorkspaceProfile,
  WorkspaceTeam,
} from "@/src/components/workspace";
import { getEligibleUser } from "@/src/services/auth";
import { getWorkspace } from "@/src/services/workspace";

export default async function HomePage() {
  if (!(await getEligibleUser())) {
    redirect("/login");
  }
  const workspace = await getWorkspace();
  if (!workspace) {
    return (
      <AppShell active="workspace">
        <PageHeading title="Workspace" />
        <Feedback error>
          Your workspace could not be loaded.{" "}
          <Link className="font-semibold underline underline-offset-2" href="/">
            Try again
          </Link>
          .
        </Feedback>
      </AppShell>
    );
  }
  return (
    <AppShell active="workspace" showAdmin={workspace.roles.includes("Admin")}>
      <PageHeading
        title={`Welcome, ${workspace.employee.first_name}`}
        description={workspace.employee.job_title}
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <WorkspaceProfile
          employee={workspace.employee}
          roles={workspace.roles}
        />
        <WorkspaceTeam subordinates={workspace.subordinates} />
      </div>
      {workspace.roles.includes("HR") && (
        <EmployeeDirectory employees={workspace.employees} />
      )}
    </AppShell>
  );
}
