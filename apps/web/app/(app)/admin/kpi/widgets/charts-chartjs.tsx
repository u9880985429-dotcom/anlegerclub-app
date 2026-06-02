"use client";
/**
 * KPI-Charts auf Basis von Chart.js (react-chartjs-2) — ZUSAETZLICH zu den
 * bestehenden handgemachten SVG-Charts. Erste Probe, ob Chart.js fuer die
 * Standard-Diagramme passt (Tooltips/Legende/Animation kommen "frei Haus").
 *
 * Chart.js ist canvas-basiert und rein clientseitig -> 'use client' und
 * Auto-Registrierung via 'chart.js/auto'. Der feste Hoehen-Wrapper (relative
 * h-56) gibt dem Canvas eine definierte Box (sonst kann es bei
 * maintainAspectRatio:false unkontrolliert wachsen).
 */
import "chart.js/auto";
import { Line, Doughnut } from "react-chartjs-2";
import type { WidgetData } from "./types";
import { PRODUCT_COLORS, PRODUCT_LABEL, bucketizedByProductFromBrowser } from "./_chart-utils";

const euro = (n: number) => `${n.toLocaleString("de-DE")} €`;

export function RevenueLineChartJs({ data }: { data: WidgetData }) {
  const byMonth = data.ablefyAggregate?.byMonth;
  const series = byMonth
    ? Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => ({ label: k, value: v.revenue }))
    : [];
  // Fallback-Demo, falls (noch) keine echten Monatsdaten vorliegen.
  const labels = series.length ? series.map((s) => s.label) : ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun"];
  const values = series.length ? series.map((s) => s.value) : [4200, 5100, 4800, 6300, 7100, 8200];

  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Umsatz-Verlauf (Chart.js)
      </h3>
      <div className="relative h-56">
        <Line
          data={{
            labels,
            datasets: [
              {
                label: "Umsatz",
                data: values,
                borderColor: "#16a34a",
                backgroundColor: "rgba(22,163,74,0.15)",
                fill: true,
                tension: 0.35,
                pointRadius: 2,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => euro(Number(ctx.parsed.y)) } },
            },
            scales: { y: { ticks: { callback: (v) => euro(Number(v)) } } },
          }}
        />
      </div>
    </div>
  );
}

export function ProductMixDoughnutChartJs({ data }: { data: WidgetData }) {
  const fromAblefy = bucketizedByProductFromBrowser(data.ablefyAggregate?.byProduct);
  let entries: { label: string; value: number; color: string }[];
  if (fromAblefy && Object.keys(fromAblefy).length > 0) {
    entries = Object.entries(fromAblefy).map(([k, v]) => ({
      label: PRODUCT_LABEL[k] ?? `Produkt ${k}`,
      value: v.count,
      color: PRODUCT_COLORS[k] ?? "#94a3b8",
    }));
  } else {
    entries = [
      { label: "Starter", value: 28, color: PRODUCT_COLORS.starter! },
      { label: "Trend", value: 34, color: PRODUCT_COLORS.trend! },
      { label: "Stillhalter", value: 21, color: PRODUCT_COLORS.stillhalter! },
      { label: "Cockpit", value: 9, color: PRODUCT_COLORS.cockpit! },
      { label: "All-Access", value: 17, color: PRODUCT_COLORS["all-access"]! },
    ];
  }

  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Produkt-Mix (Chart.js)
      </h3>
      <div className="relative h-56">
        <Doughnut
          data={{
            labels: entries.map((e) => e.label),
            datasets: [
              {
                data: entries.map((e) => e.value),
                backgroundColor: entries.map((e) => e.color),
                borderWidth: 0,
              },
            ],
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "62%",
            plugins: { legend: { position: "bottom" } },
          }}
        />
      </div>
    </div>
  );
}
