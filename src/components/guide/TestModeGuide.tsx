"use client";

import { useRef } from "react";

export function TestModeGuide() {
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button
        className="fixed right-5 bottom-5 z-40 rounded-full bg-[#285e45] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#1d4b36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285e45]"
        onClick={() => dialog.current?.showModal()}
        type="button"
      >
        Test mode guide
      </button>
      <dialog
        aria-labelledby="guide-title"
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-[#e2e8e1] bg-white p-0 text-[#1d2924] shadow-2xl backdrop:bg-black/40"
        ref={dialog}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-[#45815f]">Test mode</p>
              <h2
                className="mt-2 text-2xl font-semibold tracking-tight"
                id="guide-title"
              >
                Test mode guide
              </h2>
            </div>
            <form method="dialog">
              <button
                aria-label="Close test mode guide"
                className="rounded-lg px-3 py-2 text-xl leading-none text-[#66756b] hover:bg-[#f0f5f0]"
                type="submit"
              >
                &times;
              </button>
            </form>
          </div>
          <ol className="mt-6 list-decimal space-y-4 pl-5 text-sm leading-6 text-[#46564c]">
            <li>
              In Supabase, open the employees table and choose an active
              employee with an email address.
            </li>
            <li>
              Create an account with that email and a password. Open the
              simulated confirmation link, then sign in.
            </li>
            <li>In Supabase, change that employee's is_active value to 0.</li>
            <li>
              Return to the app. The signed-in session should end within a few
              seconds and show an inactive-account message.
            </li>
            <li>
              Try signing in again with the same password. The inactive-account
              message should appear again.
            </li>
            <li>
              Set is_active back to 1 to restore access. An employee with a
              termination date on or before today remains inactive.
            </li>
          </ol>
          <p className="mt-6 rounded-lg bg-[#f1f6f1] px-4 py-3 text-sm leading-6 text-[#465f4d]">
            Email confirmation is simulated. No email is sent or verified.
          </p>
          <form className="mt-6" method="dialog">
            <button
              className="w-full rounded-lg bg-[#285e45] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1d4b36]"
              type="submit"
            >
              Close
            </button>
          </form>
        </div>
      </dialog>
    </>
  );
}
