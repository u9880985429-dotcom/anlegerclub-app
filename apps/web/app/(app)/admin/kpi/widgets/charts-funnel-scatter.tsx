"use client";
import type { WidgetData } from "./types";

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
        <p className="mt-0.5 text-xs text-muted-foreground">X = Kommentare · Y = Views · Bubble-Groesse = Reaktionen</p>
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
