"use client";
import { TrendingUp, RefreshCcw, PieChart as PieIcon } from "lucide-react";

/**
 * SVG-basierte KPI-Charts ohne externe Dependencies.
 * Phase 2: Werden via DB-Aggregat-Queries gefüttert.
 */

const MONTHS = ["Mai 25", "Jun 25", "Jul 25", "Aug 25", "Sep 25", "Okt 25", "Nov 25", "Dez 25", "Jan 26", "Feb 26", "Mär 26", "Apr 26"];
const MRR_HISTORY = [4200, 4480, 4910, 5150, 5680, 6020, 6510, 7080, 7740, 8390, 9050, 9870];

export function RevenueChart() {
  const max = Math.max(...MRR_HISTORY);
  const min = Math.min(...MRR_HISTORY) * 0.85;
  const w = 600;
  const h = 220;
  const padX = 36;
  const padY = 24;
  const innerW = w - padX * 2;
  const innerH = h - padY * 2;

  const points = MRR_HISTORY.map((v, i) => {
    const x = padX + (i / (MRR_HISTORY.length - 1)) * innerW;
    const y = padY + innerH - ((v - min) / (max - min)) * innerH;
    return { x, y, v };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M ${points[0]!.x.toFixed(1)} ${(padY + innerH).toFixed(1)} ` +
    points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") +
    ` L ${points[points.length - 1]!.x.toFixed(1)} ${(padY + innerH).toFixed(1)} Z`;

  const last = points[points.length - 1]!;
  const first = points[0]!;
  const growth = ((last.v - first.v) / first.v) * 100;

  return (
    <div className="card-base p-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5" />
            MRR-Entwicklung (letzte 12 Monate)
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Monatlich wiederkehrender Umsatz in €</p>
        </div>
        <div className="text-right">
          <div className="text-xl font-extrabold">{last.v.toLocaleString("de-DE")} €</div>
          <div className="text-[11px] text-profit">+{growth.toFixed(1).replace(".", ",")} % vs. Mai 25</div>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="mrrFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff741f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ff741f" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Y-Gridlines */}
        {[0.25, 0.5, 0.75].map((g) => {
          const y = padY + innerH * g;
          return <line key={g} x1={padX} y1={y} x2={w - padX} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="3 3" />;
        })}
        {/* Area */}
        <path d={areaPath} fill="url(#mrrFill)" />
        {/* Line */}
        <path d={linePath} fill="none" stroke="#ff741f" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {/* Points */}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i === points.length - 1 ? 4 : 2.5} fill="#ff741f" />
        ))}
        {/* X-Labels */}
        {MONTHS.map((m, i) => {
          if (i % 2 !== 0 && i !== MONTHS.length - 1) return null;
          const x = padX + (i / (MONTHS.length - 1)) * innerW;
          return (
            <text key={m} x={x} y={h - 6} textAnchor="middle" className="fill-muted-foreground" fontSize="9">
              {m}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

export function ChurnChart() {
  const retention = 96.8;
  const churn = 100 - retention;
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const retentionDash = (retention / 100) * circumference;

  return (
    <div className="card-base p-5">
      <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <RefreshCcw className="h-3.5 w-3.5" />
        Retention vs. Churn
      </h3>
      <div className="mt-4 flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#10b981"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${retentionDash.toFixed(2)} ${circumference.toFixed(2)}`}
          />
        </svg>
        <div className="flex-1 space-y-2 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-profit" />
              Retention
            </span>
            <span className="font-mono font-semibold">{retention.toFixed(1).replace(".", ",")} %</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-loss" />
              Churn (30d)
            </span>
            <span className="font-mono font-semibold">{churn.toFixed(1).replace(".", ",")} %</span>
          </div>
          <div className="border-t border-border pt-2 text-[11px] text-muted-foreground">
            Ziel: &lt; 5 % Churn — aktuell <span className="font-semibold text-profit">unter Ziel</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const PRODUCT_MIX: { label: string; value: number; color: string }[] = [
  { label: "Starter Depot", value: 28, color: "#ff741f" },
  { label: "Trend Depot", value: 34, color: "#0ea5e9" },
  { label: "Stillhalter Depot", value: 21, color: "#10b981" },
  { label: "Trader Cockpit", value: 9, color: "#f59e0b" },
  { label: "All-Access", value: 17, color: "#8b5cf6" },
];

export function ProductMixChart() {
  const total = PRODUCT_MIX.reduce((s, p) => s + p.value, 0);
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  let acc = 0;
  const segments = PRODUCT_MIX.map((p) => {
    const fraction = p.value / total;
    const dash = fraction * circumference;
    const offset = (acc / total) * circumference;
    acc += p.value;
    return { ...p, dash, offset };
  });

  return (
    <div className="card-base p-5">
      <h3 className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        <PieIcon className="h-3.5 w-3.5" />
        Produkt-Mix (aktive Subscriptions)
      </h3>
      <div className="mt-4 flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
          {segments.map((s) => (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth="14"
              strokeDasharray={`${s.dash.toFixed(2)} ${(circumference - s.dash).toFixed(2)}`}
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
