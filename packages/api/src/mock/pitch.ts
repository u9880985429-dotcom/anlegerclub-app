import type { PitchModule } from "../types";

// Spec §14 — Pitch shown at end of trade list, ONLY if user product = "starter".
export const pitchModules: PitchModule[] = [
  {
    id: "pitch_starter_stillhalter",
    audienceProductSlug: "starter",
    headline: "Mehr Rendite aus deinem Depot herausholen?",
    bodyMd:
      "Lerne in unserem 5-tägigen Live-Webinar, wie erfahrene Trader mit dem Optionshandel monatliche Cashflows aufbauen – risikoarm und planbar.",
    ctaLabel: "Jetzt kostenlos anmelden →",
    ctaUrl:
      "https://traderiq.net/geheimnisse-stillhalter-live/?utm_source=traderiq-app&utm_medium=pitch&utm_campaign=stillhalter-live",
    active: true,
  },
];

export function getPitchForAudience(slug: string): PitchModule | undefined {
  return pitchModules.find((p) => p.audienceProductSlug === slug && p.active);
}
