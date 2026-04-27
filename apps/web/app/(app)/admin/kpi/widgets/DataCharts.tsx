"use client";
import { TrendingUp, RefreshCcw, PieChart as PieIcon, BarChart3, Layers } from "lucide-react";
import { CardMenu } from "@/components/CardMenu";
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

function chartMenuItems(label: string) {
  return [
    { label: "Aktualisieren", onClick: () => alert(`„${label}" wird aktualisiert (Phase 2: DB-Refetch).`) },
    { label: "Als PNG exportieren", onClick: () => alert(`„${label}" als PNG (Phase 2).`) },
    { label: "Als CSV exportieren", onClick: () => alert(`„${label}" als CSV (Phase 2).`) },
    { divider: true, label: "" },
    { label: "Einstellungen", onClick: () => alert("Einstellungen (Phase 2).") },
  ];
}

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
          <CardMenu items={chartMenuItems("Umsatz-Verlauf")} />
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
        <CardMenu items={chartMenuItems("Booked Revenue")} />
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
        <CardMenu items={chartMenuItems("Monats-Aktivitaet")} />
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
        <CardMenu items={chartMenuItems("Reichweite je Kanal")} />
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
        <CardMenu items={chartMenuItems("Revenue Vergleich")} />
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
        <CardMenu items={chartMenuItems("Retention vs Churn")} />
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
        <CardMenu items={chartMenuItems("Produkt-Mix")} />
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
        <CardMenu items={chartMenuItems("Conversion-Funnel")} />
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
        <CardMenu items={chartMenuItems("Sales-Funnel")} />
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
