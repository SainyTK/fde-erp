import { type NextRequest, NextResponse } from "next/server";
import { queryString } from "@/src/utils/query";

export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const account = params.get("account") ?? "1100";
  const target = new URL(
    `/accounting/ledger/${encodeURIComponent(account)}${queryString({ from: params.get("from"), to: params.get("to") })}`,
    request.url,
  );
  return NextResponse.redirect(target);
}
