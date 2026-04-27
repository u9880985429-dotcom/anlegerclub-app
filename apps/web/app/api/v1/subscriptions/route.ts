import { NextResponse } from "next/server";
import { getApiKeyFromRequest, validateApiKey } from "@/lib/api-validation";
import { allSubscriptions } from "@traderiq/api";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/subscriptions
 * Scope: subscriptions.read
 */
export async function GET(req: Request) {
  const key = getApiKeyFromRequest(req);
  if (!key) return NextResponse.json({ error: "missing_api_key" }, { status: 401 });
  const result = validateApiKey(key, "subscriptions.read");
  if (!result.valid) {
    return NextResponse.json({ error: "forbidden", reason: result.reason }, { status: 403 });
  }
  return NextResponse.json({ ok: true, count: allSubscriptions.length, data: allSubscriptions });
}
