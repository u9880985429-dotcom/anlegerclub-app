"use client";

import { useEffect, useMemo, useState } from "react";
import { allSubscriptions } from "@traderiq/api";
import type { ProductSlug } from "@traderiq/api";
import { TrendingUp, Users } from "lucide-react";
import { readAblefyConfig } from "@/lib/ablefy-config";
import { findPricing, calculateExpectedRevenue, type PricingPlan } from "@/lib/copy/pricing";
import { PRODUCT_LABELS } from "@/lib/copy/login-status";
import { getRevenueBucketSlug } from "@/lib/kpi-bucket";

/**
 * Pricing-Uebersicht fuer Admins: zeigt pro Pricing-Plan, wie viele aktive
 * Mitglieder ihn nutzen + erwartete Einnahmen (12-Monats-Forecast).
 *
 * Datenquelle Phase 1: Mock-Subscriptions aus @traderiq/api + Plan-Label-
 * Lookup ueber das Browser-Mapping (localStorage). Phase 2: Postgres-Sub-
 * Tabelle + Mapping aus DB.
 *
 * Aktive Stati: ACTIVE + PAID (wir zaehlen nur zahlende Mitglieder als
 * laufende MRR-Quelle, nicht PAUSED/CANCELLED/EXPIRED/REFUNDED).
 */
const ACTIVE_STATUS = new Set(["ACTIVE", "PAID"]);

interface PlanRow {
  key: string;
  slug: ProductSlug;
  planLabel: string | null;
  pricing: PricingPlan;
  count: number;
  expected12mo: number;
}

export function PricingOverviewCard() {
  const [mounted, setMounted] = useState(false);
  const [planLabelByProductId, setPlanLabelByProductId] = useState<Record<string, string>>({});

  useEffect(() => {
    setMounted(true);
    const cfg = readAblefyConfig();
    const idx: Record<string, string> = {};
    for (const m of cfg.productMapping) {
      if (m.planLabel) idx[m.ablefyProductId] = m.planLabel;
    }
    setPlanLabelByProductId(idx);
  }, []);

  const rows: PlanRow[] = useMemo(() => {
    if (!mounted) return [];
    const buckets = new Map<string, PlanRow>();
    // KPI-Bucket-Regel (siehe lib/kpi-bucket.ts): Pro Sub gehoert genau ein
    // Slug — `getRevenueBucketSlug(s)` liefert ihn. All-Access-User landen im
    // `all-access`-Bucket, NICHT zusaetzlich in starter/trend/stillhalter/
    // cockpit. Wuerden wir hier per Access-Logik (`||"all-access"`) zaehlen,
    // wuerden 1 All-Access-Kunde 4x in der Tabelle erscheinen.
    for (const s of allSubscriptions) {
      if (!ACTIVE_STATUS.has(s.status)) continue;
      const slug = getRevenueBucketSlug(s);
      const planLabel = s.ablefyProductId ? planLabelByProductId[s.ablefyProductId] ?? null : null;
      const pricing = findPricing(slug, planLabel);
      if (!pricing) continue;
      const key = `${slug}::${planLabel ?? ""}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.count++;
        existing.expected12mo += calculateExpectedRevenue(pricing, 12);
      } else {
        buckets.set(key, {
          key,
          slug,
          planLabel,
          pricing,
          count: 1,
          expected12mo: calculateExpectedRevenue(pricing, 12),
        });
      }
    }
    return Array.from(buckets.values()).sort((a, b) => b.expected12mo - a.expected12mo);
  }, [mounted, planLabelByProductId]);

  const totalCount = rows.reduce((s, r) => s + r.count, 0);
  const totalExpected12mo = rows.reduce((s, r) => s + r.expected12mo, 0);

  if (!mounted) return null;

  return (
    <div className="card-base p-5">
      <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
        <TrendingUp className="h-4 w-4 text-brand" /> Pricing-Uebersicht (Forecast)
      </h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Auswertung der aktiven Subscriptions (Status ACTIVE/PAID) gruppiert nach Pricing-Plan.
        Erwartete 12-Monats-Einnahmen sind Standard-Listenpreise (vor MwSt.) und gelten als Vorhersage —
        die tatsaechlichen Einnahmen kommen aus den Ablefy-Webhooks und koennen abweichen.
      </p>

      {rows.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Noch keine aktiven Subscriptions mit zugeordnetem Pricing-Plan.
          Pflege das Produkt-Mapping oben und stelle sicher, dass Subscriptions ein <code className="font-mono">ablefyProductId</code> haben.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-3 py-2">Depot · Variante</th>
                  <th className="px-3 py-2 text-right">Mitglieder</th>
                  <th className="px-3 py-2">Standard-Preis</th>
                  <th className="px-3 py-2 text-right">Erwartet 12 Mon.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td className="px-3 py-2">
                      <div className="font-medium">{PRODUCT_LABELS[r.slug] ?? r.slug}</div>
                      {r.planLabel && (
                        <div className="text-[10px] text-muted-foreground">{r.planLabel}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" /> {r.count}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-muted-foreground">{r.pricing.description}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {r.expected12mo.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted/20">
                <tr>
                  <td className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Summe</td>
                  <td className="px-3 py-2 text-right font-mono font-semibold">{totalCount}</td>
                  <td />
                  <td className="px-3 py-2 text-right font-mono font-semibold text-profit">
                    {totalExpected12mo.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Hinweis: Trial-Phasen werden korrekt eingerechnet. Beispiel „6 Mon. Testzeitraum": 1 € einmalig + 6 × 97 € (Monate 7–12) = 583 € pro Mitglied.
          </p>
        </>
      )}
    </div>
  );
}
