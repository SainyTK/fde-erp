import { updateLogin } from "@/app/admin/actions";
import {
  controlClass,
  RecordDetails,
  SubmitButton,
  secondaryButtonClass,
} from "@/src/components/ui";
import type { Account } from "@/src/types/account";
import { DeleteAccountDialog } from "./DeleteAccountDialog";

export function AccountRow({ account }: { account: Account }) {
  const accountName = account.email || account.id;
  return (
    <RecordDetails title={accountName}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <form
          action={updateLogin}
          className="grid min-w-0 flex-1 basis-full items-end gap-4 md:grid-cols-2 xl:basis-auto xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        >
          <input name="id" type="hidden" value={account.id} />
          <label className="grid gap-2 text-sm font-medium">
            <span>Employee email</span>
            <input
              className={controlClass}
              defaultValue={account.email}
              name="email"
              required
              type="email"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            <span>New password (optional)</span>
            <input
              autoComplete="new-password"
              className={controlClass}
              minLength={6}
              name="password"
              type="password"
            />
          </label>
          <div>
            <SubmitButton
              className={secondaryButtonClass}
              label={`Save changes for ${accountName}`}
              pendingLabel="Saving changes"
            >
              Save changes
            </SubmitButton>
          </div>
        </form>
        <DeleteAccountDialog accountId={account.id} email={accountName} />
      </div>
    </RecordDetails>
  );
}
