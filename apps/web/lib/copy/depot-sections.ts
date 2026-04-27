/**
 * Mapping von ?tab=X → Anzeige-Label.
 * Wird im Sidebar-Drop-down (AppShell) UND im Page-Header (Breadcrumb) verwendet,
 * damit beide Stellen automatisch synchron bleiben.
 */
export const DEPOT_LABEL = {
  starter: "Starter Depot",
  trend: "Trend Depot",
  stillhalter: "Stillhalter Depot",
  cockpit: "Trader Cockpit",
} as const;

export const STARTER_TAB_LABELS: Record<string, string> = {
  welcome: "Welcome",
  strategie: "Strategie & Performance",
  aktiensparplan: "Trade Signale Aktiensparplan",
  dax: "Trade Signale DAX-Millionär",
  auswertungen: "Depotauswertungen",
  fokus: "Aktie im Fokus",
  broker: "Brokerempfehlung",
  community: "Community",
  archiv: "Archiv",
};

export const TREND_TAB_LABELS: Record<string, string> = {
  welcome: "Welcome",
  start: "Start",
  signale: "Trade-Signale",
  auswertungen: "Depotauswertungen",
  broker: "Brokerempfehlung",
  community: "Community",
  archiv: "Archiv",
};

export const STILLHALTER_TAB_LABELS = TREND_TAB_LABELS;

export const COCKPIT_TAB_LABELS: Record<string, string> = {
  welcome: "Welcome",
  perspektiven: "Perspektiven",
  tag: "Tagesblick",
  woche: "Wochenblick",
  monat: "Monatsblick",
  earnings: "Anstehende Earnings",
  calendar: "Calendar",
  lexikon: "Lexikon",
  community: "Community",
  archiv: "Archiv",
};

export function getDepotTabLabel(slug: keyof typeof DEPOT_LABEL, tab: string): string {
  switch (slug) {
    case "starter":
      return STARTER_TAB_LABELS[tab] ?? "";
    case "trend":
      return TREND_TAB_LABELS[tab] ?? "";
    case "stillhalter":
      return STILLHALTER_TAB_LABELS[tab] ?? "";
    case "cockpit":
      return COCKPIT_TAB_LABELS[tab] ?? "";
  }
}

export function buildBreadcrumb(slug: keyof typeof DEPOT_LABEL, tab: string): string {
  const sub = getDepotTabLabel(slug, tab);
  return sub ? `${DEPOT_LABEL[slug]} · ${sub}` : DEPOT_LABEL[slug];
}
