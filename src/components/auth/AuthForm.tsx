import { ArrowRight } from "lucide-react";
import { signIn } from "@/app/login/actions";
import {
  controlClass,
  Feedback,
  primaryButtonClass,
  SubmitButton,
} from "@/src/components/ui";
import { SignInPassword } from "./SignInPassword";

export function AuthForm({ errorMessage }: { errorMessage?: string }) {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="text-muted mt-2">Use your employee email and password.</p>
      {errorMessage && (
        <div className="mt-5">
          <Feedback error>{errorMessage}</Feedback>
        </div>
      )}
      <form action={signIn} className="mt-7 space-y-5">
        <label className="grid gap-2 text-sm font-medium">
          <span>Employee email</span>
          <input
            autoComplete="username"
            className={controlClass}
            name="email"
            required
            type="email"
          />
        </label>
        <SignInPassword />
        <SubmitButton
          className={`${primaryButtonClass} w-full`}
          pendingLabel="Signing in"
        >
          Sign in <ArrowRight aria-hidden="true" className="size-4" />
        </SubmitButton>
      </form>
      <p className="border-line text-muted mt-6 border-t pt-5 text-sm">
        Need an account? Contact your administrator.
      </p>
    </>
  );
}
