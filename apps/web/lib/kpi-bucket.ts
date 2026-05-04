import type { ProductSlug, Subscription } from "@traderiq/api";
import type { AblefyProductMapping } from "@/lib/ablefy-config";

/**
 * KPI-Aggregations-Regel (zementiert hier in einer Stelle):
 *
 * Eine Subscription gehoert zu *genau einem* TraderIQ-Slug — naemlich dem
 * Produkt, fuer das der Kunde **bezahlt**. Der Slug `"all-access"` deckt
 * Zugriff auf alle vier Einzeldepots (Starter / Trend / Stillhalter /
 * Cockpit) ab, aber **fuer KPI-Zwecke** zaehlt der Kunde **nur in den
 * `all-access`-Bucket**, NICHT zusaetzlich in die vier Einzeldepots.
 *
 * Begruendung: All-Access-Kunden zahlen einmalig 97 €/Mon (oder eine der
 * Trial-Varianten), nicht 14,97 € + 49 € + 49 € + 27 €. Wer sie zu jedem
 * Einzeldepot dazuzaehlt, verfaelscht Member-Counts und MRR.
 *
 * Diese Regel gilt fuer:
 *   - Member-Counts pro Depot
 *   - Revenue pro Depot
 *   - Forecast pro Depot
 *
 * Die Regel gilt NICHT fuer:
 *   - Zugriffspruefung (`requireProductAccess`) — All-Access-Kunden duerfen
 *     natuerlich Starter/Trend/Stillhalter/Cockpit sehen.
 *   - Onboarding (sie machen die Tutorials fuer alle Depots).
 */

/**
 * Liefert den **einzigen** KPI-Bucket-Slug fuer eine Subscription.
 * Per Definition genau `sub.productSlug` — die Funktion existiert als
 * leichtgewichtiger Wrapper, damit zukuenftige Aggregations-Stellen klar
 * "ich nutze die KPI-Bucket-Regel" signalisieren und kein versehentliches
 * Multi-Counting einfuehren.
 */
export function getRevenueBucketSlug(sub: Pick<Subscription, "productSlug">): ProductSlug {
  return sub.productSlug;
}

export interface SlugBucket {
  count: number;
  revenue: number;
}

/**
 * Mappt einen `byProduct`-Aggregat (Ablefy-Product-IDs als Keys) auf einen
 * `bySlug`-Aggregat (TraderIQ-Slugs als Keys) — unter Berücksichtigung des
 * vom User gepflegten Mappings.
 *
 * Konkret: Die drei All-Access-Varianten (424736 ohne Test, 457085 3-Mon,
 * 465040 6-Mon) werden ALLE in den `all-access`-Bucket aggregiert. Damit
 * sieht das Kuchendiagramm „All Access Pass" als **einen** Slice, nicht
 * als drei separate Stuecke.
 *
 * Ablefy-IDs ohne Mapping-Eintrag landen in einem `unmapped`-Bucket
 * (Display-Konvention). Der Caller kann diesen Bucket optional ausblenden.
 */
export function aggregateAblefyByProductIntoSlug(
  byProduct: Record<string, SlugBucket> | undefined,
  mappings: AblefyProductMapping[],
): Record<string, SlugBucket> {
  const result: Record<string, SlugBucket> = {};
  if (!byProduct) return result;

  const idToSlug = new Map<string, ProductSlug>();
  for (const m of mappings) {
    idToSlug.set(m.ablefyProductId, m.traderiqProductSlug);
  }

  for (const [ablefyId, agg] of Object.entries(byProduct)) {
    const slug = idToSlug.get(ablefyId) ?? "unmapped";
    if (!result[slug]) result[slug] = { count: 0, revenue: 0 };
    result[slug].count += agg.count;
    result[slug].revenue += agg.revenue;
  }
  return result;
}

/**
 * Zaehlt Subscriptions pro Slug — KPI-Bucket-Regel: 1 Sub → 1 Slug, kein
 * Multi-Counting bei All-Access. Optional: nur Subs mit aktivem Status.
 */
export function countSubscriptionsBySlug(
  subs: Pick<Subscription, "productSlug" | "status">[],
  options: { activeOnly?: boolean } = {},
): Record<string, number> {
  const ACTIVE = new Set(["ACTIVE", "PAID"]);
  const out: Record<string, number> = {};
  for (const s of subs) {
    if (options.activeOnly && !ACTIVE.has(s.status)) continue;
    const slug = getRevenueBucketSlug(s);
    out[slug] = (out[slug] ?? 0) + 1;
  }
  return out;
}
