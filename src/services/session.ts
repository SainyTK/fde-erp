export async function checkSession() {
  const response = await fetch("/api/session", { cache: "no-store" });
  if (response.status !== 401) {
    return null;
  }
  const data: { status?: string } = await response.json();
  return data.status === "inactive" ? "/login?status=inactive" : "/login";
}
