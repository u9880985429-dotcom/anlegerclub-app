/**
 * Persistente KPI-Dashboard-Konfiguration.
 *
 * Phase 1: localStorage (browser-spezifisch, ueberlebt aber Pushes/Deploys).
 * Phase 2: pro User in Postgres, dadurch geraete-uebergreifend.
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
}

export function resetKpiConfig() {
  writeKpiConfig({ widgets: DEFAULT_LAYOUT, schemaVersion: SCHEMA_VERSION });
}

export function generateInstanceId(): string {
  return `w-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
