import type { PortfolioSnapshot } from "@traderiq/api";

interface PortfolioDashboardProps {
  data: PortfolioSnapshot;
}

const eur = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const num = (n: number) => new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(n);

export function PortfolioDashboard({ data }: PortfolioDashboardProps) {
  const capitalSlices = [
    { label: "Investiert", value: data.capital.invested, color: "#3b82f6" },
    { label: "Gebunden", value: data.capital.bound, color: "#eab308" },
    { label: "Frei", value: data.capital.free, color: "#10b981" },
  ];
  const total = data.totalEquity;

  return (
    <div className="space-y-6">
      <div className="card-base p-5">
        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-brand">VTJ-Style Übersicht</div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold">Depotübersicht</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Live-Anbindung an Visual Trading Journal folgt in Phase 2 (iframe oder Plugin – beides bestätigt).
              Aktuell sind die Werte <span className="font-mono">WERT*PL.HALTER</span> auf Basis unserer Excel-Quelle.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Gesamtdepotwert</div>
            <div className="text-2xl font-extrabold text-brand">{eur(total)}</div>
          </div>
        </div>
      </div>

      {/* Top row: Kapitalübersicht + Tacho-Karten */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card-base p-5 lg:col-span-2">
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Kapitalübersicht</h4>
          <div className="grid items-center gap-6 md:grid-cols-2">
            <DonutChart slices={capitalSlices} centerLabel={eur(total)} centerSubLabel="Gesamt" />
            <div className="space-y-2 text-sm">
              {capitalSlices.map((s) => (
                <div key={s.label} className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-sm" style={{ background: s.color }} />
                    {s.label}
                  </span>
                  <span className="font-mono">{eur(s.value)}</span>
                </div>
              ))}
              <div className="mt-2 border-t border-border pt-2 text-xs text-muted-foreground">
                Gebundenes Kapital = Margin-/Optionsverpflichtungen.<br />
                Freies Kapital = sofort verfügbarer Cash-Bestand.
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Gauge label="Cashquote" value={data.cashQuotePercent} max={100} unit="%" tone={data.cashQuotePercent < 5 ? "warn" : "ok"} hint={data.cashQuotePercent < 5 ? "Eng – wenig Reserve" : "Gut, du hast Reserve"} />
          <Gauge label="Hebel" value={data.leverage} max={4} unit="" tone={data.leverage > 2 ? "warn" : "ok"} hint={data.leverage <= 1 ? "Gut, du bist nicht im Hebel." : data.leverage <= 2 ? "Leichter Hebel" : "Achtung – hoher Hebel"} />
        </div>
      </div>

      {/* Risiko + Branchen */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PieCard title="Risikoverteilung" slices={data.riskBuckets} totalLabel={eur(total)} />
        <PieCard title="Branchenverteilung" slices={data.branches} totalLabel={eur(total)} compact />
      </div>

      {/* Positionen + Asset-Typen */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PieCard title={`Positionsverteilung (${data.positions.length} Positionen)`} slices={data.positions} totalLabel={eur(total)} compact />
        <PieCard title="Asset-Typen" slices={data.assetTypes} totalLabel={eur(total)} compact />
      </div>
    </div>
  );
}

interface Slice {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ slices, centerLabel, centerSubLabel }: { slices: Slice[]; centerLabel: string; centerSubLabel?: string }) {
  const sum = slices.reduce((a, s) => a + s.value, 0);
  const cx = 100, cy = 100, r = 80, ir = 50;
  let start = -Math.PI / 2;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[260px]">
      <svg viewBox="0 0 200 200" className="h-full w-full">
        {slices.map((s, i) => {
          const angle = (s.value / Math.max(sum, 1)) * Math.PI * 2;
          const end = start + angle;
          const large = angle > Math.PI ? 1 : 0;
          const x1 = cx + r * Math.cos(start);
          const y1 = cy + r * Math.sin(start);
          const x2 = cx + r * Math.cos(end);
          const y2 = cy + r * Math.sin(end);
          const ix1 = cx + ir * Math.cos(end);
          const iy1 = cy + ir * Math.sin(end);
          const ix2 = cx + ir * Math.cos(start);
          const iy2 = cy + ir * Math.sin(start);
          const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${ir} ${ir} 0 ${large} 0 ${ix2} ${iy2} Z`;
          start = end;
          return <path key={i} d={path} fill={s.color} stroke="white" strokeWidth="1.5" />;
        })}
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-foreground" fontSize="14" fontWeight="700">{centerLabel}</text>
        {centerSubLabel && (
          <text x={cx} y={cy + 14} textAnchor="middle" className="fill-muted-foreground" fontSize="10">{centerSubLabel}</text>
        )}
      </svg>
    </div>
  );
}

function PieCard({ title, slices, totalLabel, compact }: { title: string; slices: Slice[]; totalLabel: string; compact?: boolean }) {
  const sum = slices.reduce((a, s) => a + s.value, 0);
  return (
    <div className="card-base p-5">
      <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h4>
      <div className="grid gap-4 md:grid-cols-2">
        <DonutChart slices={slices} centerLabel={totalLabel} />
        <div className={`space-y-1.5 text-sm ${compact ? "max-h-[260px] overflow-y-auto pr-1" : ""}`}>
          {slices.map((s) => {
            const pct = (s.value / Math.max(sum, 1)) * 100;
            return (
              <div key={s.label} className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 truncate">
                  <span className="inline-block h-3 w-3 flex-shrink-0 rounded-sm" style={{ background: s.color }} />
                  <span className="truncate">{s.label}</span>
                </span>
                <span className="flex-shrink-0 text-right">
                  <span className="text-xs text-muted-foreground">{pct.toFixed(1).replace(".", ",")}%</span>
                  <span className="ml-2 font-mono text-xs">{num(s.value)} €</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Gauge({ label, value, max, unit, tone, hint }: { label: string; value: number; max: number; unit: string; tone: "ok" | "warn"; hint: string }) {
  const ratio = Math.min(Math.max(value / max, 0), 1);
  const cx = 100, cy = 100, r = 70;
  const startAngle = Math.PI;
  const endAngle = 2 * Math.PI;
  const valueAngle = startAngle + (endAngle - startAngle) * ratio;

  const arc = (from: number, to: number, color: string) => {
    const x1 = cx + r * Math.cos(from);
    const y1 = cy + r * Math.sin(from);
    const x2 = cx + r * Math.cos(to);
    const y2 = cy + r * Math.sin(to);
    const large = to - from > Math.PI ? 1 : 0;
    return <path d={`M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`} stroke={color} strokeWidth="14" fill="none" strokeLinecap="round" />;
  };

  // Background gradient: green → yellow → red
  const seg1End = startAngle + (endAngle - startAngle) * 0.45;
  const seg2End = startAngle + (endAngle - startAngle) * 0.75;

  // Needle
  const nx = cx + (r - 16) * Math.cos(valueAngle);
  const ny = cy + (r - 16) * Math.sin(valueAngle);

  return (
    <div className="card-base p-5">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="relative mx-auto aspect-[2/1] w-full max-w-[260px]">
        <svg viewBox="0 0 200 110" className="h-full w-full">
          {arc(startAngle, seg1End, "#10b981")}
          {arc(seg1End, seg2End, "#eab308")}
          {arc(seg2End, endAngle, "#ef4444")}
          <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#0b0d10" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="6" fill="#0b0d10" />
          <text x={cx} y={cy - 18} textAnchor="middle" className="fill-foreground" fontSize="22" fontWeight="800">
            {value.toFixed(1).replace(".", ",")}{unit}
          </text>
          <text x={20} y={cy + 16} className="fill-muted-foreground" fontSize="9">0</text>
          <text x={180} y={cy + 16} textAnchor="end" className="fill-muted-foreground" fontSize="9">{max}{unit}</text>
        </svg>
      </div>
      <div className={`mt-2 text-center text-xs ${tone === "ok" ? "text-profit" : "text-amber-700"}`}>
        {tone === "ok" ? "✅ " : "⚠️ "}{hint}
      </div>
    </div>
  );
}
