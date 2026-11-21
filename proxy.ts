import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase configuration is missing");
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const { data: status, error } = await supabase.rpc(
      "employee_account_status",
    );
    if (!error && status === "inactive") {
      await supabase.auth.signOut();
      const inactiveResponse =
        request.nextUrl.pathname === "/api/session"
          ? NextResponse.json({ status: "inactive" }, { status: 401 })
          : NextResponse.redirect(
              new URL("/login?status=inactive", request.url),
            );
      for (const cookie of response.cookies.getAll()) {
        inactiveResponse.cookies.set(cookie);
      }
      return inactiveResponse;
    }
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
