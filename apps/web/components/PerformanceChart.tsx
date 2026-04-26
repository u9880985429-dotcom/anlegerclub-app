import type { DepotPerformance } from "@traderiq/api";

interface PerformanceChartProps {
  data: DepotPerformance;
  title: string;
}

/**
 * Lightweight inline SVG chart in the spirit of Visual Trading Journal:
 * green depot line vs blue benchmark line, with min/max axis hints.
 * No charting library — keeps bundle small + works in SSR.
 */
export function PerformanceChart({ data, title }: PerformanceChartProps) {
  const W = 720;
  const H = 240;
  const PAD_X = 32;
  const PAD_Y = 24;

  const all = data.history.flatMap((p) => [p.depot, p.benchmark]);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  const scaleX = (i: number) =>
    PAD_X + ((W - 2 * PAD_X) * i) / Math.max(data.history.length - 1, 1);
  const scaleY = (v: number) => H - PAD_Y - ((v - min) / range) * (H - 2 * PAD_Y);

  const depotPath = data.history
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i).toFixed(1)} ${scaleY(p.depot).toFixed(1)}`)
    .join(" ");
  const depotArea =
    `M ${scaleX(0).toFixed(1)} ${(H - PAD_Y).toFixed(1)} ` +
    data.history.map((p, i) => `L ${scaleX(i).toFixed(1)} ${scaleY(p.depot).toFixed(1)}`).join(" ") +
    ` L ${scaleX(data.history.length - 1).toFixed(1)} ${(H - PAD_Y).toFixed(1)} Z`;
  const benchPath = data.history
    .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i).toFixed(1)} ${scaleY(p.benchmark).toFixed(1)}`)
    .join(" ");

  return (
    <div className="card-base p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
          <div className="mt-1 text-2xl font-extrabold text-profit">+{data.ytdPercent.toFixed(2).replace(".", ",")} %</div>
          <div className="text-xs text-muted-foreground">
            {data.benchmark.name}: {data.benchmark.ytdPercent >= 0 ? "+" : ""}
            {data.benchmark.ytdPercent.toFixed(2).replace(".", ",")} %
            <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-brand/10 px-1.5 py-0.5 font-semibold text-brand">
              Outperformance +{data.outperformancePercent.toFixed(2).replace(".", ",")} %
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-foreground">
            <span className="inline-block h-2 w-3 rounded-sm bg-emerald-500" /> Depot
          </span>
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="inline-block h-2 w-3 rounded-sm bg-indigo-400" /> {data.benchmark.name}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" preserveAspectRatio="none" role="img" aria-label={title}>
          {/* horizontal grid */}
          {Array.from({ length: 5 }).map((_, i) => {
            const y = PAD_Y + (i * (H - 2 * PAD_Y)) / 4;
            const v = max - (i * range) / 4;
            return (
              <g key={i}>
                <line x1={PAD_X} x2={W - PAD_X} y1={y} y2={y} stroke="currentColor" className="text-border" strokeDasharray="3,3" strokeWidth={1} />
                <text x={W - PAD_X + 4} y={y + 3} className="fill-muted-foreground" fontSize="10">
                  {v.toFixed(0)}%
                </text>
              </g>
            );
          })}
          {/* zero baseline */}
          {min < 0 && max > 0 && (
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={scaleY(0)}
              y2={scaleY(0)}
              className="stroke-foreground/40"
              strokeWidth={1}
            />
          )}

          <defs>
            <linearGradient id="depotFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={depotArea} fill="url(#depotFill)" />
          <path d={depotPath} stroke="#10b981" strokeWidth="2" fill="none" />
          <path d={benchPath} stroke="#6366f1" strokeWidth="1.5" fill="none" strokeDasharray="4,3" />
        </svg>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">{data.highlight}</p>
    </div>
  );
}
