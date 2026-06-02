import { NextResponse } from "next/server";
import { requireSession } from "@/lib/access";
import { canManageIntegrations } from "@traderiq/api";
import { runAblefySync } from "@/modules/ablefy";

export const dynamic = "force-dynamic";
// Vollstaendiger Sync kann viele Seiten ziehen — mehr Zeit erlauben (Vercel Pro).
export const maxDuration = 300;

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

/**
 * POST /api/v1/ablefy/sync
 *
 * Holt Invoices ueber /api/invoices (paginiert) und macht ZWEI Sachen:
 *   1. KPI-Aggregat (wie bisher) — fuer Dashboard-Charts.
 *   2. Iter 48: Customer + Subscription in Supabase persistieren.
 *
 * Die komplette Domaenenlogik liegt im ablefy-Modul (`runAblefySync`); der
 * Handler ist nur Auth-Guard, Body-Parsing und Response-Mapping.
 */
export async function POST(req: Request) {
  const session = await requireSession();
  if (!canManageIntegrations(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  let body: SyncBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const { apiKey, apiSecret, dateFrom, dateTo, productId, maxPages, persistCustomers } = body;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, error: "missing_credentials" }, { status: 400 });
  }

  const result = await runAblefySync({
    apiKey,
    apiSecret,
    dateFrom,
    dateTo,
    productId,
    maxPages,
    persistCustomers,
  });

  if (!result.ok) {
    if (result.reason === "http") {
      return NextResponse.json(
        {
          ok: false,
          error: "ablefy_http_error",
          status: result.httpStatus,
          page: result.page,
          body: result.bodySnippet,
        },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: false, error: result.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, aggregate: result.aggregate });
}
