"use client";
import { TrendingUp, RefreshCcw, PieChart as PieIcon, BarChart3, Layers } from "lucide-react";
import type { WidgetData } from "./types";

const PRODUCT_COLORS: Record<string, string> = {
  starter: "#ff741f",
  trend: "#0ea5e9",
  stillhalter: "#10b981",
  cockpit: "#f59e0b",
  "all-access": "#8b5cf6",
};
const PRODUCT_LABEL: Record<string, string> = {
  starter: "Starter",
  trend: "Trend",
  stillhalter: "Stillhalter",
  cockpit: "Cockpit",
  "all-access": "All-Access",
};

/**
 * Area-Chart fuer MRR-Verlauf.
 * Inspiriert vom „SESSIONS"-Area-Chart im Excel-KPI-Dashboard.
 */
export function RevenueAreaChart({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.entries(data.ablefyAggregate.byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-12)
        .map(([k, v]) => ({ label: k, value: v.revenue }))
    : [
        { label: "Mai 25", value: 4200 },
        { label: "Jun 25", value: 4480 },
        { label: "Jul 25", value: 4910 },
        { label: "Aug 25", value: 5150 },
        { label: "Sep 25", value: 5680 },
        { label: "Okt 25", value: 6020 },
        { label: "Nov 25", value: 6510 },
        { label: "Dez 25", value: 7080 },
        { label: "Jan 26", value: 7740 },
        { label: "Feb 26", value: 8390 },
        { label: "Mär 26", value: 9050 },
        { label: "Apr 26", value: 9870 },
      ];
  const max = Math.max(...series.map((s) => s.value));
  const min = Math.min(...series.map((s) => s.value)) * 0.85;
  const w = 600;
  const h = 220;
  const padX = 36;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const points = series.map((s, i) => {
    const x = padX + (i / (series.length - 1)) * innerW;
    const y = padY + innerH - ((s.value - min) / (max - min)) * innerH;
    return { x, y, ...s };
  });
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M ${points[0]!.x.toFixed(1)} ${(padY + innerH).toFixed(1)} ` +
    points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
    ` L ${points[points.length - 1]!.x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;
  const last = points[points.length - 1]!;
  const first = points[0]!;
  const growth = first.value > 0 ? ((last.value - first.value) / first.value) * 100 : 0;

  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" /> Umsatz-Verlauf (letzte 12 Monate)
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Monatlicher Umsatz in €</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="text-right">
            <div className="text-xl font-extrabold">{last.value.toLocaleString("de-DE")} €</div>
            <div className="text-[11px] text-profit">+{growth.toFixed(1).replace(".", ",")} % seit Start</div>
          </div>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff741f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff741f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />;
        })}
        <path d={areaPath} fill="url(#revenueFill)" />
        <path d={linePath} fill="none" stroke="#ff741f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill="#ff741f" />
        ))}
        {points.map((p, i) => {
          if (i % 2 !== 0 && i !== points.length - 1) return null;
          return (
            <text key={`l-${i}`} x={p.x} y={h - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Line-Chart (Booked Revenue, ohne Fill).
 * Inspiriert vom Sales-Overview „Booked Software Revenue"-Linechart.
 */
export function LineRevenueChart({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.entries(data.ablefyAggregate.byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-9).map(([k, v]) => ({ label: k.slice(2), value: v.revenue }))
    : [
        { label: "Aug 25", value: 5150 }, { label: "Sep 25", value: 5680 }, { label: "Okt 25", value: 6020 },
        { label: "Nov 25", value: 6510 }, { label: "Dez 25", value: 7080 }, { label: "Jan 26", value: 7740 },
        { label: "Feb 26", value: 8390 }, { label: "Mär 26", value: 9050 }, { label: "Apr 26", value: 9870 },
      ];
  const max = Math.max(...series.map((s) => s.value)) * 1.05;
  const min = Math.min(...series.map((s) => s.value)) * 0.95;
  const w = 600;
  const h = 200;
  const padX = 36;
  const padY = 20;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const points = series.map((s, i) => ({
    x: padX + (i / (series.length - 1)) * innerW,
    y: padY + innerH - ((s.value - min) / (max - min)) * innerH,
    ...s,
  }));
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <TrendingUp className="h-3.5 w-3.5" /> Booked Revenue (Monatslinie)
        </h3>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        <path d={path} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#22c55e" strokeWidth="2" />
            <text x={p.x} y={p.y - 9} textAnchor="middle" className="fill-foreground" fontSize="9" fontWeight="600">
              {(p.value / 1000).toFixed(1)}k
            </text>
          </g>
        ))}
        {points.map((p, i) => (
          <text key={`l-${i}`} x={p.x} y={h - 4} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
            {p.label}
          </text>
        ))}
      </svg>
    </div>
  );
}

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
                <span className="text-[10px]">vs {r.prev.toLocaleString("de-DE")}</span>
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
      <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
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
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "#7c3aed" }} /> Jetzt</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: "#c4b5fd" }} /> Vorperiode</span>
      </div>
    </div>
  );
}

/**
 * Donut: Retention vs. Churn.
 * Inspiriert vom 88%-Donut im Excel-Dashboard.
 */
export function ChurnDonut({ data }: { data: WidgetData }) {
  const rate = data.activeMembers > 0 ? (data.churnedMembersThisMonth / data.activeMembers) * 100 : 0;
  const retention = 100 - rate;
  const r = 38;
  const c = 2 * Math.PI * r;
  const dash = (retention / 100) * c;
  return (
    <div className="card-base h-full p-5">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <RefreshCcw className="h-3.5 w-3.5" /> Retention vs. Churn
        </h3>
      </div>
      <div className="mt-4 flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="10" />
          <circle cx="50" cy="50" r={r} fill="none" stroke="#10b981" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash.toFixed(2)} ${c.toFixed(2)}`} />
        </svg>
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-profit" /> Retention</span>
            <span className="font-mono font-semibold">{retention.toFixed(1).replace(".", ",")} %</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-full bg-loss" /> Churn (30d)</span>
            <span className="font-mono font-semibold">{rate.toFixed(1).replace(".", ",")} %</span>
          </div>
          <div className="border-t border-border pt-2 text-[11px] text-muted-foreground">
            Ziel: &lt; 5 % · {rate < 5 ? <span className="font-semibold text-profit">unter Ziel</span> : <span className="font-semibold text-loss">ueber Ziel</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Pie / Donut: Product-Mix.
 * Inspiriert vom „Best selling categories" im Analytics-Dashboard.
 */
export function ProductMixPie({ data }: { data: WidgetData }) {
  // Aus Ablefy-Mapping wenn vorhanden, sonst Mock.
  const fromAblefy = data.ablefyAggregate?.byProduct;
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
  const total = entries.reduce((s, e) => s + e.value, 0) || 1;
  const r = 38;
  const c = 2 * Math.PI * r;
  let acc = 0;
  const segments = entries.map((e) => {
    const fraction = e.value / total;
    const dash = fraction * c;
    const offset = (acc / total) * c;
    acc += e.value;
    return { ...e, dash, offset };
  });
  return (
    <div className="card-base h-full p-5">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <PieIcon className="h-3.5 w-3.5" /> Produkt-Mix
        </h3>
      </div>
      <div className="mt-4 flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
          {segments.map((s) => (
            <circle
              key={s.label}
              cx="50" cy="50" r={r}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${s.dash.toFixed(2)} ${(c - s.dash).toFixed(2)}`}
              strokeDashoffset={(-s.offset).toFixed(2)}
            />
          ))}
        </svg>
        <ul className="flex-1 space-y-1.5 text-xs">
          {segments.map((s) => {
            const pct = (s.value / total) * 100;
            return (
              <li key={s.label} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-mono">
                  <strong>{s.value}</strong>
                  <span className="ml-1.5 text-muted-foreground">{pct.toFixed(1).replace(".", ",")}%</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * Sales-Funnel.
 * Inspiriert vom Funnel im Sales-Overview (Leads → Prospects → Opportunities → Sales).
 */
export function SalesFunnelChart({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const steps = [
    { label: "Marketing-Splash-Aufrufe", value: 12420, conv: 100 },
    { label: 'Klick auf „Mehr erfahren"', value: 4870, conv: 39.2 },
    { label: "Webinar-Anmeldung", value: 1180, conv: 9.5 },
    { label: "Erst-Bestellung (Ablefy)", value: 142, conv: 1.14 },
    { label: "Erstlogin", value: 138, conv: 1.11 },
    { label: "Onboarding abgeschlossen", value: 121, conv: 0.97 },
  ];
  const maxValue = steps[0]!.value;
  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Conversion-Funnel · letzte 30 Tage
        </h3>
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const width = Math.max(20, (s.value / maxValue) * 100);
          return (
            <div key={s.label} className="flex flex-wrap items-center gap-3">
              <span className="w-8 flex-shrink-0 text-center font-mono text-xs text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2 text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className="font-mono text-xs">
                    <strong>{s.value.toLocaleString("de-DE")}</strong>
                    <span className="ml-2 text-muted-foreground">{s.conv.toFixed(2).replace(".", ",")} %</span>
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-md bg-muted">
                  <div className="h-full rounded-md bg-gradient-to-r from-brand to-brand/70 transition-all" style={{ width: `${width}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Grosser Funnel mit echten Trapez-Steps.
 * Wie im Sales-Overview-Screenshot — Leads/Prospects/Opportunities/Sales.
 */
export function FunnelStepsChart({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const steps = [
    { label: "Leads", value: 126, color: "#84cc16" },
    { label: "Prospects", value: 53, color: "#f97316" },
    { label: "Opportunities", value: 21, color: "#fbbf24" },
    { label: "Sales", value: 4, color: "#22c55e" },
  ];
  const maxStep = Math.max(...steps.map((s) => s.value));
  const w = 320;
  const h = 280;
  const stepH = (h - 20) / steps.length;
  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Sales-Funnel
        </h3>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mx-auto h-auto w-full max-w-[360px]">
        {steps.map((s, i) => {
          const widthFactor = s.value / maxStep;
          const stepW = widthFactor * (w - 60);
          const x = (w - stepW) / 2;
          const y = i * stepH + 10;
          return (
            <g key={s.label}>
              <rect x={x} y={y} width={stepW} height={stepH - 6} rx="6" fill={s.color} />
              <text x={w / 2} y={y + stepH / 2 + 2} textAnchor="middle" className="fill-white" fontSize="13" fontWeight="700">
                {s.label}
              </text>
              <text x={w / 2} y={y + stepH / 2 + 16} textAnchor="middle" className="fill-white/90" fontSize="11">
                {s.value}
              </text>
            </g>
          );
        })}
      </svg>
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
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#cbd5e1]" /> Vorjahr</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#0ea5e9]" /> Aktuell</span>
        <span className="ml-auto font-mono">YoY: <strong className="text-profit">+{(((current.reduce((s, v) => s + v, 0) / prior.reduce((s, v) => s + v, 0)) - 1) * 100).toFixed(1).replace(".", ",")} %</strong></span>
      </div>
    </div>
  );
}

/**
 * Line-Chart mit Target-Threshold-Linie.
 * Inspiriert vom Yellowfin „Volume Sales Versus Target".
 */
export function TargetLineChart({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.entries(data.ablefyAggregate.byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-9).map(([k, v]) => ({ label: k.slice(2), value: v.revenue }))
    : [
        { label: "Aug 25", value: 5150 }, { label: "Sep 25", value: 5680 }, { label: "Okt 25", value: 6020 },
        { label: "Nov 25", value: 6510 }, { label: "Dez 25", value: 7080 }, { label: "Jan 26", value: 7740 },
        { label: "Feb 26", value: 8390 }, { label: "Mär 26", value: 9050 }, { label: "Apr 26", value: 9870 },
      ];
  const target = 8000;
  const max = Math.max(...series.map((s) => s.value), target) * 1.1;
  const min = Math.min(...series.map((s) => s.value)) * 0.9;
  const w = 600;
  const h = 220;
  const padX = 36;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const yOf = (v: number) => padY + innerH - ((v - min) / (max - min)) * innerH;
  const points = series.map((s, i) => ({
    x: padX + (i / (series.length - 1)) * innerW,
    y: yOf(s.value),
    ...s,
    aboveTarget: s.value >= target,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const targetY = yOf(target);
  const aboveCount = points.filter((p) => p.aboveTarget).length;

  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Umsatz vs. Target</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{aboveCount} von {points.length} Monaten ueber Target</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Target</div>
          <div className="font-mono text-sm font-semibold">{target.toLocaleString("de-DE")} €</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        {/* Target-Linie */}
        <line x1={padX} y1={targetY} x2={w - padX} y2={targetY} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4 4" />
        <text x={w - padX - 5} y={targetY - 5} textAnchor="end" className="fill-loss" fontSize="9" fontWeight="600">
          Target
        </text>
        {/* Linie */}
        <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke={p.aboveTarget ? "#22c55e" : "#ef4444"} strokeWidth="2" />
        ))}
        {points.map((p, i) => (
          <text key={`l-${i}`} x={p.x} y={h - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{p.label}</text>
        ))}
      </svg>
    </div>
  );
}

/**
 * Donut mit Center-Stat (grosser Wert in der Mitte).
 * Inspiriert vom Yellowfin „Sales by Account Segment 33m".
 */
export function DonutWithCenterStat({ data }: { data: WidgetData }) {
  const PRODUCT_LABEL_LOCAL: Record<string, string> = {
    starter: "Starter",
    trend: "Trend",
    stillhalter: "Stillhalter",
    cockpit: "Cockpit",
    "all-access": "All-Access",
  };
  const PRODUCT_COLORS_LOCAL: Record<string, string> = {
    starter: "#ff741f",
    trend: "#0ea5e9",
    stillhalter: "#10b981",
    cockpit: "#f59e0b",
    "all-access": "#8b5cf6",
  };
  const fromAblefy = data.ablefyAggregate?.byProduct;
  let entries: { label: string; value: number; color: string }[];
  if (fromAblefy && Object.keys(fromAblefy).length > 0) {
    entries = Object.entries(fromAblefy).map(([k, v]) => ({
      label: PRODUCT_LABEL_LOCAL[k] ?? `Produkt ${k}`,
      value: v.revenue,
      color: PRODUCT_COLORS_LOCAL[k] ?? "#94a3b8",
    }));
  } else {
    entries = [
      { label: "Starter", value: 18200, color: PRODUCT_COLORS_LOCAL.starter! },
      { label: "Trend", value: 28400, color: PRODUCT_COLORS_LOCAL.trend! },
      { label: "Stillhalter", value: 22100, color: PRODUCT_COLORS_LOCAL.stillhalter! },
      { label: "Cockpit", value: 8900, color: PRODUCT_COLORS_LOCAL.cockpit! },
      { label: "All-Access", value: 33800, color: PRODUCT_COLORS_LOCAL["all-access"]! },
    ];
  }
  const total = entries.reduce((s, e) => s + e.value, 0) || 1;
  const r = 38;
  const c = 2 * Math.PI * r;
  let acc = 0;
  const segments = entries.map((e) => {
    const fraction = e.value / total;
    const dash = fraction * c;
    const offset = (acc / total) * c;
    acc += e.value;
    return { ...e, dash, offset };
  });
  const centerLabel = total >= 1_000_000 ? `${(total / 1_000_000).toFixed(2)}M` : total >= 1_000 ? `${(total / 1_000).toFixed(1)}k` : `${total.toFixed(0)}`;
  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Umsatz · Produkt-Verteilung
      </h3>
      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-36 w-36 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {segments.map((s) => (
              <circle
                key={s.label}
                cx="50" cy="50" r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${s.dash.toFixed(2)} ${(c - s.dash).toFixed(2)}`}
                strokeDashoffset={(-s.offset).toFixed(2)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-extrabold">{centerLabel} €</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Gesamt</div>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-xs">
          {segments.sort((a, b) => b.value - a.value).map((s) => {
            const pct = (s.value / total) * 100;
            return (
              <li key={s.label} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </span>
                <span className="font-mono">
                  <strong>{s.value >= 1000 ? (s.value / 1000).toFixed(1) + "k" : s.value.toFixed(0)} €</strong>
                  <span className="ml-1.5 text-muted-foreground">{pct.toFixed(1).replace(".", ",")}%</span>
                </span>
              </li>
            );
          })}
        </ul>
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
    "all-access": "All-Access",
  };
  const fromAblefy = data.ablefyAggregate?.byProduct;
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
              <span className="w-6 flex-shrink-0 text-center font-mono text-[11px] text-muted-foreground">{i + 1}</span>
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
 * Mini-Donut-Row (eine Mini-Donut je Produkt + Mini-Stat).
 * Inspiriert vom Yellowfin „KPIs by Product Category" (Whiskies/Rums/Vodkas/Tequilas).
 */
export function MiniDonutRow({ data }: { data: WidgetData }) {
  const PRODUCT_LABEL_LOCAL: Record<string, string> = {
    starter: "Starter",
    trend: "Trend",
    stillhalter: "Stillhalter",
    cockpit: "Cockpit",
    "all-access": "All-Access",
  };
  const PRODUCT_COLORS_LOCAL: Record<string, string> = {
    starter: "#ff741f",
    trend: "#0ea5e9",
    stillhalter: "#10b981",
    cockpit: "#f59e0b",
    "all-access": "#8b5cf6",
  };
  const fromAblefy = data.ablefyAggregate?.byProduct;
  let entries: { label: string; value: number; goal: number; color: string }[];
  if (fromAblefy && Object.keys(fromAblefy).length > 0) {
    entries = Object.entries(fromAblefy).slice(0, 4).map(([k, v]) => ({
      label: PRODUCT_LABEL_LOCAL[k] ?? `Produkt ${k}`,
      value: v.revenue,
      goal: v.revenue * 1.3,
      color: PRODUCT_COLORS_LOCAL[k] ?? "#94a3b8",
    }));
  } else {
    entries = [
      { label: "Starter", value: 18200, goal: 25000, color: PRODUCT_COLORS_LOCAL.starter! },
      { label: "Trend", value: 28400, goal: 30000, color: PRODUCT_COLORS_LOCAL.trend! },
      { label: "Stillhalter", value: 22100, goal: 28000, color: PRODUCT_COLORS_LOCAL.stillhalter! },
      { label: "All-Access", value: 33800, goal: 32000, color: PRODUCT_COLORS_LOCAL["all-access"]! },
    ];
  }
  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Umsatz je Produkt · Goal-Tracking
      </h3>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${entries.length}, minmax(0, 1fr))` }}>
        {entries.map((e) => {
          const pct = Math.min(1, e.value / e.goal);
          const r = 30;
          const c = 2 * Math.PI * r;
          const dash = pct * c;
          return (
            <div key={e.label} className="flex flex-col items-center text-center">
              <div className="relative h-20 w-20">
                <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
                  <circle cx="40" cy="40" r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="8" />
                  <circle
                    cx="40" cy="40" r={r}
                    fill="none"
                    stroke={e.color}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${dash.toFixed(2)} ${c.toFixed(2)}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold" style={{ color: e.color }}>
                    {(pct * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="mt-1 text-[11px] font-semibold">{e.label}</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {e.value >= 1000 ? `${(e.value / 1000).toFixed(1)}k` : e.value.toFixed(0)} / {e.goal >= 1000 ? `${(e.goal / 1000).toFixed(0)}k` : e.goal.toFixed(0)}
              </div>
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
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
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
      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.paid }} /> Aktiv (Paid)</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.refund }} /> Refunded</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ background: colors.open }} /> Offen</span>
      </div>
    </div>
  );
}

/**
 * Bubble-Scatter — X-Y-Plot mit groessenvariablen Bubbles.
 * Inspiriert von Bild 5 (Sales Activity / Tableau-Style).
 */
export function BubbleScatterChart({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const trades = [
    { label: "AVGO", x: 47, y: 1842, size: 213 },
    { label: "CSX/MCD", x: 38, y: 1623, size: 184 },
    { label: "VICI", x: 22, y: 1201, size: 142 },
    { label: "AMKR", x: 29, y: 1109, size: 119 },
    { label: "NOW", x: 24, y: 982, size: 98 },
    { label: "SLV", x: 18, y: 870, size: 86 },
    { label: "TFC", x: 14, y: 690, size: 64 },
    { label: "MRNA", x: 35, y: 1410, size: 156 },
  ];
  const w = 600;
  const h = 280;
  const padX = 50;
  const padY = 30;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const xMax = Math.max(...trades.map((t) => t.x)) * 1.1;
  const yMax = Math.max(...trades.map((t) => t.y)) * 1.1;
  const sMax = Math.max(...trades.map((t) => t.size));

  return (
    <div className="card-base h-full p-5">
      <div className="mb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Trade-Engagement · Scatter
        </h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">X = Kommentare · Y = Views · Bubble-Groesse = Reaktionen</p>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {/* Achsen */}
        <line x1={padX} y1={padY} x2={padX} y2={h - padY} stroke="currentColor" strokeOpacity="0.2" />
        <line x1={padX} y1={h - padY} x2={w - padX} y2={h - padY} stroke="currentColor" strokeOpacity="0.2" />
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.06" />;
        })}
        {/* Y-Labels */}
        {[0, 0.5, 1].map((g) => {
          const y = padY + innerH * (1 - g);
          return (
            <text key={g} x={padX - 6} y={y + 3} textAnchor="end" className="fill-muted-foreground" fontSize="9">
              {Math.round(yMax * g)}
            </text>
          );
        })}
        {/* X-Labels */}
        {[0, 0.5, 1].map((g) => {
          const x = padX + innerW * g;
          return (
            <text key={g} x={x} y={h - padY + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
              {Math.round(xMax * g)}
            </text>
          );
        })}
        {/* Bubbles */}
        {trades.map((t, i) => {
          const cx = padX + (t.x / xMax) * innerW;
          const cy = padY + innerH - (t.y / yMax) * innerH;
          const r = 5 + (t.size / sMax) * 18;
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={r} fill="#0ea5e9" fillOpacity="0.55" stroke="#0ea5e9" strokeWidth="1.5" />
              <text x={cx} y={cy + 2} textAnchor="middle" className="fill-white" fontSize="8" fontWeight="600">{t.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Combo-Bar-Line-Chart — Bars + Line auf gleichem Chart.
 * Inspiriert von Bild 7 (Bars + Line overlay).
 */
export function ComboBarLineChart({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.entries(data.ablefyAggregate.byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-8).map(([k, v]) => ({ label: k.slice(5), bar: v.count, line: v.revenue }))
    : [
        { label: "Jan", bar: 12, line: 8000 },
        { label: "Feb", bar: 15, line: 9200 },
        { label: "Mär", bar: 11, line: 8400 },
        { label: "Apr", bar: 18, line: 10500 },
        { label: "Mai", bar: 16, line: 11200 },
        { label: "Jun", bar: 22, line: 13400 },
        { label: "Jul", bar: 20, line: 12800 },
        { label: "Aug", bar: 25, line: 14600 },
      ];
  const barMax = Math.max(...series.map((s) => s.bar));
  const lineMax = Math.max(...series.map((s) => s.line));
  const w = 600;
  const h = 240;
  const padX = 40;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const groupW = innerW / series.length;
  const barW = groupW * 0.55;
  const points = series.map((s, i) => ({
    x: padX + i * groupW + groupW / 2,
    y: padY + innerH - (s.line / lineMax) * innerH,
    ...s,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Bestellungen + Umsatz · Combo
      </h3>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full">
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" />;
        })}
        {series.map((s, i) => {
          const x = padX + i * groupW + (groupW - barW) / 2;
          const barH = (s.bar / barMax) * innerH;
          return (
            <g key={i}>
              <rect x={x} y={padY + innerH - barH} width={barW} height={barH} rx="2" fill="#cbd5e1" />
              <text x={x + barW / 2} y={h - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9">{s.label}</text>
            </g>
          );
        })}
        <path d={linePath} fill="none" stroke="#0ea5e9" strokeWidth="2.5" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#0ea5e9" strokeWidth="2" />
        ))}
      </svg>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#cbd5e1]" /> Bestellungen (Anzahl)</span>
        <span className="inline-flex items-center gap-1"><span className="h-0.5 w-3 bg-[#0ea5e9]" /> Umsatz (€)</span>
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
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#10b981]" /> Bester Tag</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#0ea5e9]" /> Heute</span>
        <span className="inline-flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-[#cbd5e1]" /> Übrige Tage</span>
        <span className="inline-flex items-center gap-1"><span className="h-px w-3 border border-dashed border-slate-400" /> Durchschnitt</span>
      </div>
    </div>
  );
}

/**
 * Churn-Reason-Donut — klassifizierte Donut mit grossem Center-Total.
 * Inspiriert von Bild 1 (dark theme „Churn Reason" mit Total in der Mitte).
 */
export function ChurnReasonDonut({ data }: { data: WidgetData }) {
  const total = data.churnedMembersThisMonth;
  const reasons = [
    { label: "Pricing", pct: 42, color: "#3b82f6" },
    { label: "Lack of value", pct: 25, color: "#60a5fa" },
    { label: "Non-payment", pct: 17, color: "#10b981" },
    { label: "Poor fit", pct: 8, color: "#34d399" },
    { label: "Switched to rival", pct: 8, color: "#ef4444" },
  ];
  const r = 42;
  const c = 2 * Math.PI * r;
  let acc = 0;
  const segments = reasons.map((s) => {
    const dash = (s.pct / 100) * c;
    const offset = (acc / 100) * c;
    acc += s.pct;
    return { ...s, dash, offset };
  });
  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Churn-Reasons (30d)</h3>
      <div className="mt-4 flex items-center gap-5">
        <div className="relative h-36 w-36 flex-shrink-0">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            {segments.map((s) => (
              <circle
                key={s.label}
                cx="50" cy="50" r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${s.dash.toFixed(2)} ${(c - s.dash).toFixed(2)}`}
                strokeDashoffset={(-s.offset).toFixed(2)}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div>
            <div className="text-3xl font-extrabold">{total}</div>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-xs">
          {segments.map((s) => (
            <li key={s.label} className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: s.color }} />
                {s.label}
              </span>
              <span className="font-mono font-semibold">{s.pct}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
