import { NextResponse } from "next/server";
import { appendAblefyEvent } from "@/lib/ablefy-store";

export const dynamic = "force-dynamic";

interface SyncBody {
  apiKey?: string;
  apiSecret?: string;
  /** ISO-Date oder predefined wie "last_30_days" */
  dateFrom?: string;
  dateTo?: string;
  /** Optional: nur Invoices fuer eine Produkt-ID. */
  productId?: string;
  /** Maximale Anzahl Seiten — default 5 (entspricht ~500 Invoices). */
  maxPages?: number;
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
}

/**
 * POST /api/v1/ablefy/sync
 *
 * Holt Invoices ueber /api/invoices (paginiert) und aggregiert zu KPIs.
 * Wir geben das Aggregat direkt zurueck — der Client cached es im
 * KPI-Dashboard. Phase 2: Persistenz in Postgres.
 */
export async function POST(req: Request) {
  let body: SyncBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  // maxPages 200 × ~100 invoices/page = max 20.000 Rechnungen pro Sync.
  // Sollte fuer alle realistischen Anlegerclub-Backloads genuegen.
  const { apiKey, apiSecret, dateFrom, dateTo, productId, maxPages = 200 } = body;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, error: "missing_credentials" }, { status: 400 });
  }

  appendAblefyEvent({
    kind: "sync.started",
    status: "ok",
    summary: `Sync gestartet (date_from=${dateFrom ?? "—"}, date_to=${dateTo ?? "—"}, product=${productId ?? "alle"})`,
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
      for (const inv of invoices) aggregateInvoice(agg, inv);
      // Wenn weniger als wahrscheinliches Pagesize zurueckkommt, sind wir fertig.
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
    summary: `Sync OK · ${agg.invoicesFetched} Invoices · Revenue ${agg.totalRevenue.toFixed(2)} €`,
  });
  return NextResponse.json({ ok: true, aggregate: agg });
}

interface AblefyInvoice {
  id?: number | string;
  product_id?: number | string;
  invoice_state?: string;
  payment_state?: string;
  total?: number | string;
  amount?: number | string;
  created_at?: string;
  date?: string;
}

function aggregateInvoice(agg: AggregatedKpi, inv: AblefyInvoice) {
  agg.invoicesFetched++;
  const amount = parseFloat(String(inv.total ?? inv.amount ?? "0")) || 0;
  agg.totalRevenue += amount;

  const ps = inv.payment_state ?? "";
  const is = inv.invoice_state ?? "";
  if (ps === "paid") agg.paid++;
  else if (ps === "open") agg.open++;
  if (is === "cancelled") agg.cancelled++;
  if (ps === "refunded" || is === "refunded") agg.refunded++;

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
