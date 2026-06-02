import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { readAblefyWebhookSecretFromCookieHeader } from "@/lib/ablefy-config";
import { appendAblefyEvent, type AblefyLookupHintRecord } from "@/lib/ablefy-store";
import { buildLookupHint } from "@/lib/ablefy-events";
import { addPendingBuyer } from "@/lib/ablefy-pending-buyers";
import {
  loadAblefyConfigFromDb,
  extractEventName,
  buildSummary,
  shouldTrackBuyer,
  extractBuyerInfo,
  safeCompare,
} from "@/modules/ablefy";

type AblefyConfig = Awaited<ReturnType<typeof loadAblefyConfigFromDb>>;
import { isSupabaseConfigured } from "@/lib/supabase";
import { upsertCustomer, upsertSubscription, mapAblefyEventToStatus } from "@/modules/customers";

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
  // Die geladene Konfig wird unten im Lifecycle-Block wiederverwendet (statt
  // dieselbe Singleton-Row ein zweites Mal zu lesen).
  let webhookSecret = "";
  let dbCfg: AblefyConfig | null = null;
  if (isSupabaseConfigured()) {
    try {
      dbCfg = await loadAblefyConfigFromDb();
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

  // Buyer-Infos einmal ableiten (reine, deterministische Funktion) und in
  // beiden Bloecken unten wiederverwenden, statt zweimal zu extrahieren.
  const buyer = eventName ? extractBuyerInfo(payload) : null;

  // Pending-Buyer ableiten — bei kauf-/zahlungsrelevanten Events.
  if (eventName && buyer && shouldTrackBuyer(eventName)) {
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
  if (eventName && buyer && isSupabaseConfigured()) {
    const lifecycleStatus = mapAblefyEventToStatus(eventName);
    if (lifecycleStatus !== null) {
      if (buyer.email && buyer.productId) {
        try {
          // Oben bereits geladene Konfig wiederverwenden; nur erneut laden, falls
          // der erste Versuch fehlschlug (dbCfg blieb null).
          const cfg = dbCfg ?? (await loadAblefyConfigFromDb());
          const mapping = cfg.productMapping.find((m) => m.ablefyProductId === buyer.productId);
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
