import { NextResponse } from "next/server";
import { getSystemHealth } from "@/src/services/health";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks = await getSystemHealth();
  const healthy = Boolean(
    checks?.ledger_balanced &&
      checks.receivables_reconciled &&
      checks.invoice_status_consistent,
  );
  return NextResponse.json(
    { healthy, database: checks !== null, checks },
    { status: healthy ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
