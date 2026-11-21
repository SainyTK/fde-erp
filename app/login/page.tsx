import { redirect } from "next/navigation";
import { AuthForm, AuthShell } from "@/src/components/auth";
import { getEligibleUser } from "@/src/services/auth";

export default async function LoginPage({
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
        mode="login"
        errorMessage={
          status === "inactive"
            ? "Your employee account is not active. Contact your administrator."
            : status === "invalid"
              ? "We could not sign you in. Check your details or contact your administrator."
              : undefined
        }
      />
    </AuthShell>
  );
}
