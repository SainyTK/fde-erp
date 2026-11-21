import { redirect } from "next/navigation";
import { AuthForm, AuthShell } from "@/src/components/auth";
import { getSignInMessage } from "@/src/constants/sign-in";
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
      <AuthForm errorMessage={getSignInMessage(status)} />
    </AuthShell>
  );
}
