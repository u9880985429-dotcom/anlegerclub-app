"use client";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DynamicGrid } from "./DynamicGrid";
import type { WidgetData } from "./widgets/types";

type Aggregate = NonNullable<WidgetData["ablefyAggregate"]>;

/**
 * Client-Wrapper, der die vom Server berechneten Mock-Werte mit dem
 * im localStorage gespeicherten Ablefy-Aggregat zusammenfuehrt UND die
 * URL-Query-Params (product, preset, from, to) clientseitig auf das Aggregat
 * anwendet — sodass die Charts auf jede Filter-Aenderung reagieren ohne
 * dass ein neuer API-Call noetig ist.
 *
 * Phase 2: Server liefert das Aggregat schon vor-gefiltert via /api/v1/kpi/aggregate?product=...&from=...&to=...
 */
export function DynamicGridLoader({ baseData }: { baseData: Omit<WidgetData, "ablefyAggregate"> }) {
  const searchParams = useSearchParams();
  const [rawAggregate, setRawAggregate] = useState<Aggregate | null>(null);

  useEffect(() => {
    function load() {
      try {
        const cached = localStorage.getItem("traderiq:kpi:aggregate");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed?.aggregate) {
            setRawAggregate(parsed.aggregate);
            return;
          }
        }
      } catch {}
      setRawAggregate(null);
    }
    load();
    function onStorage(e: StorageEvent) {
      if (e.key === "traderiq:kpi:aggregate") load();
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const data = useMemo<WidgetData>(() => {
    const filters = {
      product: searchParams.get("product") ?? "all",
      preset: searchParams.get("preset") ?? "last_30_days",
      from: searchParams.get("from"),
      to: searchParams.get("to"),
    };
    const filtered = rawAggregate ? applyFilters(rawAggregate, filters) : null;
    return { ...baseData, ablefyAggregate: filtered };
  }, [rawAggregate, searchParams, baseData]);

  return <DynamicGrid data={data} />;
}

interface FilterParams {
  product: string;
  preset: string;
  from: string | null;
  to: string | null;
}

function applyFilters(agg: Aggregate, filters: FilterParams): Aggregate {
  let byProduct = agg.byProduct ? { ...agg.byProduct } : undefined;
  let byMonth = agg.byMonth ? { ...agg.byMonth } : undefined;

  // Product-Filter
  if (filters.product !== "all" && byProduct) {
    const entry = byProduct[filters.product];
    byProduct = entry ? { [filters.product]: entry } : {};
  }

  // Date-Range-Filter auf byMonth (Schluessel-Format: "YYYY-MM")
  if (byMonth) {
    const range = computeMonthRange(filters.preset, filters.from, filters.to);
    if (range.fromMonth || range.toMonth) {
      const filtered: typeof byMonth = {};
      for (const [key, value] of Object.entries(byMonth)) {
        if (
          (range.fromMonth ? key >= range.fromMonth : true) &&
          (range.toMonth ? key <= range.toMonth : true)
        ) {
          filtered[key] = value;
        }
      }
      byMonth = filtered;
    }
  }

  // Totals neu rechnen aus den gefilterten Subsets
  const monthValues = byMonth ? Object.values(byMonth) : [];
  const productValues = byProduct ? Object.values(byProduct) : [];
  const useMonthForTotals = monthValues.length > 0;
  const totalRevenue = useMonthForTotals
    ? monthValues.reduce((s, v) => s + v.revenue, 0)
    : productValues.reduce((s, v) => s + v.revenue, 0);
  const invoicesFetched = useMonthForTotals
    ? monthValues.reduce((s, v) => s + v.count, 0)
    : productValues.reduce((s, v) => s + v.count, 0);

  // Status-Counts proportional skalieren falls Product-Filter aktiv
  const ratio = agg.invoicesFetched > 0 ? invoicesFetched / agg.invoicesFetched : 1;
  return {
    invoicesFetched,
    paid: Math.round(agg.paid * ratio),
    open: Math.round(agg.open * ratio),
    cancelled: Math.round(agg.cancelled * ratio),
    refunded: Math.round(agg.refunded * ratio),
    totalRevenue,
    byProduct,
    byMonth,
  };
}

function computeMonthRange(preset: string, from: string | null, to: string | null): {
  fromMonth: string | null;
  toMonth: string | null;
} {
  const now = new Date();
  const ym = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  switch (preset) {
    case "today":
    case "last_7_days":
    case "this_month":
      return { fromMonth: ym(new Date(now.getFullYear(), now.getMonth(), 1)), toMonth: ym(now) };
    case "last_30_days":
      // ~ aktueller + Vormonat
      return { fromMonth: ym(new Date(now.getFullYear(), now.getMonth() - 1, 1)), toMonth: ym(now) };
    case "last_month": {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return { fromMonth: ym(lm), toMonth: ym(lm) };
    }
    case "this_quarter": {
      const q = Math.floor(now.getMonth() / 3);
      return { fromMonth: ym(new Date(now.getFullYear(), q * 3, 1)), toMonth: ym(now) };
    }
    case "ytd":
      return { fromMonth: `${now.getFullYear()}-01`, toMonth: ym(now) };
    case "custom":
      return {
        fromMonth: from ? from.slice(0, 7) : null,
        toMonth: to ? to.slice(0, 7) : null,
      };
    default:
      return { fromMonth: null, toMonth: null };
  }
}
