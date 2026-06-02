import { readAblefyConfig } from "@/lib/ablefy-config";
import { aggregateAblefyByProductIntoSlug } from "@/modules/kpi";

export const PRODUCT_COLORS: Record<string, string> = {
  starter: "#ff741f",
  trend: "#0ea5e9",
  stillhalter: "#10b981",
  cockpit: "#f59e0b",
  "all-access": "#8b5cf6",
};
export const PRODUCT_LABEL: Record<string, string> = {
  starter: "Starter",
  trend: "Trend",
  stillhalter: "Stillhalter",
  cockpit: "Cockpit",
  "all-access": "All Access Pass",
};

/**
 * Mappt das `byProduct`-Aggregat (Keys = Ablefy-Product-IDs) auf Slugs.
 * KPI-Bucket-Regel: alle drei All-Access-Varianten (424736 / 457085 /
 * 465040) landen im einen `all-access`-Bucket. Sonst wuerde unser
 * Kuchendiagramm die Test-Variante als separates Stueck zeigen — das
 * verfaelscht die Wahrnehmung der Member- und Revenue-Verteilung.
 *
 * Erwartet das Mapping aus `readAblefyConfig().productMapping`. Wenn der
 * User noch kein Mapping gepflegt hat, landet alles im `unmapped`-Bucket
 * und wir lassen das Widget auf seinen Mock-Fallback zurueckfallen.
 */
export function bucketizedByProductFromBrowser(
  byProduct: Record<string, { count: number; revenue: number }> | undefined,
): Record<string, { count: number; revenue: number }> | undefined {
  if (!byProduct || Object.keys(byProduct).length === 0) return byProduct;
  const cfg = typeof window !== "undefined" ? readAblefyConfig() : null;
  const mappings = cfg?.productMapping ?? [];
  const bucketed = aggregateAblefyByProductIntoSlug(byProduct, mappings);
  // Wenn alles in `unmapped` gelandet ist, hat der User noch kein Mapping
  // gepflegt — gib Original zurueck damit das Widget auf den Mock-Fallback
  // schalten kann (ueber `Object.keys(...).length === 0` ist nicht der Fall,
  // aber wir wollen rohe IDs nicht als Achsen-Labels zeigen).
  if (Object.keys(bucketed).length === 1 && bucketed.unmapped) return undefined;
  return bucketed;
}
