/**
 * Persistente KPI-Dashboard-Konfiguration.
 *
 * Speicherung:
 *  1. localStorage (sofort verfuegbar, kein Roundtrip — primary store fuer
 *     unmittelbares Render).
 *  2. Postgres via /api/v1/kpi/layout (geraete-uebergreifend, Source of Truth
 *     wenn DB erreichbar). Beim Mount wird DB-Layout geladen und ueberschreibt
 *     ggf. den lokalen Cache. Bei jedem Save wird parallel POST gefired.
 *
 * Falls die DB nicht erreichbar ist (Migration noch nicht durch, Neon im Sleep,
 * Netz-Hiccup) faellt alles auf localStorage zurueck — User bemerkt nichts.
 */

export type WidgetSize = 3 | 4 | 6 | 8 | 12;

export interface WidgetInstance {
  /** Eindeutige Instance-ID — erlaubt mehrere Widgets desselben Typs nebeneinander. */
  instanceId: string;
  /** Verweist auf einen Eintrag in der WIDGET_REGISTRY. */
  widgetId: string;
  /** Spaltenbreite im 12er-Grid. */
  cols: WidgetSize;
  /** Optionaler Custom-Title (sonst Default aus Registry). */
  title?: string;
  /** Optionale per-Widget-Settings (Color-Theme, Time-Range etc.). */
  settings?: Record<string, unknown>;
}

export interface KpiDashboardConfig {
  widgets: WidgetInstance[];
  /** Schema-Version fuer zukuenftige Migrationen. */
  schemaVersion: number;
}

const STORAGE_KEY = "traderiq:kpi-dashboard-config";
const SCHEMA_VERSION = 1;

/**
 * Default-Layout — zeigt direkt sinnvolle Charts, damit der Bildschirm
 * beim Erstaufruf nicht leer ist. User kann jederzeit umbauen.
 */
export const DEFAULT_LAYOUT: WidgetInstance[] = [
  { instanceId: "w-mrr", widgetId: "kpi.mrr", cols: 3 },
  { instanceId: "w-arr", widgetId: "kpi.arr", cols: 3 },
  { instanceId: "w-active", widgetId: "kpi.activeMembers", cols: 3 },
  { instanceId: "w-churn", widgetId: "kpi.churnRate", cols: 3 },
  { instanceId: "w-revenue-area", widgetId: "chart.revenueArea", cols: 8 },
  { instanceId: "w-churn-donut", widgetId: "chart.churnDonut", cols: 4 },
  { instanceId: "w-product-mix", widgetId: "chart.productMix", cols: 6 },
  { instanceId: "w-chartjs-revenue", widgetId: "chartjs.revenueLine", cols: 6 },
  { instanceId: "w-chartjs-product", widgetId: "chartjs.productDoughnut", cols: 6 },
  { instanceId: "w-cohort", widgetId: "table.cohortRetention", cols: 6 },
  { instanceId: "w-funnel", widgetId: "chart.salesFunnel", cols: 12 },
  { instanceId: "w-engagement", widgetId: "table.topTrades", cols: 12 },
];

export function readKpiConfig(): KpiDashboardConfig {
  if (typeof window === "undefined") return { widgets: DEFAULT_LAYOUT, schemaVersion: SCHEMA_VERSION };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { widgets: DEFAULT_LAYOUT, schemaVersion: SCHEMA_VERSION };
    const parsed = JSON.parse(raw) as KpiDashboardConfig;
    if (!parsed.widgets || !Array.isArray(parsed.widgets)) {
      return { widgets: DEFAULT_LAYOUT, schemaVersion: SCHEMA_VERSION };
    }
    return parsed;
  } catch {
    return { widgets: DEFAULT_LAYOUT, schemaVersion: SCHEMA_VERSION };
  }
}

export function writeKpiConfig(cfg: KpiDashboardConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  window.dispatchEvent(new CustomEvent("traderiq:kpi-config-change", { detail: cfg }));
  // Fire-and-forget: parallel zur DB hochladen. Fehler werden geschluckt
  // (User bemerkt nichts, lokaler Cache bleibt korrekt).
  void fetch("/api/v1/kpi/layout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ widgets: cfg.widgets }),
  }).catch(() => {});
}

/**
 * Beim Mount holt der Client das Server-Layout. Wenn die DB ein Layout hat
 * (geraete-uebergreifend gespeichert), ueberschreibt es den lokalen Cache.
 * Wenn nicht (oder DB nicht erreichbar), bleibt der lokale Cache.
 */
export async function syncFromServer(): Promise<KpiDashboardConfig | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/v1/kpi/layout", { cache: "no-store" });
    if (!res.ok) return null;
    const json = (await res.json()) as { ok: boolean; widgets: WidgetInstance[] | null };
    if (!json.ok || !json.widgets) return null;
    const cfg: KpiDashboardConfig = { widgets: json.widgets, schemaVersion: SCHEMA_VERSION };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    window.dispatchEvent(new CustomEvent("traderiq:kpi-config-change", { detail: cfg }));
    return cfg;
  } catch {
    return null;
  }
}

export function resetKpiConfig() {
  writeKpiConfig({ widgets: DEFAULT_LAYOUT, schemaVersion: SCHEMA_VERSION });
}

export function generateInstanceId(): string {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
