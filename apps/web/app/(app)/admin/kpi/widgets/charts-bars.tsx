"use client";
import { BarChart3, Layers } from "lucide-react";
import type { WidgetData } from "./types";
import { bucketizedByProductFromBrowser } from "./_chart-utils";

/**
 * Vertikale Bar-Chart (KPI-Trend pro Monat).
 * Inspiriert vom „KPI trends" im Analytics-Dashboard.
 */
export function VerticalBarChart({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.entries(data.ablefyAggregate.byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([k, v]) => ({ label: k.slice(5), value: v.count }))
    : [
        { label: "Jan", value: 4800 }, { label: "Feb", value: 3200 }, { label: "Mär", value: 3500 }, { label: "Apr", value: 2900 },
        { label: "Mai", value: 4600 }, { label: "Jun", value: 3500 }, { label: "Jul", value: 1900 }, { label: "Aug", value: 2700 },
        { label: "Sep", value: 3500 }, { label: "Okt", value: 4500 }, { label: "Nov", value: 2400 }, { label: "Dez", value: 3800 },
      ];
  const max = Math.max(...series.map((s) => s.value));
  const w = 600;
  const h = 240;
  const padX = 30;
  const padY = 20;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const barWidth = innerW / series.length - 4;

  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" /> Aktivitaet pro Monat
        </h3>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        {series.map((s, i) => {
          const x = padX + i * (innerW / series.length) + 2;
          const barH = (s.value / max) * innerH;
          const y = padY + innerH - barH;
          return (
            <g key={i}>
              <rect x={x} y={y} width={barWidth} height={barH} rx="3" fill="#7c3aed" />
              <text x={x + barWidth / 2} y={h - 4} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Horizontale Bar-Chart (Engagement / Channel).
 * Inspiriert von „Engagement per channel" im Analytics-Dashboard.
 */
export function HorizontalBarsChart({ data }: { data: WidgetData }) {
  const _data = data; // bind data to silence lint when unused
  void _data;
  const rows = [
    { label: "Direct", now: 28000, prev: 22000 },
    { label: "Organic", now: 23000, prev: 20000 },
    { label: "Referral", now: 22000, prev: 18500 },
    { label: "Paid", now: 8700, prev: 9100 },
    { label: "E-Mail", now: 14200, prev: 12800 },
  ];
  const max = Math.max(...rows.flatMap((r) => [r.now, r.prev]));
  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <BarChart3 className="h-3.5 w-3.5" /> Reichweite je Kanal
        </h3>
      </div>
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">{r.label}</span>
              <span className="font-mono text-muted-foreground">
                <span className="text-foreground">{r.now.toLocaleString("de-DE")}</span>{" "}
                <span className="text-xs">vs {r.prev.toLocaleString("de-DE")}</span>
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-2.5 w-full overflow-hidden rounded-md bg-muted">
                <div className="h-full rounded-md bg-brand" style={{ width: `${(r.now / max) * 100}%` }} />
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-md bg-muted">
                <div className="h-full rounded-md bg-brand/40" style={{ width: `${(r.prev / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-brand" /> Aktueller Zeitraum</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-brand/40" /> Vergleichszeitraum</span>
      </div>
    </div>
  );
}

/**
 * Grouped Bar Chart (Now vs Previous, monatlich).
 * Inspiriert vom „Revenue trends" im Analytics-Dashboard.
 */
export function GroupedBarChart({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const series = [
    { label: "Jan", now: 4800, prev: 4200 }, { label: "Feb", now: 4100, prev: 3500 },
    { label: "Mär", now: 4500, prev: 3800 }, { label: "Apr", now: 4200, prev: 4400 },
    { label: "Mai", now: 3800, prev: 3500 }, { label: "Jun", now: 4500, prev: 4000 },
    { label: "Jul", now: 4900, prev: 4100 }, { label: "Aug", now: 3800, prev: 4000 },
  ];
  const max = Math.max(...series.flatMap((s) => [s.now, s.prev]));
  const w = 600;
  const h = 220;
  const padX = 30;
  const padY = 20;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const groupW = innerW / series.length;
  const barW = groupW / 2.5;

  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <Layers className="h-3.5 w-3.5" /> Revenue · jetzt vs. Vergleich
        </h3>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        {series.map((s, i) => {
          const xBase = padX + i * groupW + groupW / 2;
          const nowH = (s.now / max) * innerH;
          const prevH = (s.prev / max) * innerH;
          return (
            <g key={i}>
              <rect x={xBase - barW - 1} y={padY + innerH - nowH} width={barW} height={nowH} rx="2" fill="#7c3aed" />
              <rect x={xBase + 1} y={padY + innerH - prevH} width={barW} height={prevH} rx="2" fill="#c4b5fd" />
              <text x={xBase} y={h - 4} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "#7c3aed" }} /> Jetzt</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "#c4b5fd" }} /> Vorperiode</span>
      </div>
    </div>
  );
}

/**
 * Year-over-Year-Compare-Bars.
 * Inspiriert vom Yellowfin „Sales YTD 2018 vs 2019".
 */
export function YoYCompareBars({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  // Phase 2: aus Ablefy-byMonth aktuelles + Vorjahres-Fenster ableiten.
  const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const current = [4800, 5100, 5400, 5800, 6100, 6300, 6700, 7100, 7600, 8100, 8500, 9000];
  const prior = [3900, 4200, 4500, 4700, 5000, 5200, 5500, 5800, 6100, 6500, 6800, 7100];
  const max = Math.max(...current, ...prior);
  const w = 600;
  const h = 240;
  const padX = 30;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const groupW = innerW / months.length;
  const barW = groupW / 2.6;

  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Umsatz · Year-over-Year
      </h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        {months.map((m, i) => {
          const xBase = padX + i * groupW + groupW / 2;
          const curH = (current[i]! / max) * innerH;
          const prevH = (prior[i]! / max) * innerH;
          return (
            <g key={m}>
              <rect x={xBase - barW - 1} y={padY + innerH - prevH} width={barW} height={prevH} rx="2" fill="#cbd5e1" />
              <rect x={xBase + 1} y={padY + innerH - curH} width={barW} height={curH} rx="2" fill="#0ea5e9" />
              <text x={xBase} y={h - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{m}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#cbd5e1]" /> Vorjahr</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#0ea5e9]" /> Aktuell</span>
        <span className="ml-auto font-mono">YoY: <strong className="text-profit">+{(((current.reduce((s, v) => s + v, 0) / prior.reduce((s, v) => s + v, 0)) - 1) * 100).toFixed(1).replace(".", ",")} %</strong></span>
      </div>
    </div>
  );
}

/**
 * Top-N-Bars (Top-3 / Top-5 horizontal mit %-Labels).
 * Inspiriert von Geschaefts-KPI „Top 3 by conversion".
 */
export function TopProductBars({ data }: { data: WidgetData }) {
  const PRODUCT_LABEL_LOCAL: Record<string, string> = {
    starter: "Starter",
    trend: "Trend",
    stillhalter: "Stillhalter",
    cockpit: "Cockpit",
    "all-access": "All Access Pass",
  };
  const fromAblefy = bucketizedByProductFromBrowser(data.ablefyAggregate?.byProduct);
  let rows: { label: string; value: number }[];
  if (fromAblefy && Object.keys(fromAblefy).length > 0) {
    rows = Object.entries(fromAblefy)
      .map(([k, v]) => ({ label: PRODUCT_LABEL_LOCAL[k] ?? `Produkt ${k}`, value: v.revenue }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  } else {
    rows = [
      { label: "All-Access", value: 33800 },
      { label: "Trend", value: 28400 },
      { label: "Stillhalter", value: 22100 },
      { label: "Starter", value: 18200 },
      { label: "Cockpit", value: 8900 },
    ];
  }
  const max = rows[0]?.value ?? 1;
  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Top {rows.length} Produkte nach Umsatz
      </h3>
      <div className="space-y-2">
        {rows.map((r, i) => {
          const pct = (r.value / max) * 100;
          return (
            <div key={r.label} className="flex items-center gap-3">
              <span className="w-6 flex-shrink-0 text-center font-mono text-xs text-muted-foreground">{i + 1}</span>
              <span className="w-24 flex-shrink-0 text-xs font-medium">{r.label}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-md bg-muted">
                <div className="h-full rounded-md bg-gradient-to-r from-brand to-brand/70" style={{ width: `${pct}%` }} />
              </div>
              <span className="w-20 flex-shrink-0 text-right font-mono text-xs">
                {r.value >= 1000 ? `${(r.value / 1000).toFixed(1)}k €` : `${r.value.toFixed(0)} €`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Stacked-Vertical-Bars (Multi-Layer-Bars pro Monat).
 * Inspiriert von Bild 8 (Mehrfarben-Stack pro Monat).
 */
export function StackedVerticalBarsChart({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const months = ["Mai", "Jun", "Jul", "Aug", "Sep", "Okt"];
  const seriesData = [
    { paid: 4.2, refunded: 0.8, open: 1.2 },
    { paid: 3.5, refunded: 0.5, open: 2.0 },
    { paid: 4.8, refunded: 1.0, open: 1.5 },
    { paid: 4.2, refunded: 0.6, open: 2.3 },
    { paid: 5.0, refunded: 0.9, open: 1.7 },
    { paid: 5.7, refunded: 1.1, open: 2.0 },
  ];
  const colors = { paid: "#7c3aed", refunded: "#fbbf24", open: "#10b981" };
  const max = Math.max(...seriesData.map((s) => s.paid + s.refunded + s.open));
  const w = 600;
  const h = 240;
  const padX = 30;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const barWidth = innerW / months.length - 6;
  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Subscription-Status · Stacked Monatlich
      </h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        {seriesData.map((s, i) => {
          const x = padX + i * (innerW / months.length) + 3;
          const totalH = ((s.paid + s.refunded + s.open) / max) * innerH;
          const paidH = (s.paid / max) * innerH;
          const refundH = (s.refunded / max) * innerH;
          const openH = (s.open / max) * innerH;
          let yOffset = padY + innerH;
          return (
            <g key={i}>
              <rect x={x} y={yOffset - paidH} width={barWidth} height={paidH} fill={colors.paid} rx="2" />
              <rect x={x} y={yOffset - paidH - refundH} width={barWidth} height={refundH} fill={colors.refunded} />
              <rect x={x} y={yOffset - totalH} width={barWidth} height={openH} fill={colors.open} rx="2" />
              <text x={x + barWidth / 2} y={padY + innerH - totalH - 4} textAnchor="middle" className="fill-foreground" fontSize="9" fontWeight="600">
                {(s.paid + s.refunded + s.open).toFixed(1)}
              </text>
              <text x={x + barWidth / 2} y={h - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
                {months[i]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.paid }} /> Paid</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.refunded }} /> Refunded</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.open }} /> Open</span>
      </div>
    </div>
  );
}

/**
 * Stacked-Horizontal-Bars (Multi-Layer-Bars pro Zeile, eine je Produkt).
 * Inspiriert von Bild 9 (mehrere Werte pro Zeile uebereinander).
 */
export function StackedHorizontalBarsChart({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const products = [
    { name: "Starter", paid: 28, refund: 2, open: 5 },
    { name: "Trend", paid: 34, refund: 1, open: 8 },
    { name: "Stillhalter", paid: 21, refund: 1, open: 3 },
    { name: "Cockpit", paid: 9, refund: 0, open: 2 },
    { name: "All-Access", paid: 17, refund: 1, open: 4 },
  ];
  const max = Math.max(...products.map((p) => p.paid + p.refund + p.open));
  const colors = { paid: "#7c3aed", refund: "#fbbf24", open: "#10b981" };
  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Subscriptions je Produkt · Status-Stack
      </h3>
      <div className="space-y-2">
        {products.map((p) => {
          const total = p.paid + p.refund + p.open;
          const paidPct = (p.paid / max) * 100;
          const refundPct = (p.refund / max) * 100;
          const openPct = (p.open / max) * 100;
          return (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-24 flex-shrink-0 text-xs font-medium">{p.name}</span>
              <div className="flex h-5 flex-1 overflow-hidden rounded-md bg-muted">
                <div className="h-full" style={{ width: `${paidPct}%`, background: colors.paid }} />
                <div className="h-full" style={{ width: `${refundPct}%`, background: colors.refund }} />
                <div className="h-full" style={{ width: `${openPct}%`, background: colors.open }} />
              </div>
              <span className="w-12 flex-shrink-0 text-right font-mono text-xs">{total}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.paid }} /> Aktiv (Paid)</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.refund }} /> Refunded</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.open }} /> Offen</span>
      </div>
    </div>
  );
}

/**
 * Waterfall-Chart — Revenue-Bewegungen mit positiven + negativen Werten.
 * Inspiriert von Bild 2 (Power BI Waterfall im DestinAir-Dashboard).
 */
export function WaterfallChart({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const steps = [
    { label: "Start", value: 8000, type: "total" as const },
    { label: "Neue Subs", value: 2400, type: "positive" as const },
    { label: "Renewals", value: 1800, type: "positive" as const },
    { label: "Churn", value: -900, type: "negative" as const },
    { label: "Refunds", value: -600, type: "negative" as const },
    { label: "Ende", value: 10700, type: "total" as const },
  ];
  // Berechne Stack-Positionen
  let running = 0;
  const computed = steps.map((s) => {
    if (s.type === "total") {
      const start = 0;
      const end = s.value;
      running = end;
      return { ...s, start, end };
    }
    const start = running;
    const end = running + s.value;
    running = end;
    return { ...s, start, end };
  });
  const max = Math.max(...computed.flatMap((s) => [s.start, s.end])) * 1.1;
  const w = 600;
  const h = 260;
  const padX = 36;
  const padY = 30;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const groupW = innerW / steps.length;
  const barW = groupW * 0.6;
  const colorMap = { total: "#475569", positive: "#10b981", negative: "#ef4444" };

  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        MRR-Bewegungen · Waterfall
      </h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        {computed.map((s, i) => {
          const x = padX + i * groupW + (groupW - barW) / 2;
          const top = padY + innerH - (Math.max(s.start, s.end) / max) * innerH;
          const barH = (Math.abs(s.end - s.start) / max) * innerH || 4;
          return (
            <g key={i}>
              <rect x={x} y={top} width={barW} height={barH} fill={colorMap[s.type]} rx="3" />
              <text
                x={x + barW / 2}
                y={top - 5}
                textAnchor="middle"
                className="fill-foreground"
                fontSize="9"
                fontWeight="600"
              >
                {s.value > 0 && s.type !== "total" ? "+" : ""}
                {s.value >= 1000 || s.value <= -1000 ? `${(s.value / 1000).toFixed(1)}k` : s.value}
              </text>
              <text
                x={x + barW / 2}
                y={h - 6}
                textAnchor="middle"
                className="fill-muted-foreground"
                fontSize="9"
              >
                {s.label}
              </text>
              {/* Verbindungslinie zum naechsten Bar */}
              {i < computed.length - 1 && (
                <line
                  x1={x + barW}
                  y1={padY + innerH - (s.end / max) * innerH}
                  x2={x + groupW + (groupW - barW) / 2}
                  y2={padY + innerH - (s.end / max) * innerH}
                  stroke="currentColor"
                  strokeOpacity="0.3"
                  strokeDasharray="2 2"
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Histogram-Chart — viele duenne Bars dicht nebeneinander, einer hervorgehoben.
 * Inspiriert von Highway Monitoring Dark-Theme + Bild 5 Histogram.
 */
export function HistogramChart({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const days = Array.from({ length: 30 }, (_, i) => {
    const seed = (i * 31 + 7) % 100;
    return 8 + Math.round(seed / 4) + (i === 21 ? 12 : 0);
  });
  const max = Math.max(...days);
  const w = 600;
  const h = 200;
  const padX = 30;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const barW = innerW / days.length - 1;
  const highlightIdx = days.indexOf(Math.max(...days));
  const today = days[days.length - 1] ?? 0;
  const avg = days.reduce((s, v) => s + v, 0) / days.length;

  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Bestellungen je Tag · 30 Tage
        </h3>
        <div className="flex items-baseline gap-3 text-xs">
          <span className="font-mono">Heute: <strong>{today}</strong></span>
          <span className="font-mono text-muted-foreground">Ø: {avg.toFixed(1).replace(".", ",")}</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.06" />;
        })}
        <line
          x1={padX}
          y1={padY + innerH - (avg / max) * innerH}
          x2={w - padX}
          y2={padY + innerH - (avg / max) * innerH}
          stroke="#94a3b8"
          strokeWidth="1"
          strokeDasharray="3 3"
        />
        {days.map((v, i) => {
          const x = padX + i * (innerW / days.length);
          const barH = (v / max) * innerH;
          const y = padY + innerH - barH;
          const isHighlight = i === highlightIdx;
          const isToday = i === days.length - 1;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={barH}
                rx="1"
                fill={isHighlight ? "#10b981" : isToday ? "#0ea5e9" : "#cbd5e1"}
              />
              {(isHighlight || isToday) && (
                <text x={x + barW / 2} y={y - 4} textAnchor="middle" className={isHighlight ? "fill-profit" : "fill-blue-700"} fontSize="9" fontWeight="700">
                  {v}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#10b981]" /> Bester Tag</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#0ea5e9]" /> Heute</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#cbd5e1]" /> Übrige Tage</span>
        <span className="inline-flex items-center gap-1"><span className="h-px w-3 border border-dashed border-slate-400" /> Durchschnitt</span>
      </div>
    </div>
  );
}
