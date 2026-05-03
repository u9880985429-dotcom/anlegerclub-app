/**
 * Ablefy-Webhook-Event-Mapping (Phase 1).
 *
 * Single-Source-of-Truth fuer die 32 Webhook-Events aus
 * `docs/ablefy-webhook-AUSGEWAEHLT.csv`. Liefert pro Event:
 *   - die Event-Gruppe (ORDER / PAYER / SAAS_PLAN / PAYMENT / REFUND / CHARGEBACK)
 *   - den API-Endpoint zum Detail-Lookup (orders / payments / payers / products)
 *   - eine Liste von Payload-Feld-Kandidaten zum Extrahieren der Lookup-ID
 *
 * Hinweis: Die echten Event-Strings im Webhook-Body sind aktuell **Annahmen**
 * (siehe docs/ablefy-webhook-api-mapping.md). Wir matchen defensiv:
 *   1. exakt gegen den deutschen Display-Namen (case-insensitive)
 *   2. gegen eine Liste von snake_case-/Dot-Notation-Aliasen
 *   3. als Fallback die Event-Gruppe via Schluesselwort (order/payment/payer/...)
 */

export type AblefyEventGroup =
  | "ORDER"
  | "PAYER"
  | "SAAS_PLAN"
  | "PAYMENT"
  | "REFUND"
  | "CHARGEBACK";

export type AblefyLookupEndpoint = "orders" | "payments" | "payers" | "products";

export interface AblefyEventDefinition {
  /** Deutscher Anzeigename aus der Ablefy-Webhook-Konfig. */
  germanName: string;
  /** Event-Kategorie. */
  group: AblefyEventGroup;
  /** Auf welchen API-Endpoint dieses Event mappt. */
  endpoint: AblefyLookupEndpoint;
  /** Alternative Strings, die im Webhook-Body als event/type/event_type auftauchen koennen. */
  aliases?: string[];
}

/**
 * Die 32 aktivierten Events aus `docs/ablefy-webhook-AUSGEWAEHLT.csv`.
 */
export const ABLEFY_EVENT_REGISTRY: AblefyEventDefinition[] = [
  // ORDER → /api/orders/{id} (13 Events)
  { germanName: "Zahlungsart bei Einmalzahlung geändert", group: "ORDER", endpoint: "orders", aliases: ["order.payment_method_changed.one_time", "order.one_time.payment_method_changed"] },
  { germanName: "Zahlungsart bei Abonnement geändert", group: "ORDER", endpoint: "orders", aliases: ["order.payment_method_changed.subscription", "order.subscription.payment_method_changed"] },
  { germanName: "Zahlungsart bei Limitiertem Abo geändert", group: "ORDER", endpoint: "orders", aliases: ["order.payment_method_changed.limited_subscription", "order.limited_subscription.payment_method_changed"] },
  { germanName: "Zahlungsart bei Ratenzahlung geändert", group: "ORDER", endpoint: "orders", aliases: ["order.payment_method_changed.installment", "order.installment.payment_method_changed"] },
  { germanName: "Ratenzahlung abgeschlossen", group: "ORDER", endpoint: "orders", aliases: ["order.installment.completed", "installment.completed"] },
  { germanName: "Ratenzahlung pausiert", group: "ORDER", endpoint: "orders", aliases: ["order.installment.paused", "installment.paused"] },
  { germanName: "Ratenzahlung storniert", group: "ORDER", endpoint: "orders", aliases: ["order.installment.cancelled", "installment.cancelled"] },
  { germanName: "Abo aktiv", group: "ORDER", endpoint: "orders", aliases: ["order.subscription.activated", "subscription.activated", "order.subscription.active"] },
  { germanName: "Abo pausiert", group: "ORDER", endpoint: "orders", aliases: ["order.subscription.paused", "subscription.paused"] },
  { germanName: "Abo storniert", group: "ORDER", endpoint: "orders", aliases: ["order.subscription.cancelled", "subscription.cancelled"] },
  { germanName: "Abo unvollständig", group: "ORDER", endpoint: "orders", aliases: ["order.subscription.incomplete", "subscription.incomplete"] },
  { germanName: "Rate ausstehend", group: "ORDER", endpoint: "orders", aliases: ["order.installment.pending", "installment.pending"] },
  { germanName: "Abo reaktiviert", group: "ORDER", endpoint: "orders", aliases: ["order.subscription.reactivated", "subscription.reactivated"] },

  // ORDER → /api/payments/{id} (4 Events — Erstattungs-/Zahlungs-bezogene Order-Events)
  { germanName: "Raten erstattet", group: "ORDER", endpoint: "payments", aliases: ["order.installment.refunded", "installment.refunded"] },
  { germanName: "Abo-Raten erstattet", group: "ORDER", endpoint: "payments", aliases: ["order.subscription.refunded", "subscription.refunded"] },
  { germanName: "Abo-Raten rückgefordert", group: "ORDER", endpoint: "payments", aliases: ["order.subscription.charged_back", "subscription.charged_back"] },
  { germanName: "Zahlung ausstehend", group: "ORDER", endpoint: "payments", aliases: ["order.payment.pending", "payment.pending.order"] },

  // PAYER → /api/payers/{transfer_ext_id} (2 Events)
  { germanName: "Zugriff geändert", group: "PAYER", endpoint: "payers", aliases: ["payer.access_changed", "payer.access.changed"] },
  { germanName: "E-Mail-Adresse geändert", group: "PAYER", endpoint: "payers", aliases: ["payer.email_changed", "payer.email.changed"] },

  // SAAS_PLAN → /api/products/{id} (1 Event)
  { germanName: "SaaS-Plan aktualisiert", group: "SAAS_PLAN", endpoint: "products", aliases: ["saas_plan.updated", "saas.plan.updated", "product.saas_plan.updated"] },

  // PAYMENT → /api/payments/{id} (4 Events)
  { germanName: "Zahlung erfolgreich", group: "PAYMENT", endpoint: "payments", aliases: ["payment.succeeded", "payment.success", "payment.completed"] },
  { germanName: "Zahlung ausstehend", group: "PAYMENT", endpoint: "payments", aliases: ["payment.pending"] },
  { germanName: "Zahlung abgebrochen", group: "PAYMENT", endpoint: "payments", aliases: ["payment.cancelled", "payment.aborted"] },
  { germanName: "Zahlungsfehler", group: "PAYMENT", endpoint: "payments", aliases: ["payment.failed", "payment.error"] },

  // REFUND → /api/payments/{id} (4 Events)
  { germanName: "Erstattung erfolgreich", group: "REFUND", endpoint: "payments", aliases: ["refund.succeeded", "refund.completed", "refund.success"] },
  { germanName: "Erstattung ausstehend", group: "REFUND", endpoint: "payments", aliases: ["refund.pending"] },
  { germanName: "Erstattung storniert", group: "REFUND", endpoint: "payments", aliases: ["refund.cancelled", "refund.aborted"] },
  { germanName: "Erstattung fehlerhaft", group: "REFUND", endpoint: "payments", aliases: ["refund.failed", "refund.error"] },

  // CHARGEBACK → /api/payments/{id} (4 Events)
  { germanName: "Chargeback erfolgreich", group: "CHARGEBACK", endpoint: "payments", aliases: ["chargeback.succeeded", "chargeback.completed", "chargeback.success"] },
  { germanName: "Chargeback ausstehend", group: "CHARGEBACK", endpoint: "payments", aliases: ["chargeback.pending"] },
  { germanName: "Chargeback storniert", group: "CHARGEBACK", endpoint: "payments", aliases: ["chargeback.cancelled", "chargeback.aborted"] },
  { germanName: "Chargeback fehlerhaft", group: "CHARGEBACK", endpoint: "payments", aliases: ["chargeback.failed", "chargeback.error"] },
];

export interface AblefyLookupHint {
  /** Erkannter Event-Definition (falls Match). */
  definition: AblefyEventDefinition | null;
  /** Auf welchen Endpoint der Detail-Lookup gehen soll (wenn extrahierbar). */
  endpoint: AblefyLookupEndpoint | null;
  /** Aus dem Payload extrahierte Lookup-ID (orders/payments/products → numeric/string ID, payers → transfer_ext_id). */
  id: string | null;
  /** Welches Payload-Feld die ID geliefert hat (zum Debuggen). */
  idSource: string | null;
}

/**
 * Liefert zu einem Webhook-Payload Endpoint + ID fuer den Detail-Lookup.
 * Wenn entweder der Event-Typ unbekannt ist oder die ID fehlt, sind die
 * entsprechenden Felder `null` und der Caller kann den Lookup ueberspringen.
 */
export function buildLookupHint(
  eventNameRaw: string | null,
  payload: unknown,
): AblefyLookupHint {
  const definition = matchEventDefinition(eventNameRaw);
  const endpoint = definition?.endpoint ?? inferEndpointFromKeyword(eventNameRaw) ?? null;
  if (!endpoint) {
    return { definition, endpoint: null, id: null, idSource: null };
  }
  const idHit = extractIdFromPayload(endpoint, payload);
  return {
    definition,
    endpoint,
    id: idHit?.id ?? null,
    idSource: idHit?.source ?? null,
  };
}

function matchEventDefinition(eventNameRaw: string | null): AblefyEventDefinition | null {
  if (!eventNameRaw) return null;
  const needle = eventNameRaw.trim().toLowerCase();
  if (!needle) return null;
  for (const def of ABLEFY_EVENT_REGISTRY) {
    if (def.germanName.toLowerCase() === needle) return def;
    if (def.aliases?.some((a) => a.toLowerCase() === needle)) return def;
  }
  // Substring-Fallback: erlaubt z.B. "v1.order.subscription.activated" → match
  for (const def of ABLEFY_EVENT_REGISTRY) {
    if (def.aliases?.some((a) => needle.includes(a.toLowerCase()))) return def;
  }
  return null;
}

/**
 * Letzter Strohhalm: erkennt anhand eines Schluesselworts den Endpoint, auch
 * wenn der konkrete Event-Typ nicht in der Registry steht.
 */
function inferEndpointFromKeyword(eventNameRaw: string | null): AblefyLookupEndpoint | null {
  if (!eventNameRaw) return null;
  const s = eventNameRaw.toLowerCase();
  if (s.includes("chargeback") || s.includes("refund") || s.includes("erstattung") || s.includes("payment") || s.includes("zahlung")) return "payments";
  if (s.includes("order") || s.includes("subscription") || s.includes("abo") || s.includes("ratenzahlung") || s.includes("rate")) return "orders";
  if (s.includes("payer") || s.includes("zugriff") || s.includes("e-mail") || s.includes("email")) return "payers";
  if (s.includes("saas") || s.includes("plan") || s.includes("product") || s.includes("produkt")) return "products";
  return null;
}

interface IdHit {
  id: string;
  source: string;
}

/**
 * Sucht in einem (potenziell verschachtelten) Webhook-Payload nach der
 * Lookup-ID, die zum jeweiligen Endpoint passt. Liefert `null`, wenn nichts
 * Plausibles gefunden wird.
 */
function extractIdFromPayload(endpoint: AblefyLookupEndpoint, payload: unknown): IdHit | null {
  if (!payload || typeof payload !== "object") return null;
  const p = payload as Record<string, unknown>;
  const data = (p.data && typeof p.data === "object" ? (p.data as Record<string, unknown>) : null) ?? null;

  const candidatesByEndpoint: Record<AblefyLookupEndpoint, Array<{ path: string; value: unknown }>> = {
    orders: [
      { path: "order_id", value: p.order_id },
      { path: "order.id", value: nestedId(p.order) },
      { path: "id", value: p.id },
      { path: "data.order_id", value: data?.order_id },
      { path: "data.order.id", value: nestedId(data?.order) },
      { path: "data.id", value: data?.id },
    ],
    payments: [
      { path: "payment_id", value: p.payment_id },
      { path: "payment.id", value: nestedId(p.payment) },
      { path: "transaction_id", value: p.transaction_id },
      { path: "id", value: p.id },
      { path: "data.payment_id", value: data?.payment_id },
      { path: "data.payment.id", value: nestedId(data?.payment) },
      { path: "data.transaction_id", value: data?.transaction_id },
      { path: "data.id", value: data?.id },
    ],
    payers: [
      { path: "transfer_ext_id", value: p.transfer_ext_id },
      { path: "payer.transfer_ext_id", value: nestedField(p.payer, "transfer_ext_id") },
      { path: "payer_id", value: p.payer_id },
      { path: "data.transfer_ext_id", value: data?.transfer_ext_id },
      { path: "data.payer.transfer_ext_id", value: nestedField(data?.payer, "transfer_ext_id") },
      { path: "data.payer_id", value: data?.payer_id },
    ],
    products: [
      { path: "product_id", value: p.product_id },
      { path: "product.id", value: nestedId(p.product) },
      { path: "id", value: p.id },
      { path: "data.product_id", value: data?.product_id },
      { path: "data.product.id", value: nestedId(data?.product) },
      { path: "data.id", value: data?.id },
    ],
  };

  for (const c of candidatesByEndpoint[endpoint]) {
    if (c.value === undefined || c.value === null) continue;
    const id = String(c.value).trim();
    if (id.length === 0) continue;
    return { id, source: c.path };
  }
  return null;
}

function nestedId(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  return (obj as Record<string, unknown>).id;
}

function nestedField(obj: unknown, field: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  return (obj as Record<string, unknown>)[field];
}
