import { deleteLogin, updateLogin } from "@/app/admin/actions";
import type { Account } from "@/src/types/account";

const inputClass =
  "h-11 w-full rounded-lg border border-[#d8e1d9] bg-white px-3 text-sm text-[#253b2e] focus:border-[#438762] focus:outline-none focus:ring-2 focus:ring-[#d8eadb]";

export function AccountRow({ account }: { account: Account }) {
  const formId = `account-${account.id}`;
  const accountName = account.email || account.id;

  return (
    <tr className="border-t border-[#e7ece7] align-middle hover:bg-[#f8faf8]">
      <td className="px-5 py-4">
        <input
          aria-label={`Employee email for ${accountName}`}
          className={inputClass}
          defaultValue={account.email}
          form={formId}
          name="email"
          required
          type="email"
        />
      </td>
      <td className="px-4 py-4">
        <input
          aria-label={`New password for ${accountName}`}
          autoComplete="new-password"
          className={inputClass}
          form={formId}
          minLength={6}
          name="password"
          type="password"
        />
      </td>
      <td className="px-4 py-4 text-right">
        <form action={updateLogin} id={formId}>
          <input name="id" type="hidden" value={account.id} />
          <button
            aria-label={`Save changes for ${accountName}`}
            className="min-h-11 rounded-lg bg-[#285e45] px-4 text-sm font-semibold text-white hover:bg-[#1d4b36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285e45]"
            type="submit"
          >
            Save
          </button>
        </form>
      </td>
      <td className="px-5 py-4">
        <details className="text-sm">
          <summary className="cursor-pointer font-semibold text-[#8f3f26]">
            Delete
          </summary>
          <form action={deleteLogin} className="mt-3 space-y-3">
            <input name="id" type="hidden" value={account.id} />
            <p>Delete the login for {accountName}?</p>
            <button
              className="min-h-11 rounded-lg border border-[#b76045] px-4 text-sm font-semibold text-[#8f3f26] hover:bg-[#fff3ee]"
              type="submit"
            >
              Confirm delete
            </button>
          </form>
        </details>
      </td>
    </tr>
  );
}
