import { NextResponse } from "next/server";
import { appendAblefyEvent } from "@/lib/ablefy-store";
import { loadAblefyConfigFromDb } from "@/lib/ablefy-config-store";
import { isSupabaseConfigured } from "@/lib/supabase";
import { upsertCustomer, upsertSubscription, type SubscriptionStatus } from "@/lib/customers-store";

export const dynamic = "force-dynamic";

interface SyncBody {
  apiKey?: string;
  apiSecret?: string;
  /** ISO-Date oder predefined wie "last_30_days" */
  dateFrom?: string;
  dateTo?: string;
  /** Optional: nur Invoices fuer eine Produkt-ID. */
  productId?: string;
  /** Maximale Anzahl Seiten — default 200 (entspricht ~20.000 Invoices). */
  maxPages?: number;
  /** Wenn false: nur KPI-Aggregat berechnen, nicht in customers-Tabellen schreiben. Default true. */
  persistCustomers?: boolean;
}

interface AggregatedKpi {
  invoicesFetched: number;
  paid: number;
  open: number;
  cancelled: number;
  refunded: number;
  totalRevenue: number;
  byProduct: Record<string, { count: number; revenue: number }>;
  byMonth: Record<string, { count: number; revenue: number }>;
  customersUpserted: number;
  subscriptionsUpserted: number;
}

/**
 * POST /api/v1/ablefy/sync
 *
 * Holt Invoices ueber /api/invoices (paginiert) und macht ZWEI Sachen:
 *   1. KPI-Aggregat (wie bisher) — fuer Dashboard-Charts.
 *   2. Iter 48: Customer + Subscription in Supabase persistieren.
 *
 * Customer-Persistierung greift nur, wenn Supabase konfiguriert ist UND
 * die Ablefy-Konfig ein product_mapping hat (sonst koennen wir Ablefy-
 * Product-IDs nicht auf TraderIQ-Slugs mappen). Pro Invoice ein Customer-
 * + Subscription-Upsert (ablefyOrderId als unique key).
 */
export async function POST(req: Request) {
  let body: SyncBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const {
    apiKey,
    apiSecret,
    dateFrom,
    dateTo,
    productId,
    maxPages = 200,
    persistCustomers = true,
  } = body;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, error: "missing_credentials" }, { status: 400 });
  }

  // Mapping aus DB laden — fuer Slug-Resolution. Bleibt leer wenn nicht konfiguriert.
  let productMappingByAblefyId = new Map<string, { slug: string; planLabel?: string }>();
  if (isSupabaseConfigured() && persistCustomers) {
    try {
      const cfg = await loadAblefyConfigFromDb();
      productMappingByAblefyId = new Map(
        cfg.productMapping.map((m) => [
          m.ablefyProductId,
          { slug: m.traderiqProductSlug, planLabel: m.planLabel },
        ]),
      );
    } catch {
      // Mapping konnte nicht geladen werden — wir aggregieren trotzdem KPIs,
      // ueberspringen aber das Customer-Schreiben.
    }
  }
  const canPersistCustomers = persistCustomers && isSupabaseConfigured();

  appendAblefyEvent({
    kind: "sync.started",
    status: "ok",
    summary: `Sync gestartet (date_from=${dateFrom ?? "—"}, date_to=${dateTo ?? "—"}, product=${productId ?? "alle"}, persist=${canPersistCustomers})`,
  });

  const agg: AggregatedKpi = {
    invoicesFetched: 0,
    paid: 0,
    open: 0,
    cancelled: 0,
    refunded: 0,
    totalRevenue: 0,
    byProduct: {},
    byMonth: {},
    customersUpserted: 0,
    subscriptionsUpserted: 0,
  };

  try {
    for (let page = 1; page <= maxPages; page++) {
      const url = new URL("https://api.myablefy.com/api/invoices");
      url.searchParams.set("key", apiKey);
      url.searchParams.set("secret", apiSecret);
      url.searchParams.set("page", String(page));
      if (dateFrom) url.searchParams.set("date_from", dateFrom);
      if (dateTo) url.searchParams.set("date_to", dateTo);
      if (productId) url.searchParams.set("product_id", productId);

      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const text = await res.text();
        appendAblefyEvent({
          kind: "sync.failed",
          status: "error",
          summary: `Sync abgebrochen auf Seite ${page}: HTTP ${res.status}`,
          payload: text.slice(0, 500),
        });
        return NextResponse.json(
          { ok: false, error: "ablefy_http_error", status: res.status, page, body: text.slice(0, 500) },
          { status: 502 },
        );
      }
      const json = (await res.json()) as { invoices?: AblefyInvoice[]; data?: AblefyInvoice[] } | AblefyInvoice[];
      const invoices = Array.isArray(json) ? json : (json.invoices ?? json.data ?? []);
      if (invoices.length === 0) break;
      for (const inv of invoices) {
        const productKey = String(inv.product_id ?? "");
        const isMapped = productMappingByAblefyId.has(productKey);
        aggregateInvoice(agg, inv, isMapped);
        if (canPersistCustomers && isMapped) {
          await persistInvoice(inv, productMappingByAblefyId, agg);
        }
      }
      if (invoices.length < 50) break;
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch_failed";
    appendAblefyEvent({
      kind: "sync.failed",
      status: "error",
      summary: `Sync fehlgeschlagen: ${msg}`,
    });
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }

  appendAblefyEvent({
    kind: "sync.completed",
    status: "ok",
    summary: `Sync OK · ${agg.invoicesFetched} Invoices · Revenue ${agg.totalRevenue.toFixed(2)} € · ${agg.customersUpserted} Kunden · ${agg.subscriptionsUpserted} Subs`,
  });
  return NextResponse.json({ ok: true, aggregate: agg });
}

interface AblefyInvoice {
  id?: number | string;
  product_id?: number | string;
  // Echte Felder (verifiziert via /api/invoices-Antwort)
  state?: string;            // "paid" | "unpaid" | (ggf. weitere)
  invoice_amount?: number | string;
  payer_email?: string;
  payer_name?: string;       // "Vorname Nachname" — splitten
  // Backwards-Kompat-Felder (aelterer Annahme-Stand, falls Ablefy ein anderes
  // Format auch liefert)
  invoice_state?: string;
  payment_state?: string;
  total?: number | string;
  amount?: number | string;
  buyer_email?: string;
  buyer_first_name?: string;
  buyer_last_name?: string;
  buyer?: { email?: string; first_name?: string; last_name?: string; transfer_ext_id?: string };
  payer?: { email?: string; first_name?: string; last_name?: string; transfer_ext_id?: string };
  // Andere Felder
  transfer_ids?: (number | string)[];
  transfer_ext_id?: string;
  order_id?: number | string;
  currency?: string;
  created_at?: string;
  date?: string;
}

/** Liefert den Bruttobetrag der Invoice in EUR (Float). Probiert mehrere Felder. */
function pickInvoiceAmount(inv: AblefyInvoice): number {
  const candidates = [inv.invoice_amount, inv.total, inv.amount];
  for (const c of candidates) {
    if (c == null) continue;
    const n = typeof c === "number" ? c : parseFloat(String(c));
    if (!isNaN(n)) return n;
  }
  return 0;
}

/** Liefert den normalisierten Status. Ablefy nutzt aktuell `state`. */
function pickInvoiceState(inv: AblefyInvoice): string {
  return (inv.state ?? inv.payment_state ?? inv.invoice_state ?? "").toLowerCase();
}

function aggregateInvoice(agg: AggregatedKpi, inv: AblefyInvoice, isMappedProduct: boolean) {
  // KPI-Aggregat nur fuer Produkte die im Mapping stehen (= Anlegerclub-Produkte).
  // Andere Trader-IQ-Produkte (z.B. FFM Graduate-Mastermind) werden ignoriert,
  // damit die Anlegerclub-KPIs nicht verwaessert werden.
  if (!isMappedProduct) return;

  agg.invoicesFetched++;
  const amount = pickInvoiceAmount(inv);
  agg.totalRevenue += amount;

  const state = pickInvoiceState(inv);
  if (state === "paid") agg.paid++;
  else if (state === "unpaid" || state === "open") agg.open++;
  if (state === "cancelled" || state === "canceled") agg.cancelled++;
  if (state === "refunded") agg.refunded++;

  const productKey = String(inv.product_id ?? "unknown");
  if (!agg.byProduct[productKey]) agg.byProduct[productKey] = { count: 0, revenue: 0 };
  agg.byProduct[productKey].count++;
  agg.byProduct[productKey].revenue += amount;

  const dateStr = inv.created_at ?? inv.date;
  if (dateStr) {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const monthKey = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      if (!agg.byMonth[monthKey]) agg.byMonth[monthKey] = { count: 0, revenue: 0 };
      agg.byMonth[monthKey].count++;
      agg.byMonth[monthKey].revenue += amount;
    }
  }
}

/**
 * Schreibt Customer + Subscription nach Supabase. Defensiv — wenn keine
 * E-Mail extrahierbar ist, wird die Invoice geskippt (KPI-Aggregat zaehlt
 * sie trotzdem, sie taucht nur nicht in der Customer-Tabelle auf).
 */
async function persistInvoice(
  inv: AblefyInvoice,
  mapping: Map<string, { slug: string; planLabel?: string }>,
  agg: AggregatedKpi,
): Promise<void> {
  const email = pickEmail(inv);
  if (!email) return;
  const firstName = pickName(inv, "first") ?? null;
  const lastName = pickName(inv, "last") ?? null;
  const payerId = pickPayerId(inv);
  const productKey = String(inv.product_id ?? "");
  const slugMapping = mapping.get(productKey);
  if (!slugMapping) return; // Ohne Mapping kann man die Sub keinem Depot zuordnen.

  // 1) Customer upsert
  const customer = await upsertCustomer({
    email,
    firstName,
    lastName,
    ablefyPayerId: payerId,
  });
  if (customer) agg.customersUpserted++;

  // 2) Subscription upsert
  const subStatus = mapInvoiceStateToSubStatus(inv);
  const amount = pickInvoiceAmount(inv);
  const sub = await upsertSubscription({
    customerEmail: email,
    productSlug: slugMapping.slug,
    ablefyProductId: productKey,
    planLabel: slugMapping.planLabel,
    ablefyOrderId: inv.order_id != null ? String(inv.order_id) : (inv.id != null ? String(inv.id) : null),
    status: subStatus,
    amountCents: Math.round(amount * 100),
    currency: inv.currency ?? "EUR",
    startedAt: inv.created_at ?? inv.date ?? null,
  });
  if (sub) agg.subscriptionsUpserted++;
}

function pickEmail(inv: AblefyInvoice): string | null {
  const candidates = [inv.payer_email, inv.buyer_email, inv.buyer?.email, inv.payer?.email];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim().toLowerCase();
  }
  return null;
}

function pickName(inv: AblefyInvoice, which: "first" | "last"): string | null {
  // Ablefy liefert den Namen primaer als `payer_name` ("Vorname Nachname"
  // zusammen). Wir splitten am letzten Whitespace: alles davor = first,
  // letzter Token = last.
  if (typeof inv.payer_name === "string" && inv.payer_name.trim().length > 0) {
    const parts = inv.payer_name.trim().split(/\s+/);
    if (parts.length === 1) {
      return which === "first" ? parts[0]! : null;
    }
    if (which === "first") return parts.slice(0, -1).join(" ");
    return parts[parts.length - 1]!;
  }
  // Fallback auf alte Annahmen-Felder
  if (which === "first") {
    const candidates = [inv.buyer_first_name, inv.buyer?.first_name, inv.payer?.first_name];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim().length > 0) return c.trim();
    }
  } else {
    const candidates = [inv.buyer_last_name, inv.buyer?.last_name, inv.payer?.last_name];
    for (const c of candidates) {
      if (typeof c === "string" && c.trim().length > 0) return c.trim();
    }
  }
  return null;
}

function pickPayerId(inv: AblefyInvoice): string | null {
  const candidates = [inv.transfer_ext_id, inv.buyer?.transfer_ext_id, inv.payer?.transfer_ext_id];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return null;
}

function mapInvoiceStateToSubStatus(inv: AblefyInvoice): SubscriptionStatus {
  const state = pickInvoiceState(inv);
  if (state === "refunded") return "refunded";
  if (state === "cancelled" || state === "canceled") return "cancelled";
  if (state === "paid") return "paid";
  if (state === "unpaid" || state === "open") return "active";
  return "active";
}
