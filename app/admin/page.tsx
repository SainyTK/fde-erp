import { KeyRound } from "lucide-react";
import { AccountRow, CreateAccountPanel } from "@/src/components/admin";
import { AppShell, PageHeading } from "@/src/components/shell";
import {
  Feedback,
  PanelHeading,
  panelClass,
  SearchList,
} from "@/src/components/ui";
import { AdminAccessError, listAccounts } from "@/src/services/admin";

const messages = new Map([
  ["created", "Account created."],
  ["updated", "Account updated."],
  ["deleted", "Account deleted."],
  [
    "error",
    "Could not save the change. Check the account details and your access, then try again.",
  ],
]);

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  let accounts: Awaited<ReturnType<typeof listAccounts>>;
  try {
    accounts = await listAccounts();
  } catch (error) {
    return (
      <AppShell active="accounts">
        <PageHeading title="Login accounts" />
        <Feedback error>
          {error instanceof AdminAccessError
            ? "You do not have access to login accounts."
            : "Login accounts could not be loaded."}
        </Feedback>
      </AppShell>
    );
  }
  const message = status ? messages.get(status) : undefined;
  return (
    <AppShell active="accounts" showAdmin>
      <PageHeading
        title="Login accounts"
        description="Manage how employees sign in."
      />
      {message && <Feedback error={status === "error"}>{message}</Feedback>}
      <CreateAccountPanel />
      <section aria-labelledby="accounts-title" className={panelClass}>
        <PanelHeading
          icon={KeyRound}
          id="accounts-title"
          title="Existing accounts"
        />
        <SearchList
          empty="No accounts found."
          items={accounts.map((account) => ({
            id: account.id,
            search: account.email || account.id,
            content: <AccountRow account={account} />,
          }))}
          label="Search by email"
        />
      </section>
    </AppShell>
  );
}
