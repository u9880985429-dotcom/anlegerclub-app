"use client";
import { useMemo, useState } from "react";
import { Search, TrendingDown, TrendingUp } from "lucide-react";
import type { EarningsEntry } from "@traderiq/api";

interface EarningsBrowserProps {
  entries: EarningsEntry[];
}

export function EarningsBrowser({ entries }: EarningsBrowserProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) => e.ticker.toLowerCase().includes(q) || e.company.toLowerCase().includes(q),
    );
  }, [entries, query]);

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche nach Symbol (AAPL, NVDA, …) oder Firmenname"
            className="input-base pl-9"
          />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {filtered.length} von {entries.length} Earnings · Filter: nur Aktien ≥ 20 USD, keine Pinksheets.
        </p>
      </div>

      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="card-base p-8 text-center text-sm text-muted-foreground">
            Keine Treffer für „{query}".
          </div>
        )}
        {filtered.map((e) => (
          <EarningsCard key={e.ticker} entry={e} />
        ))}
      </div>
    </div>
  );
}

function EarningsCard({ entry }: { entry: EarningsEntry }) {
  const isUp = entry.changeSinceLastEarnings >= 0;
  const reportDate = new Date(entry.date);
  const formatted = reportDate.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <article className="card-base p-4">
      <div className="grid gap-4 md:grid-cols-[180px_1fr_140px]">
        {/* Left: identity */}
        <div>
          <div className="font-mono text-lg font-bold text-brand">{entry.ticker}</div>
          <div className="text-xs text-muted-foreground">{entry.company}</div>
          <div className="mt-2 text-sm">
            <span className="font-semibold">{formatted}</span>
            <span className="ml-1 text-xs text-muted-foreground">
              {entry.timeOfDay === "BMO" ? "vor Open" : entry.timeOfDay === "AMC" ? "nach Close" : ""}
            </span>
          </div>
        </div>

        {/* Center: chart */}
        <div className="min-w-0">
          <SparkChart values={entry.priceHistory} positive={isUp} />
        </div>

        {/* Right: metrics */}
        <div className="text-right text-sm">
          <div className="font-mono font-bold">{entry.lastPrice.toFixed(2)} USD</div>
          <div className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${isUp ? "text-profit" : "text-loss"}`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? "+" : ""}
            {entry.changeSinceLastEarnings.toFixed(2)}%
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            EPS-E: <span className="font-mono">{entry.estimateEPS?.toFixed(2) ?? "—"}</span>
            {entry.actualEPS !== null && (
              <>
                <br />
                EPS-A: <span className="font-mono">{entry.actualEPS.toFixed(2)}</span>
              </>
            )}
          </div>
          <div className="mt-2 text-xs">
            <span className="badge-base">IV {entry.impliedVolatility.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </article>
  );
}

function SparkChart({ values, positive }: { values: number[]; positive: boolean }) {
  const W = 320;
  const H = 70;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const sx = (i: number) => (W * i) / Math.max(values.length - 1, 1);
  const sy = (v: number) => H - ((v - min) / range) * H;
  const path = values.map((v, i) => `${i === 0 ? "M" : "L"} ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ");
  const area = `M 0 ${H} ` + values.map((v, i) => `L ${sx(i).toFixed(1)} ${sy(v).toFixed(1)}`).join(" ") + ` L ${W} ${H} Z`;
  const stroke = positive ? "#10b981" : "#ef4444";
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Kursverlauf seit letzten Earnings</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 block h-16 w-full" preserveAspectRatio="none" role="img" aria-label="Sparkline">
        <defs>
          <linearGradient id={`grad-${positive ? "up" : "down"}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${positive ? "up" : "down"})`} />
        <path d={path} stroke={stroke} strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}
