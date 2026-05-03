"use client";

import { useEffect, useState } from "react";
import { readAblefyConfig } from "@/lib/ablefy-config";
import { findPricing } from "@/lib/copy/pricing";
import type { ProductSlug } from "@traderiq/api";

/**
 * Zeigt den Standard-Listenpreis einer Subscription als kurzer Hinweis im
 * Backend (User-Detail). Liest das Plan-Label aus dem Browser-Mapping
 * (localStorage), schaut dann den passenden Pricing-Plan aus
 * `lib/copy/pricing.ts` nach und rendert die Beschreibung.
 *
 * Phase 2: Pricing-Plaene sollen aus DB gelesen werden, sobald Ablefy-
 * Pricing-Plans regelmaessig synchronisiert werden.
 */
export function AblefyPricingHint({
  productSlug,
  ablefyProductId,
}: {
  productSlug: ProductSlug;
  ablefyProductId?: string | null;
}) {
  const [planLabel, setPlanLabel] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!ablefyProductId) {
      setPlanLabel(null);
      return;
    }
    const cfg = readAblefyConfig();
    const hit = cfg.productMapping.find((m) => m.ablefyProductId === ablefyProductId);
    setPlanLabel(hit?.planLabel ?? null);
  }, [ablefyProductId]);

  if (!mounted) return null;
  const pricing = findPricing(productSlug, planLabel);
  if (!pricing) return null;

  return (
    <span className="text-xs text-muted-foreground">
      Standard-Preis: <span className="font-medium text-foreground/70">{pricing.description}</span>
    </span>
  );
}
