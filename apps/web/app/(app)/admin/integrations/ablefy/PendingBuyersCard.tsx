"use client";

import { useEffect, useState } from "react";
import { Mail, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
import { readAblefyConfig } from "@/lib/ablefy-config";
import { findPricing, type PricingPlan } from "@/lib/copy/pricing";
import { PRODUCT_LABELS } from "@/lib/copy/login-status";
import type { ProductSlug } from "@traderiq/api";

interface PendingBuyer {
  id: string;
  ts: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  orderId: string | null;
  paymentId: string | null;
  productId: string | null;
  triggerEvent: string;
  amount: number | null;
  status: "new" | "linked" | "ignored";
}

export function PendingBuyersCard() {
  const [buyers, setBuyers] = useState<PendingBuyer[]>([]);
  const [productMap, setProductMap] = useState<Record<string, { slug: ProductSlug; planLabel?: string }>>({});

  async function fetchBuyers() {
    try {
      const res = await fetch("/api/v1/ablefy/pending-buyers?limit=30");
      const json = await res.json();
      if (json.ok) setBuyers(json.buyers as PendingBuyer[]);
    } catch {}
  }

  useEffect(() => {
    const cfg = readAblefyConfig();
    const map: Record<string, { slug: ProductSlug; planLabel?: string }> = {};
    for (const m of cfg.productMapping) {
      map[m.ablefyProductId] = { slug: m.traderiqProductSlug, planLabel: m.planLabel };
    }
    setProductMap(map);
    fetchBuyers();
    const id = setInterval(fetchBuyers, 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="card-base p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
          <ShoppingBag className="h-4 w-4 text-brand" /> Pending Buyers (Live)
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{buyers.length}</span>
        </h3>
        <button onClick={fetchBuyers} className="btn-ghost inline-flex items-center gap-1 text-xs">
          <RefreshCw className="h-3 w-3" /> Aktualisieren
        </button>
      </div>
      <p className="mb-3 text-xs text-muted-foreground">
        Kunden, die ueber einen Ablefy-Webhook gekauft haben und in unserer App
        noch keinen User-Account besitzen. Phase 2: hier wird automatisch ein
        Mitgliedskonto inkl. Onboarding-Mail erzeugt.
      </p>

      {buyers.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Noch keine Pending Buyers. Sobald ein „Abo aktiv" / „Zahlung erfolgreich"-Webhook reinkommt, taucht der Kunde hier auf.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2">Zeit</th>
                <th className="px-3 py-2">Kunde</th>
                <th className="px-3 py-2">Produkt</th>
                <th className="px-3 py-2">Trigger-Event</th>
                <th className="px-3 py-2 text-right">Betrag</th>
                <th className="px-3 py-2 text-right">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {buyers.map((b) => {
                const productInfo = b.productId ? productMap[b.productId] : null;
                const pricing: PricingPlan | null = productInfo
                  ? findPricing(productInfo.slug, productInfo.planLabel)
                  : null;
                const productDisplay = productInfo
                  ? `${PRODUCT_LABELS[productInfo.slug] ?? productInfo.slug}${productInfo.planLabel ? ` · ${productInfo.planLabel}` : ""}`
                  : b.productId
                    ? `Product-ID ${b.productId}`
                    : "—";
                return (
                  <tr key={b.id}>
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                      {new Date(b.ts).toLocaleString("de-DE", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                    <td className="px-3 py-2">
                      {b.email ? (
                        <span className="inline-flex items-center gap-1 font-medium">
                          <Mail className="h-3 w-3 text-muted-foreground" /> {b.email}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">— (keine E-Mail im Payload)</span>
                      )}
                      {(b.firstName || b.lastName) && (
                        <div className="text-xs text-muted-foreground">
                          {[b.firstName, b.lastName].filter(Boolean).join(" ")}
                        </div>
                      )}
                      {b.orderId && (
                        <div className="text-xs text-muted-foreground">
                          Order: <span className="font-mono">{b.orderId}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium">{productDisplay}</div>
                      {pricing && (
                        <div className="text-xs text-muted-foreground">{pricing.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{b.triggerEvent}</td>
                    <td className="px-3 py-2 text-right font-mono">
                      {b.amount !== null
                        ? `${b.amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`
                        : "—"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        disabled
                        title="Phase 2: legt automatisch User-Account + sendet Onboarding-Mail."
                        className="btn-ghost inline-flex items-center gap-1 text-xs opacity-60"
                      >
                        <Sparkles className="h-3 w-3" /> Account anlegen
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
