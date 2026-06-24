"use client";

import { useEffect, useState } from "react";
import { readAblefyConfig } from "@/lib/ablefy-config";

/**
 * Zeigt das Plan-Label aus dem Ablefy-Produkt-Mapping zur uebergebenen
 * Ablefy-Product-ID. Wird auf der User-Detail-Seite (und ggf. anderen
 * Backend-Listen) genutzt, damit Mitarbeiter / Admins sehen, *welche*
 * Variante z.B. des All Access Pass ein Mitglied gekauft hat.
 *
 * Phase 1: liest das Mapping aus localStorage. Phase 2: aus DB-Tabelle
 * `AblefyConfig.productMapping` (sobald Server-Side verfuegbar).
 */
export function AblefyPlanLabel({ ablefyProductId, className }: { ablefyProductId?: string | null; className?: string }) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    if (!ablefyProductId) {
      setLabel(null);
      return;
    }
    const cfg = readAblefyConfig();
    const hit = cfg.productMapping.find((m) => m.ablefyProductId === ablefyProductId);
    setLabel(hit?.planLabel ?? null);
  }, [ablefyProductId]);

  if (!ablefyProductId || !label) return null;

  return (
    <span className={className ?? "ml-2 inline-flex items-center rounded-md bg-brand/10 px-1.5 py-0.5 text-xs font-medium text-brand"}>
      {label}
    </span>
  );
}
