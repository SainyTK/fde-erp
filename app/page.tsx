import { redirect } from "next/navigation";
import { SessionMonitor } from "@/src/components/session";
import { getEligibleUser } from "@/src/services/auth";
import { signOut } from "./login/actions";

export default async function HomePage() {
  const user = await getEligibleUser();
  if (!user) {
    redirect("/login");
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-8 sm:px-10">
      <SessionMonitor />
      <header className="flex items-center justify-between border-b border-[#dde4dd] pb-6">
        <span className="text-sm font-bold tracking-[0.14em] text-[#275d45] uppercase">
          FDE ERP
        </span>
        <form action={signOut}>
          <button
            className="rounded-lg border border-[#cbd6cc] bg-white px-4 py-2 text-sm font-semibold hover:bg-[#f0f5f0]"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </header>
      <section className="mt-20 max-w-xl">
        <p className="text-sm font-semibold text-[#3e7659]">
          Employee workspace
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Welcome to FDE ERP
        </h1>
        <p className="mt-4 text-base leading-7 text-[#66756b]">
          Signed in as {user.email}.
        </p>
      </section>
    </main>
  );
}
