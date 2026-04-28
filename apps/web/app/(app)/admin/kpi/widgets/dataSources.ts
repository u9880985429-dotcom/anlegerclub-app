/**
 * Daten-Quellen-Katalog fuer KPI-Widgets.
 *
 * Pro Widget-Instance kann der User auswaehlen, aus welcher API-Quelle die
 * Daten kommen. Phase 1: nur Anzeige + Speicherung in instance.settings.
 * Phase 2: der DynamicGridLoader liest die dataSourceId und ruft den jeweils
 * konfigurierten Endpoint auf, mappt die Felder gemaess Profile auf WidgetData.
 */

export interface DataSourceProfile {
  id: string;
  label: string;
  /** Provider — bestimmt das Auth-Schema im Backend. */
  provider: "ablefy" | "internal" | "custom";
  /** API-Endpoint relativ oder absolut. */
  endpoint: string;
  /** HTTP-Methode. */
  method: "GET" | "POST";
  /** Welche Widget-Datenfelder dieser Endpoint speist. */
  feeds: ("byMonth" | "byProduct" | "byStatus" | "totalRevenue" | "invoicesFetched" | "custom")[];
  /** Kurz-Beschreibung fuer den User. */
  description: string;
  /** Welche Widget-Kategorien profitieren von dieser Quelle. */
  recommendedFor: ("Kennzahl" | "Verlauf" | "Verteilung" | "Vergleich" | "Funnel" | "Tabelle" | "Heatmap")[];
}

export const DATA_SOURCES: DataSourceProfile[] = [
  {
    id: "ablefy.invoices",
    label: "Ablefy · Rechnungen (alle)",
    provider: "ablefy",
    endpoint: "/api/invoices",
    method: "GET",
    feeds: ["byMonth", "totalRevenue", "invoicesFetched", "byStatus"],
    description: "Holt alle Rechnungen mit Date-Range-Filter. Aggregiert zu byMonth (Revenue/Count), Status-Counts und Total.",
    recommendedFor: ["Kennzahl", "Verlauf", "Vergleich", "Tabelle"],
  },
  {
    id: "ablefy.invoices.product",
    label: "Ablefy · Rechnungen je Produkt",
    provider: "ablefy",
    endpoint: "/api/invoices",
    method: "GET",
    feeds: ["byProduct", "totalRevenue"],
    description: "Selber Endpoint wie oben, aber gruppiert clientseitig nach `product_id` zu byProduct (Revenue/Count je Produkt).",
    recommendedFor: ["Verteilung", "Vergleich"],
  },
  {
    id: "ablefy.orders",
    label: "Ablefy · Bestellungen",
    provider: "ablefy",
    endpoint: "/api/orders",
    method: "GET",
    feeds: ["byMonth", "invoicesFetched"],
    description: "Bestellungen statt Rechnungen — relevant fuer Conversion-Funnel und Order-Tracking. Phase 2: paginiert.",
    recommendedFor: ["Funnel", "Verlauf", "Tabelle"],
  },
  {
    id: "ablefy.payments",
    label: "Ablefy · Zahlungen",
    provider: "ablefy",
    endpoint: "/api/payments",
    method: "GET",
    feeds: ["totalRevenue", "byStatus"],
    description: "Einzelne Zahlungen mit Status (paid/pending/failed). Ideal fuer Revenue-Total + Refund-Rate.",
    recommendedFor: ["Kennzahl"],
  },
  {
    id: "ablefy.products",
    label: "Ablefy · Produkte",
    provider: "ablefy",
    endpoint: "/api/products",
    method: "GET",
    feeds: ["custom"],
    description: "Produkt-Liste mit Preisen + Pricing-Plans. Liefert Metadaten zur Anreicherung anderer Widgets.",
    recommendedFor: ["Tabelle"],
  },
  {
    id: "internal.subscriptions",
    label: "Anlegerclub · Subscriptions (intern)",
    provider: "internal",
    endpoint: "/api/v1/subscriptions",
    method: "GET",
    feeds: ["byStatus", "byProduct"],
    description: "Lokale Subscription-Datenbank (Phase 2: Postgres). Schneller als Ablefy + zeigt Status pausiert/expired.",
    recommendedFor: ["Verteilung", "Kennzahl", "Tabelle"],
  },
  {
    id: "internal.users",
    label: "Anlegerclub · User (intern)",
    provider: "internal",
    endpoint: "/api/v1/users",
    method: "GET",
    feeds: ["custom"],
    description: "Lokale User-Datenbank fuer Mitglieder-Counts, Sales-Performance, Engagement.",
    recommendedFor: ["Kennzahl", "Tabelle"],
  },
  {
    id: "demo.static",
    label: "Demo-Daten (statisch)",
    provider: "internal",
    endpoint: "(client-mock)",
    method: "GET",
    feeds: ["byMonth", "byProduct", "byStatus", "totalRevenue"],
    description: "Statische Mock-Daten (nicht-live) — gut fuer Stakeholder-Demos ohne echte API-Calls.",
    recommendedFor: ["Kennzahl", "Verlauf", "Verteilung", "Vergleich", "Funnel", "Tabelle"],
  },
  {
    id: "custom",
    label: "Custom · eigener Endpoint",
    provider: "custom",
    endpoint: "(user-defined)",
    method: "GET",
    feeds: ["custom"],
    description: "Eigener API-Endpoint mit JSON-Antwort. Erwartet `byMonth`, `byProduct`, `totalRevenue` etc. im Top-Level.",
    recommendedFor: ["Kennzahl", "Verlauf", "Verteilung", "Vergleich", "Funnel", "Tabelle", "Heatmap"],
  },
];

export const DEFAULT_DATA_SOURCE_ID = "demo.static";

export function findDataSource(id?: string): DataSourceProfile | undefined {
  if (!id) return undefined;
  return DATA_SOURCES.find((d) => d.id === id);
}
