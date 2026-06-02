import { getSupabaseAdmin } from "@/lib/supabase";
import { DEFAULT_ABLEFY_CONFIG, type AblefyConfig, type AblefyProductMapping } from "@/lib/ablefy-config";

/**
 * ablefy-Modul · Konfig-REPOSITORY — der EINZIGE Ort mit Supabase-Zugriff fuer
 * die Ablefy-Konfiguration (Singleton-Row `public.ablefy_config`, id='singleton').
 *
 * Warum Singleton: Phase 1 hat genau eine Anlegerclub-Instanz mit *einer*
 * gemeinsamen Ablefy-Anbindung. Phase 2 (Multi-Tenant) wuerde das auf eine
 * org_id-basierte Tabelle erweitern.
 *
 * Faellt auf DEFAULT_ABLEFY_CONFIG zurueck, wenn Supabase nicht konfiguriert
 * ist oder die Row noch nicht existiert. Konsumenten importieren ueber die
 * Modul-Tuer `@/modules/ablefy`, nicht diese Datei direkt.
 */

interface DbConfigRow {
  id: string;
  enabled: boolean | null;
  api_key: string | null;
  api_secret: string | null;
  webhook_secret: string | null;
  product_mapping: AblefyProductMapping[] | null;
  last_sync_at: string | null;
  last_test_at: string | null;
  updated_at: string | null;
}

function rowToConfig(row: DbConfigRow): AblefyConfig {
  return {
    enabled: Boolean(row.enabled),
    apiKey: row.api_key ?? "",
    apiSecret: row.api_secret ?? "",
    webhookSecret: row.webhook_secret ?? "",
    productMapping: Array.isArray(row.product_mapping) ? row.product_mapping : [],
    lastSyncAt: row.last_sync_at ?? null,
    lastTestAt: row.last_test_at ?? null,
  };
}

export async function loadAblefyConfigFromDb(): Promise<AblefyConfig> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return DEFAULT_ABLEFY_CONFIG;
  const { data, error } = await supabase
    .from("ablefy_config")
    .select("*")
    .eq("id", "singleton")
    .maybeSingle();
  if (error) {
    console.error("[ablefy-config-repo] load failed:", error.message);
    return DEFAULT_ABLEFY_CONFIG;
  }
  if (!data) return DEFAULT_ABLEFY_CONFIG;
  return rowToConfig(data as DbConfigRow);
}

export async function saveAblefyConfigToDb(cfg: AblefyConfig): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "supabase_not_configured" };
  const { error } = await supabase
    .from("ablefy_config")
    .upsert({
      id: "singleton",
      enabled: cfg.enabled,
      api_key: cfg.apiKey,
      api_secret: cfg.apiSecret,
      webhook_secret: cfg.webhookSecret,
      product_mapping: cfg.productMapping,
      last_sync_at: cfg.lastSyncAt,
      last_test_at: cfg.lastTestAt,
      updated_at: new Date().toISOString(),
    });
  if (error) {
    console.error("[ablefy-config-repo] save failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
