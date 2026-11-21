import { NextResponse } from "next/server";
import { getEligibleUser } from "@/src/services/auth";

export async function GET() {
  const user = await getEligibleUser();
  if (!user) {
    return NextResponse.json({ status: "unavailable" }, { status: 401 });
  }
  return NextResponse.json({ status: "active" });
}
