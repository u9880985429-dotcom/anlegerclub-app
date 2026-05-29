import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { readAblefyWebhookSecretFromCookieHeader } from "@/lib/ablefy-config";
import { appendAblefyEvent, type AblefyLookupHintRecord } from "@/lib/ablefy-store";
import { buildLookupHint } from "@/lib/ablefy-events";
import { addPendingBuyer } from "@/lib/ablefy-pending-buyers";
import { loadAblefyConfigFromDb } from "@/lib/ablefy-config-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { upsertCustomer, upsertSubscription, type SubscriptionStatus } from "@/lib/customers-store";

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
  // Webhook-Secret laden — primaer aus DB (Phase 2), Fallback Cookie (Phase 1).
  let webhookSecret = "";
  if (isSupabaseConfigured()) {
    try {
      const dbCfg = await loadAblefyConfigFromDb();
      if (dbCfg.webhookSecret) webhookSecret = dbCfg.webhookSecret;
    } catch {
      // DB-Fehler — wir fallen auf Cookie zurueck.
    }
  }
  if (!webhookSecret) {
    const cookieHeader = req.headers.get("cookie");
    const cookieCfg = readAblefyWebhookSecretFromCookieHeader(cookieHeader);
    if (cookieCfg?.webhookSecret) webhookSecret = cookieCfg.webhookSecret;
  }

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
  if (webhookSecret) {
    if (!signature) {
      appendAblefyEvent({
        kind: "webhook.rejected",
        status: "error",
        summary: "Webhook abgelehnt: keine Signatur im Header (X-Webhook-Signature fehlt).",
        payload,
      });
      return NextResponse.json({ ok: false, error: "missing_signature" }, { status: 401 });
    }
    const expected = crypto.createHmac("sha256", webhookSecret).update(raw).digest("hex");
    if (!safeCompare(expected, signature)) {
      appendAblefyEvent({
        kind: "webhook.rejected",
        status: "error",
        summary: "Webhook abgelehnt: Signatur ungueltig.",
        payload,
      });
      return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
    }
  } else {
    // Kein Secret konfiguriert → Signatur kann nicht geprueft werden. Wir
    // akzeptieren den Webhook weiterhin (sonst bricht die Ablefy-Anbindung),
    // warnen aber sichtbar im Event-Log. TODO: sobald in Ablefy ein
    // Webhook-Secret gesetzt ist, hier auf "ablehnen" umstellen.
    appendAblefyEvent({
      kind: "webhook.insecure",
      status: "error",
      summary:
        "Webhook OHNE Secret akzeptiert — Signatur NICHT geprueft. Bitte in der Ablefy-Konfiguration ein Webhook-Secret setzen, damit gefaelschte Webhooks abgelehnt werden.",
    });
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

  // Pending-Buyer ableiten — bei kauf-/zahlungsrelevanten Events.
  if (eventName && shouldTrackBuyer(eventName)) {
    const buyer = extractBuyerInfo(payload);
    addPendingBuyer({
      triggerEvent: eventName,
      email: buyer.email,
      firstName: buyer.firstName,
      lastName: buyer.lastName,
      orderId: buyer.orderId,
      paymentId: buyer.paymentId,
      productId: buyer.productId,
      amount: buyer.amount,
    });
  }

  // Iter 49: Auto-Customer-Anlage und/oder Status-Update bei lifecycle-events.
  // Wirkt auch auf Storno-/Refund-/Chargeback-Events, damit der Status korrekt
  // sinkt. Login-Faehigkeit kommt erst in Sprint A (Passwort-Setzen-Flow).
  if (eventName && isSupabaseConfigured()) {
    const lifecycleStatus = mapEventToSubStatus(eventName);
    if (lifecycleStatus !== null) {
      const buyer = extractBuyerInfo(payload);
      if (buyer.email && buyer.productId) {
        try {
          const dbCfg = await loadAblefyConfigFromDb();
          const mapping = dbCfg.productMapping.find((m) => m.ablefyProductId === buyer.productId);
          if (mapping) {
            const customer = await upsertCustomer({
              email: buyer.email,
              firstName: buyer.firstName,
              lastName: buyer.lastName,
              status: "active",
            });
            // Subscription nur anlegen, wenn (1) der Customer-Upsert geklappt hat
            // und (2) eine order_id vorliegt. KEIN payment_id-Fallback — eine
            // Subscription hat viele Zahlungen, das wuerde Duplikate erzeugen
            // (identische Order-Schluessel-Regel wie im Sync).
            if (customer && buyer.orderId) {
              await upsertSubscription({
                customerEmail: buyer.email,
                productSlug: mapping.traderiqProductSlug,
                ablefyProductId: buyer.productId,
                planLabel: mapping.planLabel,
                ablefyOrderId: buyer.orderId,
                status: lifecycleStatus,
                amountCents: buyer.amount != null ? Math.round(buyer.amount * 100) : null,
                startedAt: new Date().toISOString(),
              });
            }
          }
        } catch (err) {
          // Auto-Anlage ist Bonus — wenn DB hakt, ist das Pending-Buyer-Event
          // immer noch da, der Owner kann manuell nachfassen.
          console.warn("[webhook] auto-customer-upsert failed:", err);
        }
      }
    }
  }

  return NextResponse.json({
    ok: true,
    received: true,
    lookupHint: lookupHint ?? null,
  });
}

/**
 * Welcher Sub-Status entspricht dem Webhook-Event? Liefert `null` wenn
 * der Event NICHT zu einem Status-Update fuehren soll (z.B. SaaS-Plan-
 * Update, Zugriffsaenderung — die treffen den Sub-Status nicht direkt).
 */
function mapEventToSubStatus(eventName: string): SubscriptionStatus | null {
  const e = eventName.toLowerCase();
  // Aktivierungen / erfolgreiche Zahlungen
  if (
    e.includes("abo aktiv") ||
    e.includes("subscription.activated") ||
    e.includes("abo reaktiviert") ||
    e.includes("ratenzahlung abgeschlossen")
  ) return "active";
  if (
    e.includes("zahlung erfolgreich") ||
    e.includes("payment.succeeded") ||
    e.includes("payment.success") ||
    e.includes("payment.completed")
  ) return "paid";
  // Pause
  if (e.includes("abo pausiert") || e.includes("ratenzahlung pausiert")) return "paused";
  // Stornos
  if (
    e.includes("abo storniert") ||
    e.includes("ratenzahlung storniert") ||
    e.includes("subscription.cancelled")
  ) return "cancelled";
  // Refunds + Chargebacks
  if (
    e.includes("erstattung erfolgreich") ||
    e.includes("refund.succeeded") ||
    e.includes("raten erstattet") ||
    e.includes("abo-raten erstattet")
  ) return "refunded";
  if (
    e.includes("chargeback erfolgreich") ||
    e.includes("rückgefordert") ||
    e.includes("ruckgefordert")
  ) return "refunded";
  return null;
}

/**
 * Welche Events fuehren zu einem Pending-Buyer-Eintrag? Wir interessieren
 * uns hauptsaechlich fuer Kauf-/Zahlungs-Events. Stornierungen/Refunds
 * sammeln wir nicht hier — die hauen ein eigenes Audit-Log.
 */
function shouldTrackBuyer(eventName: string): boolean {
  const e = eventName.toLowerCase();
  return (
    e.includes("abo aktiv") ||
    e.includes("subscription.activated") ||
    e.includes("zahlung erfolgreich") ||
    e.includes("payment.succeeded") ||
    e.includes("ratenzahlung abgeschlossen") ||
    e.includes("abo reaktiviert")
  );
}

interface ExtractedBuyer {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  orderId: string | null;
  paymentId: string | null;
  productId: string | null;
  amount: number | null;
}

function extractBuyerInfo(payload: unknown): ExtractedBuyer {
  if (!payload || typeof payload !== "object") {
    return { email: null, firstName: null, lastName: null, orderId: null, paymentId: null, productId: null, amount: null };
  }
  const p = payload as Record<string, unknown>;
  const data = (p.data && typeof p.data === "object" ? (p.data as Record<string, unknown>) : {}) as Record<string, unknown>;
  const buyer = (p.buyer && typeof p.buyer === "object" ? (p.buyer as Record<string, unknown>) : {}) as Record<string, unknown>;
  const buyerData = (data.buyer && typeof data.buyer === "object" ? (data.buyer as Record<string, unknown>) : {}) as Record<string, unknown>;

  const email = pickString(p.buyer_email, p.email, buyer.email, buyerData.email, data.buyer_email, data.email);
  const firstName = pickString(p.first_name, p.firstName, buyer.first_name, buyerData.first_name, data.first_name);
  const lastName = pickString(p.last_name, p.lastName, buyer.last_name, buyerData.last_name, data.last_name);
  const orderId = pickIdString(p.order_id, p.id, data.order_id, data.id, (p.order as Record<string, unknown>)?.id);
  const paymentId = pickIdString(p.payment_id, data.payment_id, (p.payment as Record<string, unknown>)?.id);
  const productId = pickIdString(p.product_id, data.product_id, (p.product as Record<string, unknown>)?.id);
  const amount = pickNumber(p.amount, p.total, data.amount, data.total);
  return { email, firstName, lastName, orderId, paymentId, productId, amount };
}

function pickString(...candidates: unknown[]): string | null {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return null;
}

function pickIdString(...candidates: unknown[]): string | null {
  for (const c of candidates) {
    if (c === null || c === undefined) continue;
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
    if (typeof c === "number" && Number.isFinite(c)) return String(c);
  }
  return null;
}

function pickNumber(...candidates: unknown[]): number | null {
  for (const c of candidates) {
    if (typeof c === "number" && Number.isFinite(c)) return c;
    if (typeof c === "string") {
      const parsed = parseFloat(c.replace(",", "."));
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
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
