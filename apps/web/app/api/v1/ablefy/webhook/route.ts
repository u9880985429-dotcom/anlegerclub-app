import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { readAblefyWebhookSecretFromCookieHeader } from "@/lib/ablefy-config";
import { appendAblefyEvent, type AblefyLookupHintRecord } from "@/lib/ablefy-store";
import { buildLookupHint } from "@/lib/ablefy-events";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/ablefy/webhook
 *
 * Receiver fuer Ablefy-Webhook-Events.
 *
 * Phase 1: Liest das Webhook-Secret aus dem `tiq_ablefy_secret`-Cookie
 *   (Browser-Konfig wird beim Schreiben mitgespiegelt). Verifiziert HMAC-SHA256
 *   ueber den Body, falls ein Secret konfiguriert ist. Schreibt Events in den
 *   In-Memory-Store (sichtbar in /admin/integrations/ablefy → Event-Log und in
 *   /admin/logs → Webhooks).
 *
 * Phase 2: Webhook-Secret aus DB+Vault, Events in Postgres + Live-Push.
 */
export async function POST(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  const cfg = readAblefyWebhookSecretFromCookieHeader(cookieHeader);

  // Body als raw String einlesen (wir brauchen ihn fuer HMAC).
  const raw = await req.text();
  let payload: unknown = null;
  try {
    payload = JSON.parse(raw);
  } catch {
    // Webhook ohne JSON-Body — wir akzeptieren das, payload bleibt null.
  }

  // Signaturpruefung — Ablefy-Standardheader heisst `X-Webhook-Signature`,
  // ggf. anpassen falls Ablefy einen anderen Header verwendet.
  const signature = req.headers.get("x-webhook-signature") ?? req.headers.get("x-ablefy-signature");
  if (cfg?.webhookSecret) {
    if (!signature) {
      appendAblefyEvent({
        kind: "webhook.rejected",
        status: "error",
        summary: "Webhook abgelehnt: keine Signatur im Header (X-Webhook-Signature fehlt).",
        payload,
      });
      return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 401 });
    }
    const expected = crypto.createHmac("sha256", cfg.webhookSecret).update(raw).digest("hex");
    if (!safeCompare(expected, signature)) {
      appendAblefyEvent({
        kind: "webhook.rejected",
        status: "error",
        summary: "Webhook abgelehnt: Signatur ungueltig.",
        payload,
      });
      return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }
  }

  // Event-Typ → Endpoint + ID fuer den Detail-Lookup ableiten.
  const eventName = extractEventName(payload);
  const hint = buildLookupHint(eventName, payload);
  const lookupHint: AblefyLookupHintRecord | undefined =
    hint.endpoint && hint.id
      ? {
          endpoint: hint.endpoint,
          id: hint.id,
          group: hint.definition?.group ?? null,
          idSource: hint.idSource,
        }
      : undefined;

  const summary = buildSummary(eventName, lookupHint);
  appendAblefyEvent({
    kind: "webhook.received",
    status: "ok",
    summary,
    payload,
    lookupHint,
  });

  return NextResponse.json({
    ok: true,
    received: true,
    lookupHint: lookupHint ?? null,
  });
}

function buildSummary(eventName: string | null, hint: AblefyLookupHintRecord | undefined): string {
  if (!eventName) return "Webhook empfangen (ohne Event-Name).";
  if (!hint) return `Webhook empfangen: ${eventName} (kein Endpoint-Mapping)`;
  return `Webhook empfangen: ${eventName} → /api/${hint.endpoint}/${hint.id}`;
}

/**
 * Erlaubt Ablefy einen GET-Ping als Verifikation, ob der Endpoint erreichbar ist.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/v1/ablefy/webhook",
    method: "POST",
    info: "Ablefy-Webhook-Receiver. Konfiguriere den Webhook in Ablefy -> Marketing -> Webhooks und wahle die Events aus.",
  });
}

function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function extractEventName(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.event === "string") return p.event;
  if (typeof p.type === "string") return p.type;
  if (typeof p.event_type === "string") return p.event_type;
  return null;
}
