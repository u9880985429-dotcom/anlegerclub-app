import { NextResponse } from "next/server";
import { getApiKeyFromRequest, validateApiKey } from "@/lib/api-validation";
import { allTrades } from "@traderiq/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/trades
 * Scope: trades.read
 * Gibt alle veröffentlichten Trade-Signale zurück (alle 4 Depots).
 */
export async function GET(req: Request) {
  const key = getApiKeyFromRequest(req);
  if (!key) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  const result = validateApiKey(key, "trades.read");
  if (!result.valid) {
    return NextResponse.json({ error: "forbidden", reason: result.reason }, { status: 403 });
  }
  return NextResponse.json({ ok: true, count: allTrades.length, data: allTrades });
}
