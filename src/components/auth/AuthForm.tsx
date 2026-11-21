import Link from "next/link";
import { signIn, signUp } from "@/app/login/actions";

export function AuthForm({
  mode,
  errorMessage,
}: {
  mode: "login" | "signup";
  errorMessage?: string;
}) {
  const isLogin = mode === "login";
  const title = isLogin ? "Welcome back" : "Create your account";
  const actionLabel = isLogin ? "Sign in" : "Create account";
  const action = isLogin ? signIn : signUp;
  return (
    <>
      <p className="text-sm font-semibold text-[#45815f]">Employee workspace</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-3 text-sm leading-6 text-[#6b796f]">
        {isLogin
          ? "Sign in with your employee email and password."
          : "Use your employee email to get started."}
      </p>
      {errorMessage && (
        <p
          role="alert"
          className="mt-6 rounded-lg bg-[#fff3ee] px-4 py-3 text-sm leading-6 text-[#8f3f26]"
        >
          {errorMessage}
        </p>
      )}
      <form action={action} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-semibold" htmlFor="email">
            Employee email
          </label>
          <input
            autoComplete="email"
            className="h-12 w-full rounded-lg border border-[#d8e1d9] bg-white px-3 text-sm outline-none focus:border-[#438762] focus:ring-2 focus:ring-[#d8eadb]"
            id="email"
            name="email"
            required
            type="email"
          />
        </div>
        <div>
          <label
            className="mb-2 block text-sm font-semibold"
            htmlFor="password"
          >
            Password
          </label>
          <input
            autoComplete={isLogin ? "current-password" : "new-password"}
            className="h-12 w-full rounded-lg border border-[#d8e1d9] bg-white px-3 text-sm outline-none focus:border-[#438762] focus:ring-2 focus:ring-[#d8eadb]"
            id="password"
            minLength={6}
            name="password"
            required
            type="password"
          />
        </div>
        <button
          className="h-12 w-full rounded-lg bg-[#285e45] text-sm font-semibold text-white hover:bg-[#1d4b36] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#285e45]"
          type="submit"
        >
          {actionLabel}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-[#6b796f]">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link
          className="font-semibold text-[#285e45] underline-offset-4 hover:underline"
          href={isLogin ? "/signup" : "/login"}
        >
          {isLogin ? "Create account" : "Sign in"}
        </Link>
      </p>
    </>
  );
}
