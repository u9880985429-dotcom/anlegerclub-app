"use client";
import { useEffect, useState } from "react";
import { DynamicGrid } from "./DynamicGrid";
import type { WidgetData } from "./widgets/types";

/**
 * Client-Wrapper, der die vom Server berechneten Mock-Werte mit dem
 * im localStorage gespeicherten Ablefy-Aggregat zusammenfuehrt — sodass
 * Widgets entweder Demo- oder Live-Daten anzeigen, je nachdem was vorliegt.
 */
export function DynamicGridLoader({ baseData }: { baseData: Omit<WidgetData, "ablefyAggregate"> }) {
  const [data, setData] = useState<WidgetData>({ ...baseData, ablefyAggregate: null });

  useEffect(() => {
    function load() {
      try {
        const cached = localStorage.getItem("traderiq:kpi:aggregate");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.aggregate) {
            setData({ ...baseData, ablefyAggregate: parsed.aggregate });
            return;
          }
        }
      } catch {}
      setData({ ...baseData, ablefyAggregate: null });
    }
    load();
    function onStorage(e: StorageEvent) {
      if (e.key === "traderiq:kpi:aggregate") load();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <DynamicGrid data={data} />;
}
