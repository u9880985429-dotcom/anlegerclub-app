import type { WidgetSize } from "@/lib/kpi-config";

/** Daten die ein Widget zur Darstellung braucht. Beim Render injected. */
export interface WidgetData {
  /** Aggregat aus Ablefy-Sync (falls vorhanden). */
  ablefyAggregate: {
    invoicesFetched: number;
    paid: number;
    open: number;
    cancelled: number;
    refunded: number;
    totalRevenue: number;
    byProduct?: Record<string, { count: number; revenue: number }>;
    byMonth?: Record<string, { count: number; revenue: number }>;
  } | null;
  /** Live-/Mock-Subscriptions. */
  activeMembers: number;
  pausedMembers: number;
  expiredMembers: number;
  totalUsers: number;
  /** ARPU + Churn-Annahmen. */
  avgArpu: number;
  newMembersThisMonth: number;
  churnedMembersThisMonth: number;
}

export interface WidgetCatalogEntry {
  id: string;
  /** Anzeige-Name in der Gallery. */
  title: string;
  /** Kurzbeschreibung — was zeigt das Widget? */
  description: string;
  /** Kategorie fuer Filter in der Gallery. */
  category: "Kennzahl" | "Verlauf" | "Verteilung" | "Funnel" | "Tabelle" | "Heatmap" | "Vergleich";
  /** Default-Spaltenbreite (kann pro Instance ueberschrieben werden). */
  defaultCols: WidgetSize;
  /** Erlaubte Spaltenbreiten. */
  allowedCols: WidgetSize[];
  /** Render-Funktion. Bekommt Daten + per-Instance-Settings rein. */
  render: (data: WidgetData, settings?: Record<string, unknown>) => React.ReactNode;
  /** Praxisbeispiel-Inspiration (welcher Screenshot diente als Vorbild). */
  inspiration?: string;
}
