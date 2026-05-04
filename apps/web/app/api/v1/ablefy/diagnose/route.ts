import { NextResponse } from "next/server";
import { requireSession } from "@/lib/access";
import { canManageIntegrations } from "@traderiq/api";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/ablefy/diagnose
 *
 * Liefert technischen Status der Supabase-Anbindung. Hilft, wenn
 * "Konfig wird nicht persistiert" auftritt — zeigt genau, an welcher
 * Stelle es hakt: ENV-Vars / Tabelle / Row.
 */
export async function GET() {
  const session = await requireSession();
  const role = session.user.role;
  const allowed = canManageIntegrations(role);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

  const result: Record<string, unknown> = {
    actor: { id: session.user.id, role, can_manage_integrations: allowed },
    env: {
      // Volle URL (kein Geheimnis — die Adresse ist eh oeffentlich sichtbar in Network-Tab)
      NEXT_PUBLIC_SUPABASE_URL_value: url,
      url_length: url.length,
      url_starts_with_https: url.startsWith("https://"),
      url_has_rest_v1_suffix: url.includes("/rest/v1"),
      url_has_trailing_slash: url.endsWith("/"),
      // Keys nur Laenge + Anfang (nicht den ganzen Wert)
      anon_key_length: anonKey.length,
      anon_key_prefix: anonKey.slice(0, 10),
      service_key_length: serviceKey.length,
      service_key_prefix: serviceKey.slice(0, 10),
      supabase_configured: isSupabaseConfigured(),
    },
  };

  if (!isSupabaseConfigured()) {
    result.fatal = "ENV-Variablen fehlen in Vercel — pruefe Project Settings > Environment Variables";
    return NextResponse.json(result);
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    result.fatal = "Supabase-Client konnte nicht erstellt werden";
    return NextResponse.json(result);
  }

  // ablefy_config Tabelle pruefen
  try {
    const { data, error } = await supabase
      .from("ablefy_config")
      .select("*")
      .eq("id", "singleton")
      .maybeSingle();
    if (error) {
      result.ablefy_config_table = { accessible: false, error: error.message };
    } else if (!data) {
      result.ablefy_config_table = { accessible: true, row_exists: false };
    } else {
      const row = data as Record<string, unknown>;
      result.ablefy_config_table = {
        accessible: true,
        row_exists: true,
        has_api_key: Boolean(row.api_key),
        api_key_length: typeof row.api_key === "string" ? row.api_key.length : 0,
        has_api_secret: Boolean(row.api_secret),
        api_secret_length: typeof row.api_secret === "string" ? row.api_secret.length : 0,
        has_webhook_secret: Boolean(row.webhook_secret),
        product_mapping_count: Array.isArray(row.product_mapping) ? row.product_mapping.length : 0,
        enabled: row.enabled,
        last_test_at: row.last_test_at,
        last_sync_at: row.last_sync_at,
        updated_at: row.updated_at,
      };
    }
  } catch (err) {
    result.ablefy_config_table = {
      accessible: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }

  // customers Tabelle pruefen
  try {
    const { count, error } = await supabase
      .from("customers")
      .select("*", { count: "exact", head: true });
    result.customers_table = error
      ? { accessible: false, error: error.message }
      : { accessible: true, row_count: count ?? 0 };
  } catch (err) {
    result.customers_table = {
      accessible: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }

  // customer_subscriptions Tabelle pruefen
  try {
    const { count, error } = await supabase
      .from("customer_subscriptions")
      .select("*", { count: "exact", head: true });
    result.customer_subscriptions_table = error
      ? { accessible: false, error: error.message }
      : { accessible: true, row_count: count ?? 0 };
  } catch (err) {
    result.customer_subscriptions_table = {
      accessible: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }

  return NextResponse.json(result);
}
