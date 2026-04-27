import { NextResponse } from "next/server";
import { getApiKeyFromRequest, validateApiKey } from "@/lib/api-validation";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ping
 * Validiert den API-Key, gibt Server-Status + erteilte Scopes zurück.
 * Header: `X-API-Key: tiq_live_…` ODER `Authorization: Bearer tiq_live_…`
 */
export async function GET(req: Request) {
  const key = getApiKeyFromRequest(req);
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "missing_api_key", hint: "Set X-API-Key or Authorization: Bearer header" },
      { status: 401 },
    );
  }
  const result = validateApiKey(key);
  if (!result.valid) {
    return NextResponse.json({ ok: false, error: "invalid_api_key", reason: result.reason }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    api: "Trader IQ Anlegerclub Public API v1",
    server_time: new Date().toISOString(),
    your_scopes: result.scopes,
    note: "Phase 1: Demo-API mit localStorage-Keys. Phase 2: echte DB-Keys + Rate-Limiting.",
  });
}
