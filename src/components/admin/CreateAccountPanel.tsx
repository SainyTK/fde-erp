import { UserRoundPlus } from "lucide-react";
import { createLogin } from "@/app/admin/actions";
import {
  controlClass,
  PanelHeading,
  panelClass,
  SubmitButton,
} from "@/src/components/ui";

export function CreateAccountPanel() {
  return (
    <section aria-labelledby="create-account-title" className={panelClass}>
      <PanelHeading
        icon={UserRoundPlus}
        id="create-account-title"
        title="Create account"
      />
      <form
        action={createLogin}
        className="grid items-end gap-4 px-4 py-5 sm:px-6 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
      >
        <label className="grid gap-2 text-sm font-medium">
          <span>Employee email</span>
          <input
            autoComplete="off"
            className={controlClass}
            name="email"
            required
            type="email"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          <span>Password (at least 6 characters)</span>
          <input
            autoComplete="new-password"
            className={controlClass}
            minLength={6}
            name="password"
            required
            type="password"
          />
        </label>
        <div>
          <SubmitButton pendingLabel="Creating account">
            Create account
          </SubmitButton>
        </div>
      </form>
    </section>
  );
}
