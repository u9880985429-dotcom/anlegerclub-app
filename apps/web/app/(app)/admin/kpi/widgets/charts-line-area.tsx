"use client";
import { TrendingUp } from "lucide-react";
import type { WidgetData } from "./types";

/**
 * Platzhalter, wenn die Datenreihe leer ist (z.B. byMonth = {} bei Echtdaten).
 * Verhindert Zugriffe wie points[0].x auf leere Arrays -> kein Crash.
 */
function EmptyChartCard({ title }: { title: string }) {
  return (
    <div className="card-base h-full p-5">
      <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <TrendingUp className="h-3.5 w-3.5" /> {title}
      </h3>
      <p className="mt-6 text-xs text-muted-foreground">Noch keine Daten fuer diesen Zeitraum.</p>
    </div>
  );
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
  if (series.length === 0) return <EmptyChartCard title="Umsatz-Verlauf (letzte 12 Monate)" />;
  const max = Math.max(...series.map((s) => s.value));
  const min = Math.min(...series.map((s) => s.value)) * 0.85;
  const w = 600;
  const h = 220;
  const padX = 36;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const points = series.map((s, i) => {
    const x = padX + (i / Math.max(series.length - 1, 1)) * innerW;
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
  if (series.length === 0) return <EmptyChartCard title="Booked Revenue (Monatslinie)" />;
  const max = Math.max(...series.map((s) => s.value)) * 1.05;
  const min = Math.min(...series.map((s) => s.value)) * 0.95;
  const w = 600;
  const h = 200;
  const padX = 36;
  const padY = 20;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;
  const points = series.map((s, i) => ({
    x: padX + (i / Math.max(series.length - 1, 1)) * innerW,
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
  if (series.length === 0) return <EmptyChartCard title="Umsatz vs. Target" />;
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
    x: padX + (i / Math.max(series.length - 1, 1)) * innerW,
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
  if (series.length === 0) return <EmptyChartCard title="Bestellungen + Umsatz · Combo" />;
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
