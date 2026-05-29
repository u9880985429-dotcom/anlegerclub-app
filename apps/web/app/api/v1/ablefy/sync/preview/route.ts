import { NextResponse } from "next/server";
import { requireSession } from "@/lib/access";
import { canManageIntegrations } from "@traderiq/api";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/ablefy/sync/preview
 *
 * Zieht die erste Seite von /api/invoices und gibt **eine** Rohdaten-Invoice
 * als JSON zurueck. Wird im Admin-UI als "Rohdaten zeigen"-Knopf verwendet,
 * damit der Owner die echten Feldnamen sehen + uns die korrekten Mapping-
 * Annahmen mitteilen kann.
 */
export async function POST(req: Request) {
  const session = await requireSession();
  if (!canManageIntegrations(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  let body: { apiKey?: string; apiSecret?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const { apiKey, apiSecret } = body;
  if (!apiKey || !apiSecret) {
    return NextResponse.json({ ok: false, error: "missing_credentials" }, { status: 400 });
  }

  const url = new URL("https://api.myablefy.com/api/invoices");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("secret", apiSecret);
  url.searchParams.set("page", "1");

  try {
    const upstream = await fetch(url, { headers: { Accept: "application/json" } });
    const text = await upstream.text();
    let parsed: unknown = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { ok: false, error: "ablefy_non_json", status: upstream.status, body: text.slice(0, 1000) },
        { status: 502 },
      );
    }
    if (!upstream.ok) {
      return NextResponse.json({ ok: false, status: upstream.status, body: parsed }, { status: 502 });
    }
    // Erste Invoice extrahieren
    const arr = Array.isArray(parsed)
      ? parsed
      : ((parsed as { invoices?: unknown[]; data?: unknown[] }).invoices ??
        (parsed as { invoices?: unknown[]; data?: unknown[] }).data ??
        []);
    const total = arr.length;
    const sample = arr.slice(0, 3);
    return NextResponse.json({ ok: true, totalOnPage: total, sample });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "fetch_failed";
    return NextResponse.json({ ok: false, error: msg }, { status: 502 });
  }
}
