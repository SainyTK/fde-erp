"use client";

import { useId, useRef } from "react";
import { deleteLogin } from "@/app/admin/actions";
import {
  dangerButtonClass,
  SubmitButton,
  secondaryButtonClass,
} from "@/src/components/ui";

export function DeleteAccountDialog({
  accountId,
  email,
}: {
  accountId: string;
  email: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  return (
    <>
      <button
        className={dangerButtonClass}
        onClick={() => dialog.current?.showModal()}
        type="button"
      >
        Delete account
      </button>
      <dialog
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="border-line bg-surface text-ink backdrop:bg-rail/60 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-xl border p-5 shadow-xl sm:p-6"
        ref={dialog}
      >
        <h2 className="text-lg font-semibold" id={titleId}>
          Delete account?
        </h2>
        <p
          className="text-muted mt-2 [overflow-wrap:anywhere]"
          id={descriptionId}
        >
          This removes sign-in access for {email}.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <form method="dialog">
            <button className={secondaryButtonClass} type="submit">
              Cancel
            </button>
          </form>
          <form action={deleteLogin}>
            <input name="id" type="hidden" value={accountId} />
            <SubmitButton
              className={dangerButtonClass}
              pendingLabel="Deleting account"
            >
              Delete account
            </SubmitButton>
          </form>
        </div>
      </dialog>
    </>
  );
}
