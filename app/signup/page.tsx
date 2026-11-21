import { redirect } from "next/navigation";
import { AuthForm, AuthShell } from "@/src/components/auth";
import { getEligibleUser } from "@/src/services/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (await getEligibleUser()) {
    redirect("/");
  }
  const { status } = await searchParams;
  return (
    <AuthShell>
      <AuthForm
        mode="signup"
        errorMessage={
          status === "account-exists"
            ? "An account with this email already exists. Sign in instead."
            : status === "error"
              ? "We could not create an account. Check your details or contact your administrator."
              : undefined
        }
      />
    </AuthShell>
  );
}
