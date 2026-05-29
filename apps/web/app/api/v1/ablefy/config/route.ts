import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/access";
import { canManageIntegrations } from "@traderiq/api";
import { isSupabaseConfigured } from "@/lib/supabase";
import { loadAblefyConfigFromDb, saveAblefyConfigToDb } from "@/modules/ablefy";

export const dynamic = "force-dynamic";

const PutBody = z.object({
  enabled: z.boolean(),
  apiKey: z.string(),
  apiSecret: z.string(),
  webhookSecret: z.string(),
  productMapping: z.array(
    z.object({
      ablefyProductId: z.string(),
      traderiqProductSlug: z.enum(["starter", "trend", "stillhalter", "cockpit", "all-access"]),
      planLabel: z.string().optional(),
    }),
  ),
  lastSyncAt: z.string().nullable(),
  lastTestAt: z.string().nullable(),
});

/**
 * GET /api/v1/ablefy/config
 *
 * Liefert die aktuell gespeicherte Ablefy-Konfig aus Supabase. Nur Owner/
 * Admin/Sales-Rollen mit Integrations-Berechtigung sehen die Konfig.
 */
export async function GET() {
  const session = await requireSession();
  if (!canManageIntegrations(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 503 });
  }
  const config = await loadAblefyConfigFromDb();
  return NextResponse.json({ ok: true, config });
}

/**
 * PUT /api/v1/ablefy/config
 *
 * Aktualisiert die Konfig in Supabase. Body = vollstaendige Konfig (kein
 * Patch). Server validiert via zod und schreibt per upsert in den
 * Singleton-Datensatz.
 */
export async function PUT(req: Request) {
  const session = await requireSession();
  if (!canManageIntegrations(session.user.role)) {
    return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 503 });
  }

  let body;
  try {
    body = PutBody.parse(await req.json());
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "invalid_body" },
      { status: 400 },
    );
  }

  const result = await saveAblefyConfigToDb(body);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error ?? "save_failed" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
