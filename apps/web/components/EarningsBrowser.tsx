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
          {filtered.length} von {entries.length} S&amp;P-500-Werten · Filter: nur Aktien ≥ 20 USD.
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
      <div className="grid gap-4 md:grid-cols-[170px_1fr_140px]">
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
          <div className="mt-2 text-xs text-muted-foreground">
            EPS-E: <span className="font-mono">{entry.estimateEPS?.toFixed(2) ?? "—"}</span>
            {entry.actualEPS !== null && (
              <>
                <br />
                EPS-A: <span className="font-mono">{entry.actualEPS.toFixed(2)}</span>
              </>
            )}
          </div>
        </div>

        {/* Center: candlestick chart */}
        <div className="min-w-0">
          <CandlestickChart values={entry.priceHistory} positive={isUp} />
        </div>

        {/* Right: metrics + IV bar (neutral color) */}
        <div className="text-right text-sm">
          <div className="font-mono font-bold">{entry.lastPrice.toFixed(2)} USD</div>
          <div className={`mt-1 inline-flex items-center gap-1 text-xs font-semibold ${isUp ? "text-profit" : "text-loss"}`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? "+" : ""}
            {entry.changeSinceLastEarnings.toFixed(2)}%
          </div>
          <div className="mt-3">
            <IVPanel value={entry.impliedVolatility} priceHistory={entry.priceHistory} />
          </div>
        </div>
      </div>
    </article>
  );
}

/**
 * IV als Stand-Alone-Chart-Visualisierung — ohne Farb-Bewertung,
 * da hohe IV je nach Strategie wünschenswert sein kann (Stillhalter)
 * oder unerwünscht (Trend-Käufer).
 *
 * Wir leiten eine simulierte IV-Kurve aus der Preis-Historie ab (rolling stddev)
 * und rendern Balken neben dem Spotwert. Die Farbe ist neutral (Brand-Orange).
 */
function IVPanel({ value, priceHistory }: { value: number; priceHistory: number[] }) {
  // Simulierte IV-Kurve aus rolling stddev (5 Werte) der Preis-Historie.
  const rolling: number[] = [];
  const W = 4;
  for (let i = 0; i < priceHistory.length; i++) {
    const slice = priceHistory.slice(Math.max(0, i - W), i + 1);
    const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
    const v = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length);
    rolling.push((v / Math.max(mean, 1)) * 100); // Prozent
  }
  // Skalieren so dass aktueller Wert dem `value` entspricht (nur Form-Bewahrung).
  const lastRoll = rolling[rolling.length - 1] ?? 1;
  const factor = value / Math.max(lastRoll, 0.01);
  const series = rolling.map((r) => Math.max(r * factor, 0.5));
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Implizite Volatilität (IV)</div>
      <IVMiniBars values={series} />
      <div className="mt-1 font-mono text-xs font-semibold text-foreground">
        {value.toFixed(1).replace(".", ",")} %
      </div>
    </div>
  );
}

function IVMiniBars({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="mt-1 flex h-7 w-full items-end justify-end gap-[2px]">
      {values.map((v, i) => (
        <span
          key={i}
          className="block w-1 rounded-sm bg-brand/70"
          style={{ height: `${(v / max) * 100}%` }}
        />
      ))}
    </div>
  );
}

/**
 * Candlestick-Chart — wie auf trendspider.com gezeigt.
 * Body = Open→Close (grün/rot), Wick = High/Low.
 * Wir leiten OHLC aus der priceHistory ab (jede Periode = 1 Woche).
 */
function CandlestickChart({ values, positive: _positive }: { values: number[]; positive: boolean }) {
  const W = 320;
  const H = 90;
  const PAD = 4;

  // Build OHLC candles. Each candle uses 2 consecutive history points as open/close,
  // and synthesizes wick from local volatility (±0.6% of close).
  type Candle = { o: number; h: number; l: number; c: number };
  const candles: Candle[] = [];
  for (let i = 1; i < values.length; i++) {
    const o = values[i - 1]!;
    const c = values[i]!;
    const wick = Math.abs(c - o) * 0.6 + c * 0.004;
    const h = Math.max(o, c) + wick;
    const l = Math.min(o, c) - wick;
    candles.push({ o, h, l, c });
  }
  const allValues = candles.flatMap((c) => [c.h, c.l]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;

  const sy = (v: number) => PAD + (1 - (v - min) / range) * (H - 2 * PAD);
  const slotW = (W - 2 * PAD) / candles.length;
  const bodyW = Math.max(slotW * 0.6, 2);

  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        Kursverlauf seit letzten Earnings (Candlesticks)
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-1 block h-20 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Candlestick chart"
      >
        {/* Subtle grid */}
        {[0, 0.5, 1].map((t) => (
          <line
            key={t}
            x1={PAD}
            x2={W - PAD}
            y1={PAD + t * (H - 2 * PAD)}
            y2={PAD + t * (H - 2 * PAD)}
            className="stroke-border"
            strokeWidth="0.5"
          />
        ))}
        {candles.map((c, i) => {
          const x = PAD + i * slotW + (slotW - bodyW) / 2;
          const cx = x + bodyW / 2;
          const isBullish = c.c >= c.o;
          const fill = isBullish ? "#10b981" : "#ef4444";
          const top = sy(Math.max(c.o, c.c));
          const bottom = sy(Math.min(c.o, c.c));
          const wickTop = sy(c.h);
          const wickBottom = sy(c.l);
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={wickTop} y2={wickBottom} stroke={fill} strokeWidth="1" />
              <rect
                x={x}
                y={top}
                width={bodyW}
                height={Math.max(bottom - top, 1.2)}
                fill={fill}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
