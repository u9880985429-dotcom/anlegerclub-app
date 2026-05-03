import type { ProductSlug } from "@traderiq/api";

/**
 * Pricing-Plaene aller Depots (Stand-Listenpreis).
 *
 * Wichtig: Das sind **Standard-Preise** fuer Forecast/MRR-Schaetzung. Die
 * tatsaechlich von Ablefy abgerechneten Betraege koennen abweichen — z.B.
 * wegen MwSt-Unterschiede bei internationalen Kunden. Die Ist-Werte holt
 * die App direkt aus den Ablefy-Webhooks/Lookups; diese Konstanten dienen
 * **nur** zur Erwartungs-/Vorhersage-Berechnung.
 */
export interface PricingPlan {
  /** TraderIQ-Depot. */
  slug: ProductSlug;
  /**
   * Plan-Label aus dem Produkt-Mapping. `null` = Default-Plan fuer den Slug
   * (greift wenn kein Mapping mit passendem Plan-Label gefunden wird).
   */
  planLabel: string | null;
  /** Standardpreis pro Monat (EUR). */
  monthlyPrice: number;
  /** Standardpreis pro Jahr (EUR), oder `null` wenn nicht angeboten. */
  yearlyPrice: number | null;
  /** Einmaliger Trial-Preis (EUR), oder `null` wenn keine Trial. */
  trialPriceOnce: number | null;
  /** Trial-Dauer in Monaten, oder `null` wenn keine Trial. */
  trialDurationMonths: number | null;
  /** Menschenlesbare Beschreibung (fuer UI-Anzeige im Backend). */
  description: string;
}

export const PRODUCT_PRICING: PricingPlan[] = [
  // Einzel-Depots — kein Trial, beide Preis-Optionen Monat/Jahr.
  {
    slug: "starter",
    planLabel: null,
    monthlyPrice: 14.97,
    yearlyPrice: 120,
    trialPriceOnce: null,
    trialDurationMonths: null,
    description: "14,97 €/Mon · 120 €/Jahr",
  },
  {
    slug: "trend",
    planLabel: null,
    monthlyPrice: 49,
    yearlyPrice: 480,
    trialPriceOnce: null,
    trialDurationMonths: null,
    description: "49 €/Mon · 480 €/Jahr",
  },
  {
    slug: "stillhalter",
    planLabel: null,
    monthlyPrice: 49,
    yearlyPrice: 480,
    trialPriceOnce: null,
    trialDurationMonths: null,
    description: "49 €/Mon · 480 €/Jahr",
  },
  {
    slug: "cockpit",
    planLabel: null,
    monthlyPrice: 27,
    yearlyPrice: 240,
    trialPriceOnce: null,
    trialDurationMonths: null,
    description: "27 €/Mon · 240 €/Jahr",
  },

  // All Access Pass — drei Varianten mit eigenem Pricing.
  {
    slug: "all-access",
    planLabel: "ohne Testzeitraum",
    monthlyPrice: 97,
    yearlyPrice: 900,
    trialPriceOnce: null,
    trialDurationMonths: null,
    description: "97 €/Mon · 900 €/Jahr",
  },
  {
    slug: "all-access",
    planLabel: "3 Mon. Testzeitraum",
    monthlyPrice: 97,
    yearlyPrice: null,
    trialPriceOnce: 1,
    trialDurationMonths: 3,
    description: "1 € einmalig für 3 Mon, dann 97 €/Mon",
  },
  {
    slug: "all-access",
    planLabel: "6 Mon. Testzeitraum",
    monthlyPrice: 97,
    yearlyPrice: null,
    trialPriceOnce: 1,
    trialDurationMonths: 6,
    description: "1 € einmalig für 6 Mon, dann 97 €/Mon",
  },
];

/**
 * Findet den Pricing-Plan fuer eine Subscription. Wenn ein `planLabel`
 * uebergeben wird, wird zuerst nach exaktem Match gesucht; sonst (bzw. als
 * Fallback) wird der Default-Plan des Slugs (planLabel === null) zurueck-
 * geliefert. Liefert `null`, wenn der Slug keinen Pricing-Plan hat.
 */
export function findPricing(slug: ProductSlug, planLabel?: string | null): PricingPlan | null {
  if (planLabel) {
    const exact = PRODUCT_PRICING.find((p) => p.slug === slug && p.planLabel === planLabel);
    if (exact) return exact;
  }
  return PRODUCT_PRICING.find((p) => p.slug === slug && p.planLabel === null) ?? null;
}

/**
 * Berechnet den erwarteten Wert ueber `months` Monate fuer einen Pricing-
 * Plan — beruecksichtigt Trial-Phase. Ergebnis in EUR (gerundet auf 2
 * Nachkommastellen).
 */
export function calculateExpectedRevenue(plan: PricingPlan, months: number): number {
  if (months <= 0) return 0;
  if (plan.trialPriceOnce !== null && plan.trialDurationMonths !== null) {
    const trial = Math.min(months, plan.trialDurationMonths);
    const postTrial = Math.max(0, months - plan.trialDurationMonths);
    const total = plan.trialPriceOnce + postTrial * plan.monthlyPrice;
    return Math.round(total * 100) / 100;
  }
  return Math.round(months * plan.monthlyPrice * 100) / 100;
}
