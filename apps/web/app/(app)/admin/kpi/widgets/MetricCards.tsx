"use client";
import {
  Euro, TrendingUp, Users, RefreshCcw, Activity, AlertTriangle,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import type { WidgetData } from "./types";

/**
 * Kennzahl-Kacheln. Inspiriert von:
 *  - „Visitors / Bounce rate / Conversion / Total revenue"-Kacheln (Analytics-Dashboard)
 *  - „MRR / ARR / Active Members / Churn"-Kacheln (Standard-SaaS-Dashboards)
 */

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaSentiment?: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  alert?: boolean;
}

export function MetricCard({ label, value, delta, deltaSentiment, icon: Icon, accent, alert }: MetricCardProps) {
  return (
    <div className={`card-base h-full p-5 ${accent ? "border-brand/40 bg-brand/5" : ""} ${alert ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${accent ? "bg-brand/15 text-brand" : alert ? "bg-amber-500/15 text-amber-700" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-4 w-4" />
        </div>
        {delta && (
          <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${deltaSentiment === "up" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
            {deltaSentiment === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

export function MrrCard({ data }: { data: WidgetData }) {
  const mrr = data.ablefyAggregate
    ? Math.round(data.ablefyAggregate.totalRevenue / 12)
    : data.activeMembers * data.avgArpu;
  return <MetricCard label="MRR (Monthly Recurring Revenue)" value={`${mrr.toLocaleString("de-DE")} €`} delta="+8,2 %" deltaSentiment="up" icon={Euro} accent />;
}

export function ArrCard({ data }: { data: WidgetData }) {
  const arr = data.ablefyAggregate
    ? data.ablefyAggregate.totalRevenue
    : data.activeMembers * data.avgArpu * 12;
  return (
    <MetricCard
      label="ARR (Annual Run-Rate)"
      value={arr >= 1000 ? `${(arr / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })}k €` : `${arr.toFixed(0)} €`}
      delta="+12,4 %"
      deltaSentiment="up"
      icon={TrendingUp}
    />
  );
}

export function ActiveMembersCard({ data }: { data: WidgetData }) {
  return <MetricCard label="Aktive Mitglieder" value={String(data.activeMembers)} delta={`+${data.newMembersThisMonth} diesen Monat`} deltaSentiment="up" icon={Users} />;
}

export function ChurnRateCard({ data }: { data: WidgetData }) {
  const rate = data.activeMembers > 0 ? (data.churnedMembersThisMonth / data.activeMembers) * 100 : 0;
  return <MetricCard label="Churn-Rate (30d)" value={`${rate.toFixed(2).replace(".", ",")} %`} delta="-0,3 %" deltaSentiment="up" icon={RefreshCcw} />;
}

export function ArpuCard({ data }: { data: WidgetData }) {
  return <MetricCard label="ARPU (Avg Revenue / User)" value={`${data.avgArpu} €/Mo`} icon={Activity} />;
}

export function LtvCard({ data }: { data: WidgetData }) {
  const ltv = data.avgArpu * 18;
  return <MetricCard label="LTV (Lifetime-Value)" value={`${ltv.toLocaleString("de-DE")} €`} icon={TrendingUp} />;
}

export function GrossMarginCard() {
  return <MetricCard label="Gross Margin" value="78,4 %" icon={Euro} />;
}

export function PaymentIssuesCard({ data }: { data: WidgetData }) {
  return <MetricCard label="Mitglieder mit Zahlungsproblemen" value={String(data.pausedMembers)} icon={AlertTriangle} alert={data.pausedMembers > 0} />;
}

export function RevenueTotalCard({ data }: { data: WidgetData }) {
  const total = data.ablefyAggregate?.totalRevenue ?? data.activeMembers * data.avgArpu * 6;
  return <MetricCard label="Umsatz (gefilterter Zeitraum)" value={`${total.toFixed(2).replace(".", ",")} €`} delta="+21,3 %" deltaSentiment="up" icon={Euro} accent />;
}

export function RefundRateCard({ data }: { data: WidgetData }) {
  const total = data.ablefyAggregate?.invoicesFetched ?? 100;
  const refunded = data.ablefyAggregate?.refunded ?? 2;
  const rate = total > 0 ? (refunded / total) * 100 : 0;
  return (
    <MetricCard
      label="Refund-Rate"
      value={`${rate.toFixed(2).replace(".", ",")} %`}
      delta={rate > 5 ? "über Ziel" : "im Ziel"}
      deltaSentiment={rate > 5 ? "down" : "up"}
      icon={RefreshCcw}
      alert={rate > 5}
    />
  );
}

/**
 * Kennzahl-Karte mit Sub-Metriken (3 Zeilen darunter).
 * Inspiriert vom Analytics-Dashboard (Visitors/Bounce/Conversion mit Sub-Werten).
 */
export function MetricListCard({
  title,
  value,
  delta,
  deltaSentiment,
  rows,
}: {
  title: string;
  value: string;
  delta?: string;
  deltaSentiment?: "up" | "down";
  rows: { label: string; value: string; trend?: "up" | "down" }[];
}) {
  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 text-xs text-muted-foreground">{title}</div>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold">{value}</span>
        {delta && (
          <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${deltaSentiment === "up" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
            {deltaSentiment === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      <div className="space-y-1.5 border-t border-border pt-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-2 text-xs">
            <span className="text-muted-foreground">{r.label}</span>
            <span className="inline-flex items-center gap-1 font-mono font-semibold">
              {r.trend === "up" && <ArrowUpRight className="h-3 w-3 text-profit" />}
              {r.trend === "down" && <ArrowDownRight className="h-3 w-3 text-loss" />}
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function VisitorsBreakdownCard({ data }: { data: WidgetData }) {
  return (
    <MetricListCard
      title="Aktive Mitglieder · Aufschluesselung"
      value={data.activeMembers.toLocaleString("de-DE")}
      delta="+10,4 %"
      deltaSentiment="up"
      rows={[
        { label: "Starter Depot", value: String(Math.round(data.activeMembers * 0.28)), trend: "up" },
        { label: "Trend Depot", value: String(Math.round(data.activeMembers * 0.34)), trend: "up" },
        { label: "Stillhalter Depot", value: String(Math.round(data.activeMembers * 0.21)), trend: "up" },
        { label: "Cockpit + All-Access", value: String(Math.round(data.activeMembers * 0.17)), trend: "down" },
      ]}
    />
  );
}

/**
 * Mini-Sparkline-Card — Zahl + kleine Trendlinie.
 * Inspiriert vom „BOOKED SOFTWARE REVENUE"-Slider (Sales-Overview-Screenshot).
 */
export function SparklineCard({
  title,
  value,
  trend,
  data: series,
}: {
  title: string;
  value: string;
  trend?: "up" | "down";
  data: number[];
}) {
  const w = 180;
  const h = 50;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  const path = series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div className="card-base flex h-full flex-col justify-between p-4">
      <div>
        <div className="text-xs text-muted-foreground">{title}</div>
        <div className="mt-1 text-2xl font-extrabold">{value}</div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 h-12 w-full" preserveAspectRatio="none">
        <path
          d={path}
          fill="none"
          stroke={trend === "down" ? "#ef4444" : "#10b981"}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

export function MrrSparkline({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.values(data.ablefyAggregate.byMonth).slice(-12).map((m) => m.revenue)
    : [4200, 4480, 4910, 5150, 5680, 6020, 6510, 7080, 7740, 8390, 9050, 9870];
  const last = series[series.length - 1] ?? 0;
  return <SparklineCard title="MRR · 12-Monats-Trend" value={`${last.toLocaleString("de-DE")} €`} trend="up" data={series} />;
}

/**
 * Gauge / Tachometer.
 * Inspiriert vom „Cost Per Lead / Sales Conversion Rate"-Gauge im Sales-Overview.
 */
export function GaugeCard({
  title,
  value,
  goal,
  unit = "%",
  threshold,
}: {
  title: string;
  value: number;
  goal: number;
  unit?: string;
  threshold?: { warn: number; bad: number };
}) {
  // Halbkreis-Gauge: 180 Grad, von links unten nach rechts unten.
  const max = Math.max(goal * 2, value * 1.2);
  const pct = Math.min(1, value / max);
  const angle = pct * 180;
  const cx = 100;
  const cy = 100;
  const r = 70;
  const x = cx + r * Math.cos(((180 - angle) * Math.PI) / 180);
  const y = cy - r * Math.sin(((180 - angle) * Math.PI) / 180);
  const goalX = cx + r * Math.cos(((180 - (goal / max) * 180) * Math.PI) / 180);
  const goalY = cy - r * Math.sin(((180 - (goal / max) * 180) * Math.PI) / 180);

  let color = "#10b981";
  if (threshold) {
    if (value >= threshold.bad) color = "#ef4444";
    else if (value >= threshold.warn) color = "#f59e0b";
  }

  return (
    <div className="card-base flex h-full flex-col items-center p-5">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <svg viewBox="0 0 200 120" className="w-full max-w-[220px]">
        {/* Hintergrund-Bogen */}
        <path d={`M 30 100 A ${r} ${r} 0 0 1 170 100`} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="14" strokeLinecap="round" />
        {/* Wert-Bogen */}
        <path
          d={`M 30 100 A ${r} ${r} 0 0 1 ${x.toFixed(1)} ${y.toFixed(1)}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Goal-Marker */}
        <circle cx={goalX} cy={goalY} r="4" fill="#0f172a" />
      </svg>
      <div className="mt-1 text-3xl font-extrabold" style={{ color }}>
        {value.toFixed(1).replace(".", ",")}{unit}
      </div>
      <div className="text-[11px] text-muted-foreground">Ziel: {goal}{unit}</div>
    </div>
  );
}

export function ChurnGauge({ data }: { data: WidgetData }) {
  const rate = data.activeMembers > 0 ? (data.churnedMembersThisMonth / data.activeMembers) * 100 : 0;
  return <GaugeCard title="Churn-Rate (30d)" value={Number(rate.toFixed(2))} goal={5} unit="%" threshold={{ warn: 4, bad: 6 }} />;
}

export function ConversionGauge() {
  return <GaugeCard title="Conversion-Rate Webinar→Kauf" value={3.4} goal={3.0} unit="%" threshold={{ warn: 2, bad: 1 }} />;
}

/**
 * Progress-Bar — Goal vs. Actual.
 * Inspiriert vom „BUDGET" geplant-vs-tatsaechlich-Bar im PM-Dashboard.
 */
export function ProgressBarCard({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; actual: number; goal: number; unit?: string }[];
}) {
  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="space-y-3">
        {rows.map((r) => {
          const pct = Math.min(100, (r.actual / Math.max(r.actual, r.goal)) * 100);
          const goalPct = (r.goal / Math.max(r.actual, r.goal)) * 100;
          const overshoot = r.actual > r.goal;
          return (
            <div key={r.label}>
              <div className="mb-1 flex items-baseline justify-between text-xs">
                <span className="font-medium">{r.label}</span>
                <span className="font-mono">
                  <strong>{r.actual.toLocaleString("de-DE")}</strong>
                  <span className="text-muted-foreground"> / {r.goal.toLocaleString("de-DE")}{r.unit ?? ""}</span>
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-md bg-muted">
                <div
                  className={`h-full transition-all ${overshoot ? "bg-profit" : "bg-brand"}`}
                  style={{ width: `${pct}%` }}
                />
                {!overshoot && (
                  <div className="absolute top-0 h-full border-l-2 border-dashed border-foreground/40" style={{ left: `${goalPct}%` }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MonthlyGoalsProgress({ data }: { data: WidgetData }) {
  return (
    <ProgressBarCard
      title="Monats-Ziele · Plan vs. Ist"
      rows={[
        { label: "Neue Mitglieder", actual: data.newMembersThisMonth, goal: 20 },
        { label: "Umsatz (k €)", actual: Math.round((data.activeMembers * data.avgArpu) / 1000), goal: 12 },
        { label: "Trade-Signale", actual: 11, goal: 15 },
        { label: "Webinare", actual: 2, goal: 2 },
      ]}
    />
  );
}

/**
 * Zone-Gauge — Tachometer mit 3-Farben-Ampel (gruen/gelb/rot).
 * Inspiriert vom Yellowfin-BI-Dashboard „KPIs by Product Category".
 */
export function ZoneGauge({
  title,
  value,
  goal,
  unit = "%",
  zones,
  invert,
}: {
  title: string;
  value: number;
  goal: number;
  unit?: string;
  /** Schwellen relativ zum max-Wert: [warn, bad]. Default: [0.5, 0.75] (= 50/75 %). */
  zones?: { warn: number; bad: number };
  /** Wenn invert=true: niedrig = gut (z.B. Churn). Default: hoch = gut. */
  invert?: boolean;
}) {
  const max = Math.max(goal * 1.5, value * 1.2, goal + 1);
  const pct = Math.min(1, value / max);
  const z = zones ?? { warn: 0.5, bad: 0.75 };
  const color = (() => {
    const ratio = invert ? 1 - pct : pct;
    if (ratio >= 1 - (1 - z.bad)) return "#22c55e";
    if (ratio >= 1 - (1 - z.warn)) return "#f59e0b";
    return "#ef4444";
  })();
  // 3 Bogen-Segmente fuer die Zonen
  const segs = [
    { from: 0, to: z.warn, color: invert ? "#22c55e" : "#ef4444" },
    { from: z.warn, to: z.bad, color: "#f59e0b" },
    { from: z.bad, to: 1, color: invert ? "#ef4444" : "#22c55e" },
  ];
  const r = 70;
  const cx = 100;
  const cy = 100;
  function arc(fromPct: number, toPct: number) {
    const fromAngle = 180 - fromPct * 180;
    const toAngle = 180 - toPct * 180;
    const x1 = cx + r * Math.cos((fromAngle * Math.PI) / 180);
    const y1 = cy - r * Math.sin((fromAngle * Math.PI) / 180);
    const x2 = cx + r * Math.cos((toAngle * Math.PI) / 180);
    const y2 = cy - r * Math.sin((toAngle * Math.PI) / 180);
    return `M ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  // Zeiger
  const valueAngle = 180 - pct * 180;
  const needleX = cx + r * 0.85 * Math.cos((valueAngle * Math.PI) / 180);
  const needleY = cy - r * 0.85 * Math.sin((valueAngle * Math.PI) / 180);

  return (
    <div className="card-base flex h-full flex-col items-center p-5">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <svg viewBox="0 0 200 130" className="w-full max-w-[240px]">
        {segs.map((s, i) => (
          <path key={i} d={arc(s.from, s.to)} fill="none" stroke={s.color} strokeWidth="14" strokeLinecap="butt" opacity="0.85" />
        ))}
        {/* Zeiger */}
        <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="6" fill="#0f172a" />
      </svg>
      <div className="mt-1 text-3xl font-extrabold" style={{ color }}>
        {value.toFixed(1).replace(".", ",")}{unit}
      </div>
      <div className="text-[11px] text-muted-foreground">Ziel: {goal}{unit}</div>
    </div>
  );
}

export function ChurnZoneGauge({ data }: { data: WidgetData }) {
  const rate = data.activeMembers > 0 ? (data.churnedMembersThisMonth / data.activeMembers) * 100 : 0;
  return <ZoneGauge title="Churn-Rate (30d)" value={Number(rate.toFixed(2))} goal={5} unit="%" invert />;
}

export function ConversionZoneGauge() {
  return <ZoneGauge title="Conversion-Rate Webinar→Kauf" value={3.4} goal={3.0} unit="%" />;
}

/**
 * Big-Number-Card mit Variance + 12-Monats-Sparkline.
 * Inspiriert vom Yellowfin-BI „Sales YTD 33,09m + Variance"-Card.
 */
export function BigNumberWithSparkline({
  label,
  value,
  variancePct,
  varianceAbs,
  series,
  unit = "€",
}: {
  label: string;
  value: number;
  variancePct?: number;
  varianceAbs?: number;
  series: number[];
  unit?: string;
}) {
  const w = 280;
  const h = 70;
  const max = Math.max(...series, 1);
  const min = Math.min(...series) * 0.92;
  const range = max - min || 1;
  const points = series.map((v, i) => ({
    x: (i / Math.max(series.length - 1, 1)) * w,
    y: h - ((v - min) / range) * h,
  }));
  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M ${points[0]?.x.toFixed(1) ?? 0} ${h} ` +
    points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
    ` L ${points[points.length - 1]?.x.toFixed(1) ?? 0} ${h} Z`;
  const positive = (variancePct ?? 0) >= 0;
  const color = positive ? "#22c55e" : "#ef4444";
  return (
    <div className="card-base h-full p-5">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 flex flex-wrap items-baseline gap-2">
        <span className="text-3xl font-extrabold">
          {(value >= 1_000_000 ? (value / 1_000_000).toFixed(2) : value >= 1_000 ? (value / 1_000).toFixed(1) + "k" : value.toFixed(0))}
          <span className="ml-1 text-lg text-muted-foreground">{unit}</span>
        </span>
        {variancePct !== undefined && (
          <span className="inline-flex items-baseline gap-1 text-xs font-semibold" style={{ color }}>
            {positive ? "▲" : "▼"} {Math.abs(variancePct).toFixed(2).replace(".", ",")}%
          </span>
        )}
      </div>
      {varianceAbs !== undefined && (
        <div className="text-[11px]" style={{ color }}>
          Variance: {varianceAbs >= 0 ? "+" : ""}{varianceAbs.toLocaleString("de-DE")} {unit}
        </div>
      )}
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-16 w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="bn-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#bn-fill)" />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function RevenueBigNumber({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.entries(data.ablefyAggregate.byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([, v]) => v.revenue)
    : [4200, 4480, 4910, 5150, 5680, 6020, 6510, 7080, 7740, 8390, 9050, 9870];
  const total = series.reduce((s, v) => s + v, 0);
  const last = series[series.length - 1] ?? 0;
  const prev = series[series.length - 2] ?? last;
  const pct = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  const abs = last - prev;
  return <BigNumberWithSparkline label="Umsatz YTD · letzter Monat" value={total} variancePct={pct} varianceAbs={abs} series={series} />;
}

/**
 * Vertikaler Thermometer-Progress.
 * Inspiriert von KPI-Dashboard-Slides + Sales-Overview Revenue-Slider.
 */
export function ThermometerCard({
  title,
  value,
  goal,
  unit = "€",
}: {
  title: string;
  value: number;
  goal: number;
  unit?: string;
}) {
  const pct = Math.min(100, (value / goal) * 100);
  const above = value >= goal;
  return (
    <div className="card-base flex h-full flex-col p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="flex flex-1 items-center gap-4">
        <div className="relative h-40 w-8 flex-shrink-0 rounded-full bg-muted">
          <div
            className={`absolute bottom-0 left-0 right-0 rounded-full transition-all ${above ? "bg-profit" : "bg-brand"}`}
            style={{ height: `${pct}%` }}
          />
          <div className="absolute -right-12 top-0 -translate-y-1/2 text-[10px] text-muted-foreground">
            {(goal * 1).toLocaleString("de-DE")} {unit}
          </div>
          <div className="absolute -right-12 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
            {(goal / 2).toLocaleString("de-DE")} {unit}
          </div>
          <div className="absolute -right-8 bottom-0 text-[10px] text-muted-foreground">0</div>
        </div>
        <div className="flex-1 pl-12">
          <div className="text-3xl font-extrabold">
            {value.toLocaleString("de-DE")}
            <span className="ml-1 text-base text-muted-foreground">{unit}</span>
          </div>
          <div className="mt-1 text-xs">
            <span className={above ? "text-profit" : "text-amber-700"}>
              {pct.toFixed(0)} % vom Ziel
            </span>
            <span className="ml-2 text-muted-foreground">
              ({goal.toLocaleString("de-DE")} {unit})
            </span>
          </div>
          {above ? (
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-profit/15 px-1.5 py-0.5 text-[10px] font-semibold text-profit">
              ✓ Ziel uebertroffen
            </div>
          ) : (
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
              {(goal - value).toLocaleString("de-DE")} {unit} bis Ziel
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MrrThermometer({ data }: { data: WidgetData }) {
  const mrr = data.ablefyAggregate ? Math.round(data.ablefyAggregate.totalRevenue / 12) : data.activeMembers * data.avgArpu;
  return <ThermometerCard title="MRR · Goal-Tracking" value={mrr} goal={15000} unit="€" />;
}
