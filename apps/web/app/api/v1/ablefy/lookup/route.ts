import { NextResponse } from "next/server";
import { appendAblefyEvent } from "@/lib/ablefy-store";

export const dynamic = "force-dynamic";

const ALLOWED_ENDPOINTS = ["orders", "payments", "payers", "products"] as const;
type AllowedEndpoint = (typeof ALLOWED_ENDPOINTS)[number];

interface LookupBody {
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  /** ID fuer orders/payments/products bzw. transfer_ext_id fuer payers. */
  id?: string;
  /** Optional: Event-Display-Name fuer das Audit-Log (z.B. "Abo aktiv"). */
  eventName?: string;
}

/**
 * POST /api/v1/ablefy/lookup
 *
 * Detail-Abruf nach einem eingegangenen Webhook. Der Browser uebergibt:
 *   - apiKey + apiSecret (aus localStorage)
 *   - endpoint (orders/payments/payers/products) + id (aus dem Webhook-LookupHint)
 *
 * Wir rufen `https://api.myablefy.com/api/{endpoint}/{id}?key=...&secret=...`
 * und legen das Resultat als `lookup.success`/`lookup.failed`-Event in den
 * In-Memory-Store. Phase 2: Persistenz in Postgres + DB-Schreibpfad fuer
 * abgeleitete KPIs (Active Members, MRR, Refund Rate ...).
 */
export async function POST(req: Request) {
  let body: LookupBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const { apiKey, apiSecret, endpoint, id, eventName } = body;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, error: "missing_credentials" }, { status: 400 });
  }
  if (!endpoint || !ALLOWED_ENDPOINTS.includes(endpoint as AllowedEndpoint)) {
    return NextResponse.json(
      { ok: false, error: "invalid_endpoint", allowed: ALLOWED_ENDPOINTS },
      { status: 400 },
    );
  }
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
  }

  const safeEndpoint = endpoint as AllowedEndpoint;
  const safeId = encodeURIComponent(id.trim());
  const url = new URL(`https://api.myablefy.com/api/${safeEndpoint}/${safeId}`);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("secret", apiSecret);

  const eventLabel = eventName ? `${eventName} → ` : "";
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
        kind: "lookup.failed",
        status: "error",
        summary: `${eventLabel}Lookup /api/${safeEndpoint}/${id} fehlgeschlagen: HTTP ${upstream.status}`,
        payload: parsed,
      });
      return NextResponse.json(
        { ok: false, status: upstream.status, body: parsed },
        { status: upstream.status >= 500 ? 502 : 400 },
      );
    }

    appendAblefyEvent({
      kind: "lookup.success",
      status: "ok",
      summary: `${eventLabel}Lookup /api/${safeEndpoint}/${id} OK`,
      payload: parsed,
    });
    return NextResponse.json({ ok: true, endpoint: safeEndpoint, id, body: parsed });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch_failed";
    appendAblefyEvent({
      kind: "lookup.failed",
      status: "error",
      summary: `${eventLabel}Lookup /api/${safeEndpoint}/${id} fehlgeschlagen: ${msg}`,
    });
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
