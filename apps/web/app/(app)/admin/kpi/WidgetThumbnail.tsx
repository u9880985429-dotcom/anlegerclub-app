"use client";
import type { WidgetCatalogEntry, WidgetData } from "./widgets/types";

/**
 * Thumbnail-Renderer fuer Widget-Gallery / Swap-Modal.
 *
 * Rendert das echte Widget mit Demo-Daten skaliert in einem festen Container.
 * pointer-events: none auf dem Wrapper, damit interne Widget-Interaktionen
 * (Buttons, Menues) nicht in der Vorschau ausgeloest werden.
 */

const DEMO_DATA: WidgetData = {
  ablefyAggregate: {
    invoicesFetched: 142,
    paid: 121,
    open: 11,
    cancelled: 7,
    refunded: 3,
    totalRevenue: 12480,
    byProduct: {
      starter: { count: 28, revenue: 1820 },
      trend: { count: 34, revenue: 2840 },
      stillhalter: { count: 21, revenue: 2210 },
      cockpit: { count: 9, revenue: 890 },
      "all-access": { count: 17, revenue: 3380 },
    },
    byMonth: {
      "2025-09": { count: 12, revenue: 1450 },
      "2025-10": { count: 14, revenue: 1620 },
      "2025-11": { count: 16, revenue: 1810 },
      "2025-12": { count: 18, revenue: 2050 },
      "2026-01": { count: 17, revenue: 2210 },
      "2026-02": { count: 20, revenue: 2470 },
      "2026-03": { count: 22, revenue: 2680 },
      "2026-04": { count: 23, revenue: 2980 },
    },
  },
  activeMembers: 121,
  pausedMembers: 4,
  expiredMembers: 8,
  totalUsers: 158,
  avgArpu: 89,
  newMembersThisMonth: 14,
  churnedMembersThisMonth: 3,
};

const SCALE = 0.55;
const SCALE_INVERSE = `${(100 / SCALE).toFixed(1)}%`; // ≈ 182%

export function WidgetThumbnail({ entry }: { entry: WidgetCatalogEntry }) {
  return (
    <div className="relative h-44 w-full overflow-hidden border-b border-border bg-background pointer-events-none select-none">
      <div
        style={{
          width: SCALE_INVERSE,
          height: SCALE_INVERSE,
          transform: `scale(${SCALE})`,
          transformOrigin: "top left",
        }}
      >
        {entry.render(DEMO_DATA)}
      </div>
    </div>
  );
}
