/**
 * Spec §5 — Login-Status-Texte. Single source of truth.
 * Bei Änderungen: nur diese Datei anfassen.
 */

import type { ProductSlug, SubStatus } from "@traderiq/api";

export interface ActiveCopyVars {
  vorname: string;
  newSignals: number;
  hauptdepot: string;
}

export const PRODUCT_LABELS: Record<ProductSlug, string> = {
  starter: "Starter Depot",
  trend: "Trend Depot",
  stillhalter: "Stillhalter Depot",
  cockpit: "Trader Cockpit",
  "all-access": "All Access Pass",
};

export const PRODUCT_LINKS: { slug: ProductSlug; label: string; url: string }[] = [
  { slug: "starter", label: "Starter Depot", url: "https://member.geldiq.com/s/geldiq/starter-depot-8740b018" },
  { slug: "trend", label: "Trend Depot", url: "https://member.geldiq.com/s/geldiq/trend-depot-c8b71c4e" },
  { slug: "stillhalter", label: "Stillhalter Depot", url: "https://member.geldiq.com/s/geldiq/stillhalter-depot" },
  { slug: "cockpit", label: "Trader Cockpit", url: "https://member.geldiq.com/s/geldiq/trader-cockpit" },
  { slug: "all-access", label: "Trader IQ All Access Pass", url: "https://member.geldiq.com/s/geldiq/trader-iq-anlegerclub-ba83613f" },
];

export const SUPPORT_EMAIL = "info@traderiq.net";

export function activeWelcomeText(vars: ActiveCopyVars): string {
  return `Hallo ${vars.vorname}, willkommen zurück in deinem Trader IQ Anlegerclub. Deine Redaktion hat seit deinem letzten Besuch ${vars.newSignals} neue Signale für dich – schau gleich in dein ${vars.hauptdepot} rein. Viel Erfolg beim heutigen Handelstag!`;
}

export function pausedText(vorname: string): string {
  return `Hallo ${vorname}, dein Zugang ist aktuell pausiert, weil deine letzte Zahlung nicht eingegangen ist. Bitte aktualisiere deine Zahlungsdaten bei Ablefy, um sofort wieder Zugriff zu erhalten. Bei Fragen erreichst du uns unter ${SUPPORT_EMAIL}.`;
}

export function endedText(vorname: string): string {
  return `Hallo ${vorname}, dein Abo ist beendet. Du kannst es jederzeit reaktivieren – wähle dein Wunschprodukt:`;
}

export function statusHeadline(status: SubStatus): string {
  switch (status) {
    case "ACTIVE":
      return "Willkommen zurück";
    case "PAUSED":
      return "Zugang pausiert";
    case "EXPIRED":
      return "Abo beendet";
    case "REFUNDED":
      return "Abo zurückerstattet";
    case "CANCELLED":
      return "Abo gekündigt";
    default:
      return "Trader IQ";
  }
}
