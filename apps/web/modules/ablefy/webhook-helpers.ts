/**
 * ablefy-Modul · REINE WEBHOOK-HELFER.
 *
 * Vorher lebten diese Helfer direkt im POST-Handler von
 * `app/api/v1/ablefy/webhook/route.ts`. Diese Datei kapselt sie 1:1 — reine
 * Funktionen ohne Seiteneffekte (Event-Name-Extraktion, Summary-Text,
 * Buyer-Klassifikation, Buyer-Extraktion, HMAC-Vergleich). Die Orchestrierung
 * (Secret laden, HMAC pruefen, appendAblefyEvent, Auto-Customer-Upsert) bleibt
 * bewusst in der Route.
 *
 * Konsumenten importieren ueber die Modul-Tuer `@/modules/ablefy`, nicht diese
 * Datei direkt.
 */

import crypto from "node:crypto";
import type { AblefyLookupHintRecord } from "@/lib/ablefy-store";

/**
 * Welche Events fuehren zu einem Pending-Buyer-Eintrag? Wir interessieren
 * uns hauptsaechlich fuer Kauf-/Zahlungs-Events. Stornierungen/Refunds
 * sammeln wir nicht hier — die hauen ein eigenes Audit-Log.
 */
export function shouldTrackBuyer(eventName: string): boolean {
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

export interface ExtractedBuyer {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  orderId: string | null;
  paymentId: string | null;
  productId: string | null;
  amount: number | null;
}

export function extractBuyerInfo(payload: unknown): ExtractedBuyer {
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

export function buildSummary(eventName: string | null, hint: AblefyLookupHintRecord | undefined): string {
  if (!eventName) return "Webhook empfangen (ohne Event-Name).";
  if (!hint) return `Webhook empfangen: ${eventName} (kein Endpoint-Mapping)`;
  return `Webhook empfangen: ${eventName} → /api/${hint.endpoint}/${hint.id}`;
}

export function safeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function extractEventName(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  if (typeof p.event === "string") return p.event;
  if (typeof p.type === "string") return p.type;
  if (typeof p.event_type === "string") return p.event_type;
  return null;
}
