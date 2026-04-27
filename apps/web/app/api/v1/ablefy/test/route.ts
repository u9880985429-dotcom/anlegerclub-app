import { NextResponse } from "next/server";
import { appendAblefyEvent } from "@/lib/ablefy-store";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/ablefy/test
 *
 * Body: { apiKey: string, apiSecret: string }
 * Triggert den Ablefy-Test-Endpoint /api/me und liefert das Ergebnis zurueck.
 *
 * Wir nehmen API-Key + Secret im Body entgegen, weil sie in Phase 1 nur im
 * Browser leben (localStorage). Der Browser ruft diesen Endpoint mit den
 * gerade eingegebenen Credentials auf.
 *
 * In Phase 2 leitet der Endpoint Credentials aus dem Server-Vault.
 */
export async function POST(req: Request) {
  let body: { apiKey?: string; apiSecret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const { apiKey, apiSecret } = body;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, error: "missing_credentials" }, { status: 400 });
  }

  const url = new URL("https://api.myablefy.com/api/me");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("secret", apiSecret);

  try {
    const upstream = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await upstream.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text.slice(0, 500) };
    }
    if (!upstream.ok) {
      appendAblefyEvent({
        kind: "test.connection",
        status: "error",
        summary: `Verbindungstest fehlgeschlagen: HTTP ${upstream.status}`,
        payload: parsed,
      });
      return NextResponse.json({ ok: false, status: upstream.status, body: parsed });
    }
    appendAblefyEvent({
      kind: "test.connection",
      status: "ok",
      summary: "Verbindungstest /api/me erfolgreich",
      payload: parsed,
    });
    return NextResponse.json({ ok: true, status: upstream.status, body: parsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch_failed";
    appendAblefyEvent({
      kind: "test.connection",
      status: "error",
      summary: `Verbindungstest fehlgeschlagen: ${msg}`,
    });
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
