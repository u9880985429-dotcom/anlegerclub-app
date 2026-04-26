/**
 * Format helpers — keep date/number rendering consistent across the app.
 */

export function formatGermanDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function formatGermanDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(iso: string): string {
  const ts = Date.parse(iso);
  const diffMs = Date.now() - ts;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "gerade eben";
  if (minutes < 60) return `vor ${minutes} Min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.round(hours / 24);
  if (days < 30) return `vor ${days} Tagen`;
  return formatGermanDate(iso);
}

export const ACTION_LABELS: Record<string, string> = {
  NEUER_KAUF: "Neuer Kauf",
  NEUER_VERKAUF: "Neuer Verkauf",
  ANPASSUNG_STOP: "Anpassung Stop",
  TAKE_PROFIT: "Take Profit",
  NEUER_TRADE: "Neuer Trade",
  GEFUELLT: "Gefüllt",
  TEUER_TRADE: "Teurer Trade",
};

export const ACTION_BADGE_CLASS: Record<string, string> = {
  NEUER_KAUF: "badge-profit",
  NEUER_VERKAUF: "badge-loss",
  ANPASSUNG_STOP: "badge-base",
  TAKE_PROFIT: "badge-profit",
  NEUER_TRADE: "badge-brand",
  GEFUELLT: "badge-brand",
  TEUER_TRADE: "badge-brand",
};
