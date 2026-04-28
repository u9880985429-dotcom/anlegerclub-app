"use client";
import type { WidgetCatalogEntry, WidgetData } from "./widgets/types";

/**
 * Thumbnail-Renderer fuer die Widget-Gallery / Swap-Modal.
 *
 * Rendert das echte Widget mit Demo-Daten in einem kleinen Container
 * (Maus/Klicks gehen nicht durch — pointer-events:none).
 * Per CSS-Scale auf ca. 0.42 verkleinert, damit Kacheln gut nebeneinander passen.
 */

const DEMO_DATA: WidgetData = {
  ablefyAggregate: null,
  activeMembers: 121,
  pausedMembers: 4,
  expiredMembers: 8,
  totalUsers: 158,
  avgArpu: 89,
  newMembersThisMonth: 14,
  churnedMembersThisMonth: 3,
};

export function WidgetThumbnail({ entry }: { entry: WidgetCatalogEntry }) {
  return (
    <div className="relative h-32 w-full overflow-hidden rounded-md border border-border bg-muted/20">
      {/* Skalierter Live-Render des Widgets */}
      <div
        className="pointer-events-none absolute left-0 top-0"
        style={{
          width: "240%",
          height: "240%",
          transform: "scale(0.42)",
          transformOrigin: "top left",
        }}
      >
        {entry.render(DEMO_DATA)}
      </div>
      {/* Klick-Sperre ueberlagert das Widget komplett, blockiert seine internen Interaktionen */}
      <div className="absolute inset-0" />
    </div>
  );
}
