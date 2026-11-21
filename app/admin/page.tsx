import Link from "next/link";
import { AccountRow } from "@/src/components/admin";
import { SessionMonitor } from "@/src/components/session";
import { listAccounts } from "@/src/services/admin";
import { createLogin } from "./actions";

const inputClass =
  "h-11 w-full rounded-lg border border-[#d8e1d9] bg-white px-3 text-sm focus:border-[#438762] focus:outline-none focus:ring-2 focus:ring-[#d8eadb]";
const buttonClass =
  "rounded-lg bg-[#285e45] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4b36]";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  let accounts: Awaited<ReturnType<typeof listAccounts>>;
  try {
    accounts = await listAccounts();
  } catch {
    return (
      <main className="mx-auto max-w-5xl px-6 py-8 sm:px-10">
        <Link
          href="/"
          className="text-sm font-semibold text-[#285e45] hover:underline"
        >
          Back to workspace
        </Link>
        <h1 className="mt-10 text-3xl font-semibold">Login accounts</h1>
        <p role="alert" className="mt-4 text-sm text-[#8f3f26]">
          Unable to load login accounts. Check your access and server
          configuration.
        </p>
      </main>
    );
  }
  const message =
    status === "created"
      ? "Account created."
      : status === "updated"
        ? "Account updated."
        : status === "deleted"
          ? "Account deleted."
          : status === "error"
            ? "The operation failed. Check the account details, employee eligibility, and your access."
            : "";
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-10">
      <SessionMonitor />
      <nav className="flex flex-wrap gap-5 text-sm font-semibold text-[#285e45]">
        <Link href="/" className="hover:underline">
          Back to workspace
        </Link>
        <Link href="/admin/employees" className="hover:underline">
          Employee settings
        </Link>
      </nav>
      <h1 className="mt-10 text-3xl font-semibold tracking-tight">
        Login accounts
      </h1>
      {message && (
        <p
          role={status === "error" ? "alert" : "status"}
          className="mt-5 rounded-lg bg-white px-4 py-3 text-sm"
        >
          {message}
        </p>
      )}
      <section className="mt-8 rounded-xl border border-[#dde4dd] bg-white p-5">
        <h2 className="text-lg font-semibold">Create account</h2>
        <form action={createLogin} className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold">
            Employee email
            <input
              className={inputClass}
              name="email"
              type="email"
              autoComplete="off"
              required
            />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            Password
            <input
              className={inputClass}
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          <div>
            <button className={buttonClass} type="submit">
              Create account
            </button>
          </div>
        </form>
      </section>
      <section className="mt-8 pb-10">
        <h2 className="text-lg font-semibold">Existing accounts</h2>
        {accounts.length === 0 && (
          <p className="mt-4 text-sm text-[#66756b]">No accounts found.</p>
        )}
        {accounts.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-[#dde4dd] bg-white">
            <table className="w-full min-w-[800px] table-fixed border-collapse text-sm">
              <thead className="bg-[#f1f6f1] text-left text-xs font-semibold text-[#53665a]">
                <tr>
                  <th className="w-[38%] px-5 py-4" scope="col">
                    Employee email
                  </th>
                  <th className="w-[32%] px-4 py-4" scope="col">
                    New password
                  </th>
                  <th className="w-[12%] px-4 py-4 text-right" scope="col">
                    Save
                  </th>
                  <th className="w-[18%] px-5 py-4" scope="col">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((account) => (
                  <AccountRow key={account.id} account={account} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
