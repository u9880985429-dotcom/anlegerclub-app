/**
 * customers-SERVICE — konsolidierte, reine Geschaeftslogik rund um Kunden +
 * Abos ("die Regeln"). KEIN Datenzugriff (das macht `repository.ts`), KEIN
 * Framework-/Next-Code. Nur Funktionen, die anderswo doppelt lagen und jetzt
 * an einer Stelle leben.
 *
 * Andere Module/Seiten/Routen importieren NICHT diese Datei direkt, sondern die
 * oeffentliche Tuer `@/modules/customers` (index.ts).
 *
 * WICHTIG — zwei verschiedene Status-Welten, NICHT vermischen:
 *   - Mock-`SubStatus` (aus @traderiq/api, GROSSSCHREIBUNG: ACTIVE/PAID/...)
 *     → betrifft das Mock-User-/Login-System, siehe `hasMockProductAccess`.
 *   - Customer-`SubscriptionStatus` (aus ./types, KLEINSCHREIBUNG: active/paid/...)
 *     → betrifft die echten Ablefy-Kunden, siehe die beiden Ablefy-Mappings.
 */

import type { ProductSlug, Subscription } from "@traderiq/api";
import type { SubscriptionStatus } from "./types";

// ─── Mock-Zugriffsregel (SubStatus, GROSS) ──────────────────────────────────

/**
 * Hat ein Mock-User ueber seine Subscriptions Zugriff auf das Produkt `slug`?
 *
 * Regel (vorher doppelt in `lib/access.ts`):
 *   - die Subscription gilt fuer genau dieses Produkt ODER fuer "all-access", UND
 *   - ihr Status ist ACTIVE, CANCELLED oder PAID (CANCELLED = laeuft bis
 *     Periodenende weiter, PAID = interne Accounts mit Vollzugriff).
 */
export function hasMockProductAccess(subs: Subscription[], slug: ProductSlug): boolean {
  return subs.some(
    (s) =>
      (s.productSlug === slug || s.productSlug === "all-access") &&
      (s.status === "ACTIVE" || s.status === "CANCELLED" || s.status === "PAID"),
  );
}

// ─── Ablefy-Status-Mappings (SubscriptionStatus, klein) ──────────────────────

/**
 * Minimale Sicht auf eine Ablefy-Invoice — nur die Status-Felder, die fuer das
 * Mapping noetig sind. Ablefy nutzt aktuell `state`; die anderen Felder sind
 * Backwards-Kompat fuer aeltere Annahmen.
 */
export interface AblefyInvoiceStateFields {
  state?: string;
  payment_state?: string;
  invoice_state?: string;
}

/** Liefert den normalisierten Status. Ablefy nutzt aktuell `state`. */
export function pickInvoiceState(inv: AblefyInvoiceStateFields): string {
  return (inv.state ?? inv.payment_state ?? inv.invoice_state ?? "").toLowerCase();
}

/**
 * Invoice-State (aus dem Sync) → Customer-`SubscriptionStatus`.
 * Eingabe ist der Rechnungs-Status (z.B. "paid", "refunded").
 */
export function mapAblefyInvoiceStateToStatus(inv: AblefyInvoiceStateFields): SubscriptionStatus {
  const state = pickInvoiceState(inv);
  if (state === "refunded") return "refunded";
  if (state === "cancelled" || state === "canceled") return "cancelled";
  if (state === "paid") return "paid";
  if (state === "unpaid" || state === "open") return "active";
  return "active";
}

/**
 * Webhook-Event-Name (aus dem Webhook) → Customer-`SubscriptionStatus`.
 * Eingabe ist der Event-Name (z.B. "Abo aktiviert", "payment.succeeded").
 * Liefert `null`, wenn der Event NICHT zu einem Status-Update fuehren soll
 * (z.B. SaaS-Plan-Update, Zugriffsaenderung — die treffen den Sub-Status nicht
 * direkt).
 */
export function mapAblefyEventToStatus(eventName: string): SubscriptionStatus | null {
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
