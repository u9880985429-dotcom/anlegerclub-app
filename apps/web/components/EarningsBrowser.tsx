"use client";
import { memo, useMemo, useState } from "react";
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

const EarningsCard = memo(function EarningsCard({ entry }: { entry: EarningsEntry }) {
  const isUp = entry.changeSinceLastEarnings >= 0;
  const reportDate = new Date(entry.date);
  const formatted = reportDate.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  return (
    <article className="card-base p-4">
      {/* Top-row: identity + key metrics */}
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xl font-bold text-brand">{entry.ticker}</span>
            <span className="text-sm text-muted-foreground">{entry.company}</span>
          </div>
          <div className="mt-1 text-sm">
            <span className="font-semibold">{formatted}</span>
            <span className="ml-1 text-xs text-muted-foreground">
              {entry.timeOfDay === "BMO" ? "vor Open" : entry.timeOfDay === "AMC" ? "nach Close" : ""}
            </span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">
              EPS-E <span className="font-mono">{entry.estimateEPS?.toFixed(2) ?? "—"}</span>
              {entry.actualEPS !== null && (
                <>
                  {" / "}
                  EPS-A <span className="font-mono">{entry.actualEPS.toFixed(2)}</span>
                </>
              )}
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="font-mono text-lg font-bold">{entry.lastPrice.toFixed(2)} USD</div>
          <div className={`mt-0.5 inline-flex items-center gap-1 text-xs font-semibold ${isUp ? "text-profit" : "text-loss"}`}>
            {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isUp ? "+" : ""}
            {entry.changeSinceLastEarnings.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Charts row: candlestick (full width) + IV (right column on lg) */}
      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        <div className="min-w-0">
          <CandlestickChart values={entry.priceHistory} positive={isUp} />
        </div>
        <div className="lg:border-l lg:border-border lg:pl-4">
          <IVPanel value={entry.impliedVolatility} priceHistory={entry.priceHistory} />
        </div>
      </div>
    </article>
  );
});

/**
 * IV als Stand-Alone-Chart-Visualisierung — ohne Farb-Bewertung,
 * da hohe IV je nach Strategie wünschenswert sein kann (Stillhalter)
 * oder unerwünscht (Trend-Käufer).
 *
 * Wir leiten eine simulierte IV-Kurve aus der Preis-Historie ab (rolling stddev)
 * und rendern Balken neben dem Spotwert. Die Farbe ist neutral (Brand-Orange).
 */
const IVPanel = memo(function IVPanel({ value, priceHistory }: { value: number; priceHistory: number[] }) {
  // Teure Ableitung der IV-Kurve (rolling stddev + Skalierung) memoisieren —
  // unveraendert solange value/priceHistory gleich bleiben.
  const { series, max, xTicks } = useMemo(() => {
    const xTicks = buildXTicks(priceHistory.length, 3);
    // Simulierte IV-Kurve aus rolling stddev (10 Werte) der Preis-Historie.
    const rolling: number[] = [];
    const WIN = 10;
    for (let i = 0; i < priceHistory.length; i++) {
      const slice = priceHistory.slice(Math.max(0, i - WIN), i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / slice.length;
      const v = Math.sqrt(slice.reduce((a, b) => a + (b - mean) ** 2, 0) / slice.length);
      rolling.push((v / Math.max(mean, 1)) * 100);
    }
    const lastRoll = rolling[rolling.length - 1] ?? 1;
    const factor = value / Math.max(lastRoll, 0.01);
    const series = rolling.map((r) => Math.max(r * factor, 0.5));
    const max = Math.max(...series, 1);
    return { series, max, xTicks };
  }, [value, priceHistory]);
  return (
    <div>
      <div className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Implizite Volatilität</div>
      <div className="flex h-72 w-full items-end gap-[2px]">
        {series.map((v, i) => (
          <span
            key={i}
            className="block flex-1 rounded-sm bg-brand/70"
            style={{ height: `${(v / max) * 100}%` }}
          />
        ))}
      </div>
      {/* Datums-Ticks unter der IV-Bar */}
      <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
        {xTicks.map((t, i) => (
          <span key={i} className="font-mono">{t.label}</span>
        ))}
      </div>
      <div className="mt-2 flex items-baseline justify-between text-xs">
        <span className="text-muted-foreground">aktuell</span>
        <span className="font-mono text-base font-bold text-foreground">{value.toFixed(1).replace(".", ",")} %</span>
      </div>
    </div>
  );
});

/**
 * Candlestick-Chart — wie auf trendspider.com gezeigt.
 * Body = Open→Close (grün/rot), Wick = High/Low.
 * 1 Kerze = 1 Handelstag seit dem letzten Earnings (≈ 60 Kerzen / 12 Wochen).
 */
/**
 * Berechnet 4–5 Datumsticks für die X-Achse, dynamisch je Spanne.
 * - ≤ 7 Tage: täglich (TT.MM)
 * - 8–35 Tage: wöchentlich (TT.MM)
 * - 36–120 Tage: ~bi-weekly (TT.MM)
 * - > 120 Tage: monatlich (MM.JJ)
 *
 * Letzte Kerze = "heute"; jede Kerze = 1 Handelstag (≈ 1,4 Kalendertage).
 */
function buildXTicks(numCandles: number, count = 5): { ratio: number; label: string }[] {
  const totalCalendarDays = Math.round(numCandles * 1.4);
  const today = new Date();
  const ticks: { ratio: number; label: string }[] = [];
  const useMonthly = totalCalendarDays > 120;

  for (let k = 0; k < count; k++) {
    const ratio = k / (count - 1);
    const calendarDaysBack = Math.round((1 - ratio) * totalCalendarDays);
    const d = new Date(today);
    d.setDate(d.getDate() - calendarDaysBack);
    const label = useMonthly
      ? d.toLocaleDateString("de-DE", { month: "2-digit", year: "2-digit" })
      : d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
    ticks.push({ ratio, label });
  }
  return ticks;
}

const CandlestickChart = memo(function CandlestickChart({ values }: { values: number[]; positive: boolean }) {
  const W = 640;
  const H = 380;
  const PAD_X = 30;
  const PAD_Y = 12;
  const PAD_BOTTOM = 28; // Platz für Datumsticks unten

  // Teure OHLC-/Achsen-Ableitung memoisieren — haengt nur von `values` ab.
  const { candles, sy, slotW, bodyW, yTicks, xTicks, xAxisY } = useMemo(() => {
    // OHLC pro Tag: Open = Vortages-Close, Close = aktueller Tag.
    // High/Low werden synthetisch aus der lokalen Range geschätzt.
    type Candle = { o: number; h: number; l: number; c: number };
    const candles: Candle[] = [];
    for (let i = 1; i < values.length; i++) {
      const o = values[i - 1]!;
      const c = values[i]!;
      const range = Math.abs(c - o);
      const intradayWick = range * 0.5 + c * 0.0035;
      const h = Math.max(o, c) + intradayWick;
      const l = Math.min(o, c) - intradayWick;
      candles.push({ o, h, l, c });
    }

    const allValues = candles.flatMap((c) => [c.h, c.l]);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const range = max - min || 1;

    const plotH = H - PAD_Y - PAD_BOTTOM;
    const sy = (v: number) => PAD_Y + (1 - (v - min) / range) * plotH;
    const slotW = (W - 2 * PAD_X) / candles.length;
    const bodyW = Math.max(slotW * 0.66, 2);

    // Y-axis ticks (Preisachse links)
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
      y: PAD_Y + t * plotH,
      val: max - t * range,
    }));

    // X-axis ticks (Datumsachse unten)
    const xTicks = buildXTicks(values.length, 5);
    const xAxisY = PAD_Y + plotH;

    return { candles, sy, slotW, bodyW, yTicks, xTicks, xAxisY };
  }, [values]);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>Kursverlauf seit letzten Earnings · {candles.length} Handelstage</span>
        <span className="font-mono normal-case tracking-normal">{candles[0]?.o.toFixed(2)} → {candles[candles.length - 1]?.c.toFixed(2)} USD</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block h-80 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Candlestick chart"
      >
        {/* Y-grid + Preisachse links */}
        {yTicks.map((t, i) => (
          <g key={`y_${i}`}>
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={t.y}
              y2={t.y}
              className="stroke-border"
              strokeWidth="0.4"
              strokeDasharray="3,3"
            />
            <text x={PAD_X - 4} y={t.y + 3} fontSize="9" textAnchor="end" className="fill-muted-foreground">
              {t.val.toFixed(2)}
            </text>
          </g>
        ))}

        {/* X-Achse: horizontale Trennlinie + Datumsticks */}
        <line
          x1={PAD_X}
          x2={W - PAD_X}
          y1={xAxisY}
          y2={xAxisY}
          className="stroke-border"
          strokeWidth="0.6"
        />
        {xTicks.map((t, i) => {
          const x = PAD_X + t.ratio * (W - 2 * PAD_X);
          const anchor = i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle";
          return (
            <g key={`x_${i}`}>
              <line x1={x} x2={x} y1={xAxisY - 2} y2={xAxisY + 3} className="stroke-muted-foreground" strokeWidth="0.6" />
              <text x={x} y={xAxisY + 16} fontSize="10" textAnchor={anchor} className="fill-muted-foreground">
                {t.label}
              </text>
            </g>
          );
        })}
        {candles.map((c, i) => {
          const x = PAD_X + i * slotW + (slotW - bodyW) / 2;
          const cx = x + bodyW / 2;
          const isBullish = c.c >= c.o;
          const fill = isBullish ? "#10b981" : "#ef4444";
          const top = sy(Math.max(c.o, c.c));
          const bottom = sy(Math.min(c.o, c.c));
          const wickTop = sy(c.h);
          const wickBottom = sy(c.l);
          return (
            <g key={i}>
              <line x1={cx} x2={cx} y1={wickTop} y2={wickBottom} stroke={fill} strokeWidth="0.8" />
              <rect
                x={x}
                y={top}
                width={bodyW}
                height={Math.max(bottom - top, 1)}
                fill={fill}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
});
