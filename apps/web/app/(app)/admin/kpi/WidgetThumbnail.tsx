"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { WidgetCatalogEntry, WidgetData } from "./widgets/types";
import { WidgetErrorBoundary } from "./WidgetErrorBoundary";

/**
 * Thumbnail-Renderer fuer Widget-Gallery / Swap-Modal.
 *
 * Rendert das echte Widget mit Demo-Daten skaliert in einem festen Container.
 *
 * WICHTIG (Performance): Die Vorschau wird LAZY gerendert — erst wenn die Karte
 * in (Naehe der) Sichtweite scrollt. Sonst wuerden in der "Alle"-Ansicht ~57
 * vollwertige Charts GLEICHZEITIG gerendert, was das Rendering blockiert und die
 * Karten leer/"geschrumpft" erscheinen laesst. Bis zur Sichtbarkeit zeigt ein
 * leichtes Skelett. Titel/Beschreibung der Karte liegen ausserhalb und sind
 * immer sofort lesbar. Eine Error-Boundary kapselt jede Vorschau einzeln.
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
const BOX_H = 176; // = h-44 (11rem). Feste Hoehe der Vorschau-Box.
const SCALE_INVERSE = `${(100 / SCALE).toFixed(1)}%`; // Breite: ≈ 182% (definit via w-full)
// Hoehe als FESTE px (nicht %!) — eine prozentuale Hoehe haengt von einer
// definiten Elternhoehe ab und kollabiert sonst im Grid auf 0 (zyklisch).
const INNER_H = `${Math.round(BOX_H / SCALE)}px`; // 176 / 0.55 ≈ 320px -> scale(0.55) = 176px sichtbar

export function WidgetThumbnail({
  entry,
  scrollRoot,
}: {
  entry: WidgetCatalogEntry;
  scrollRoot?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setShow(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setShow(true);
            io.disconnect();
            break;
          }
        }
      },
      { root: scrollRoot?.current ?? null, rootMargin: "300px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [scrollRoot]);

  return (
    <div
      ref={ref}
      style={{ height: "11rem" }}
      className="pointer-events-none relative h-44 w-full shrink-0 select-none overflow-hidden border-b border-border bg-background"
    >
      {show ? (
        <div
          style={{
            width: SCALE_INVERSE,
            height: INNER_H,
            transform: `scale(${SCALE})`,
            transformOrigin: "top left",
          }}
        >
          <WidgetErrorBoundary widgetId={entry.id}>{entry.render(DEMO_DATA)}</WidgetErrorBoundary>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/10">
          <div className="h-16 w-28 animate-pulse rounded-md bg-muted" />
        </div>
      )}
    </div>
  );
}
