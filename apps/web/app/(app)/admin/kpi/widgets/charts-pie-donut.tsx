"use client";
import { RefreshCcw, PieChart as PieIcon } from "lucide-react";
import type { WidgetData } from "./types";
import { PRODUCT_COLORS, PRODUCT_LABEL, bucketizedByProductFromBrowser } from "./_chart-utils";

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
          <div className="border-t border-border pt-2 text-xs text-muted-foreground">
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
 * Donut mit Center-Stat (grosser Wert in der Mitte).
 * Inspiriert vom Yellowfin „Sales by Account Segment 33m".
 */
export function DonutWithCenterStat({ data }: { data: WidgetData }) {
  const PRODUCT_LABEL_LOCAL: Record<string, string> = {
    starter: "Starter",
    trend: "Trend",
    stillhalter: "Stillhalter",
    cockpit: "Cockpit",
    "all-access": "All Access Pass",
  };
  const PRODUCT_COLORS_LOCAL: Record<string, string> = {
    starter: "#ff741f",
    trend: "#0ea5e9",
    stillhalter: "#10b981",
    cockpit: "#f59e0b",
    "all-access": "#8b5cf6",
  };
  const fromAblefy = bucketizedByProductFromBrowser(data.ablefyAggregate?.byProduct);
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
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Gesamt</div>
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
 * Mini-Donut-Row (eine Mini-Donut je Produkt + Mini-Stat).
 * Inspiriert vom Yellowfin „KPIs by Product Category" (Whiskies/Rums/Vodkas/Tequilas).
 */
export function MiniDonutRow({ data }: { data: WidgetData }) {
  const PRODUCT_LABEL_LOCAL: Record<string, string> = {
    starter: "Starter",
    trend: "Trend",
    stillhalter: "Stillhalter",
    cockpit: "Cockpit",
    "all-access": "All Access Pass",
  };
  const PRODUCT_COLORS_LOCAL: Record<string, string> = {
    starter: "#ff741f",
    trend: "#0ea5e9",
    stillhalter: "#10b981",
    cockpit: "#f59e0b",
    "all-access": "#8b5cf6",
  };
  const fromAblefy = bucketizedByProductFromBrowser(data.ablefyAggregate?.byProduct);
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
              <div className="mt-1 text-xs font-semibold">{e.label}</div>
              <div className="font-mono text-xs text-muted-foreground">
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
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Total</div>
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
