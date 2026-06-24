"use client";
import { useState } from "react";
import { ExternalLink } from "lucide-react";
import type { EquityMonth, OpenPositionRow, PortfolioSnapshot, PositionGroup } from "@traderiq/api";
import { VTJ } from "@traderiq/api";
import { PortfolioDashboard } from "./PortfolioDashboard";

interface VTJProps {
  data: PortfolioSnapshot;
  equity: EquityMonth[];
  openPositions: OpenPositionRow[];
  positionGroup: PositionGroup;
}

const TABS = [
  { id: "uebersicht", label: "Depotübersicht" },
  { id: "rendite", label: "Renditen & Cashflow" },
  { id: "offen", label: "Offene Positionen" },
  { id: "geschlossen", label: "Geschlossene Positionen" },
  { id: "waehrung", label: "Währungs-Positionen" },
  { id: "apa", label: "APA" },
] as const;

const eur = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const usd = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const pct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2).replace(".", ",")} %`;

export function VisualTradingJournal({ data, equity, openPositions, positionGroup }: VTJProps) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("uebersicht");

  return (
    <div className="card-base overflow-hidden">
      {/* Tab-Bar im VTJ-Stil */}
      <div className="flex flex-wrap items-center gap-0 border-b border-border bg-muted/30">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-xs font-semibold transition ${
              tab === t.id
                ? "border-b-2 border-brand bg-card text-foreground"
                : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto pr-3 text-xs text-muted-foreground">
          Quelle: <a href={VTJ.affiliateUrl} target="_blank" rel="noreferrer" className="font-semibold text-brand hover:underline">Visual Trading Journal</a> · {VTJ.affiliateNote}
        </div>
      </div>

      <div className="p-4">
        {tab === "uebersicht" && <PortfolioDashboard data={data} />}
        {tab === "rendite" && <RenditenCashflow rows={equity} />}
        {tab === "offen" && <OpenPositionsTable rows={openPositions} />}
        {tab === "geschlossen" && (
          <div className="rounded-md border border-dashed border-border p-6 text-sm text-muted-foreground">
            Demo-Platzhalter: Vollständige Liste geschlossener Positionen folgt nach VTJ-API-Anbindung (Phase 2).
            Tipp: <button onClick={() => setTab("apa")} className="font-semibold text-brand hover:underline">APA-Beispiel</button> zeigt eine vollständige Trade-Historie eines Underlyings.
          </div>
        )}
        {tab === "waehrung" && <CurrencyPositions />}
        {tab === "apa" && <PositionDetail group={positionGroup} />}
      </div>
    </div>
  );
}

// ─── Renditen & Cashflow (Equity-Bars + Linie + Tabelle) ──────────────────

function RenditenCashflow({ rows }: { rows: EquityMonth[] }) {
  return (
    <div className="space-y-4">
      <EquityChart rows={rows} />
      <CashflowTable rows={rows} />
    </div>
  );
}

function EquityChart({ rows }: { rows: EquityMonth[] }) {
  if (rows.length === 0) return null;
  const W = 1100;
  const H = 280;
  const PAD_L = 50;
  const PAD_R = 60;
  const PAD_Y = 30;

  const equities = rows.map((r) => r.equity);
  const cashflows = rows.map((r) => r.cashflowOptionen + r.cashflowAktien);
  const minEq = Math.min(...equities) * 0.92;
  const maxEq = Math.max(...equities) * 1.05;
  const eqRange = maxEq - minEq;
  const maxCf = Math.max(...cashflows.map((c) => Math.abs(c)), 1);

  const slotW = (W - PAD_L - PAD_R) / rows.length;
  const xCenter = (i: number) => PAD_L + slotW * (i + 0.5);
  const yEq = (v: number) => PAD_Y + (1 - (v - minEq) / eqRange) * (H - 2 * PAD_Y);
  const yCfMid = H / 2 + 24;
  const cfBarH = (cf: number) => (Math.abs(cf) / maxCf) * 60;

  const linePath = rows
    .map((r, i) => `${i === 0 ? "M" : "L"} ${xCenter(i)} ${yEq(r.equity)}`)
    .join(" ");

  const last = rows[rows.length - 1]!;
  const first = rows[0]!;
  const totalChange = ((last.equity - first.equity) / first.equity) * 100;

  return (
    <div className="card-base p-4">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Depotwert (NLV) · 24 Monate</div>
          <div className="mt-1 flex items-baseline gap-3">
            <span className="text-2xl font-extrabold">{eur(last.equity)}</span>
            <span className={`text-sm font-semibold ${totalChange >= 0 ? "text-profit" : "text-loss"}`}>
              {pct(totalChange)} kumuliert
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-3 rounded-sm bg-emerald-500" /> Equity-Linie
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-3 rounded-sm bg-sky-400/70" /> Cashflow-Bars (positiv)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-3 rounded-sm bg-rose-400/70" /> Cashflow-Bars (negativ)
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="block min-w-[700px] w-full" preserveAspectRatio="none" role="img">
          {/* Y-grid */}
          {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
            <g key={i}>
              <line
                x1={PAD_L}
                x2={W - PAD_R}
                y1={PAD_Y + t * (H - 2 * PAD_Y)}
                y2={PAD_Y + t * (H - 2 * PAD_Y)}
                className="stroke-border"
                strokeWidth="0.4"
                strokeDasharray="3,3"
              />
              <text x={PAD_L - 6} y={PAD_Y + t * (H - 2 * PAD_Y) + 3} fontSize="9" textAnchor="end" className="fill-muted-foreground">
                {((maxEq - t * eqRange) / 1000).toFixed(0)}k
              </text>
            </g>
          ))}

          {/* Cashflow bars (centered around middle) */}
          {rows.map((r, i) => {
            const cf = r.cashflowOptionen + r.cashflowAktien;
            if (cf === 0) return null;
            const h = cfBarH(cf);
            const x = xCenter(i) - slotW * 0.32;
            const y = cf >= 0 ? yCfMid - h : yCfMid;
            const w = slotW * 0.64;
            const fill = cf >= 0 ? "rgba(56, 189, 248, 0.55)" : "rgba(244, 114, 182, 0.55)";
            return <rect key={`cf_${i}`} x={x} y={y} width={w} height={h} fill={fill} />;
          })}

          {/* Equity line */}
          <path d={linePath} stroke="#10b981" strokeWidth="2.5" fill="none" />
          {rows.map((r, i) => (
            <circle key={`d_${i}`} cx={xCenter(i)} cy={yEq(r.equity)} r="2.6" fill="#10b981" />
          ))}

          {/* X-axis labels */}
          {rows.map((r, i) => (
            <text key={`lbl_${i}`} x={xCenter(i)} y={H - 8} textAnchor="middle" fontSize="9" className="fill-muted-foreground">
              {i % 2 === 0 ? r.month : ""}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}

function CashflowTable({ rows }: { rows: EquityMonth[] }) {
  const recent = [...rows].reverse().slice(0, 12);
  return (
    <div className="card-base overflow-hidden">
      <div className="border-b border-border bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Cashflow-Auswertung · letzte 12 Monate
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2">Monat</th>
              <th className="px-3 py-2 text-right">Depotwert</th>
              <th className="px-3 py-2 text-right">Δ Monat</th>
              <th className="px-3 py-2 text-right">Trades</th>
              <th className="px-3 py-2 text-right">Optionen</th>
              <th className="px-3 py-2 text-right">Aktien</th>
              <th className="px-3 py-2 text-right">Dividenden</th>
              <th className="px-3 py-2 text-right">Zinsen</th>
              <th className="px-3 py-2 text-right">Steuern</th>
              <th className="px-3 py-2 text-right">Gebühren</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {recent.map((r) => (
              <tr key={r.month} className="hover:bg-accent/40">
                <td className="px-3 py-2 font-semibold">{r.month}</td>
                <td className="px-3 py-2 text-right font-mono">{eur(r.equity)}</td>
                <td className={`px-3 py-2 text-right font-mono font-semibold ${r.monthlyChangePercent >= 0 ? "text-profit" : "text-loss"}`}>
                  {pct(r.monthlyChangePercent)}
                </td>
                <td className="px-3 py-2 text-right font-mono">{r.trades}</td>
                <td className="px-3 py-2 text-right font-mono text-profit">{eur(r.cashflowOptionen)}</td>
                <td className="px-3 py-2 text-right font-mono text-profit">{eur(r.cashflowAktien)}</td>
                <td className="px-3 py-2 text-right font-mono">{eur(r.dividenden)}</td>
                <td className="px-3 py-2 text-right font-mono">{eur(r.zinsen)}</td>
                <td className="px-3 py-2 text-right font-mono text-loss">{eur(r.steuern)}</td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{eur(r.gebuehren)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Offene Positionen Tabelle ────────────────────────────────────────────

const RISK_COLOR: Record<"A" | "B" | "C" | "D", string> = {
  A: "bg-emerald-500/15 text-emerald-700",
  B: "bg-amber-500/15 text-amber-700",
  C: "bg-orange-500/15 text-orange-700",
  D: "bg-red-500/15 text-red-700",
};

function OpenPositionsTable({ rows }: { rows: OpenPositionRow[] }) {
  const totalMV = rows.reduce((a, r) => a + r.marketValue, 0);
  const totalUnreal = rows.reduce((a, r) => a + r.unrealized, 0);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-brand">Offene Positionen ({rows.length})</div>
          <div className="text-xs text-muted-foreground">Sortiert nach Marktwert</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Marktwert · Unrealized</div>
          <div className="text-sm font-mono font-bold">
            {eur(totalMV)} <span className={totalUnreal >= 0 ? "text-profit" : "text-loss"}>· {eur(totalUnreal)}</span>
          </div>
        </div>
      </div>
      <div className="card-base overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2">Ticker</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Typ</th>
              <th className="px-3 py-2">Risiko</th>
              <th className="px-3 py-2 text-right">Stück</th>
              <th className="px-3 py-2 text-right">Ø Preis</th>
              <th className="px-3 py-2 text-right">Letzter</th>
              <th className="px-3 py-2 text-right">Marktwert</th>
              <th className="px-3 py-2 text-right">Unrealized</th>
              <th className="px-3 py-2 text-right">+/-</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[...rows].sort((a, b) => b.marketValue - a.marketValue).map((r) => (
              <tr key={r.ticker} className="hover:bg-accent/40">
                <td className="px-3 py-2 font-mono font-bold text-brand">{r.ticker}</td>
                <td className="px-3 py-2">{r.company}</td>
                <td className="px-3 py-2"><span className="badge-base">{r.type}</span></td>
                <td className="px-3 py-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${RISK_COLOR[r.riskBucket]}`}>{r.riskBucket}</span>
                </td>
                <td className="px-3 py-2 text-right font-mono">{r.shares}</td>
                <td className="px-3 py-2 text-right font-mono">{usd(r.avgPrice)}</td>
                <td className="px-3 py-2 text-right font-mono">{usd(r.lastPrice)}</td>
                <td className="px-3 py-2 text-right font-mono">{eur(r.marketValue)}</td>
                <td className={`px-3 py-2 text-right font-mono ${r.unrealized >= 0 ? "text-profit" : "text-loss"}`}>
                  {eur(r.unrealized)}
                </td>
                <td className={`px-3 py-2 text-right font-mono font-semibold ${r.unrealizedPercent >= 0 ? "text-profit" : "text-loss"}`}>
                  {pct(r.unrealizedPercent)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CurrencyPositions() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[
        { code: "USD", label: "US-Dollar", balance: 32744, change: 0.4, marketValue: 30142 },
        { code: "EUR", label: "Euro", balance: 12480, change: 0.0, marketValue: 12480 },
        { code: "CHF", label: "Schweizer Franken", balance: 0, change: 0, marketValue: 0 },
      ].map((c) => (
        <div key={c.code} className="card-base p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-lg font-bold">{c.code}</div>
              <div className="text-xs text-muted-foreground">{c.label}</div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-semibold">{eur(c.marketValue)}</div>
              <div className="text-xs text-muted-foreground">Saldo: {c.balance.toLocaleString("de-DE")} {c.code}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── APA-Style Trade-Historie ─────────────────────────────────────────────

const ACTION_BG: Record<string, string> = {
  Buy: "bg-emerald-500/15 text-emerald-700",
  Sell: "bg-rose-500/15 text-rose-700",
  Verfallen: "bg-amber-500/15 text-amber-700",
  Steuern: "bg-slate-500/15 text-slate-700",
  Dividende: "bg-sky-500/15 text-sky-700",
  Zinsen: "bg-purple-500/15 text-purple-700",
};

const TYPE_BG: Record<string, string> = {
  Aktie: "bg-emerald-100 text-emerald-700",
  Call: "bg-orange-100 text-orange-700",
  Put: "bg-amber-100 text-amber-700",
  ETF: "bg-blue-100 text-blue-700",
  Fonds: "bg-purple-100 text-purple-700",
};

function PositionDetail({ group }: { group: PositionGroup }) {
  return (
    <div>
      {/* Header analog Screenshot */}
      <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-b border-border pb-3">
        <span className="font-mono text-2xl font-bold">{group.ticker}</span>
        <span className="font-mono text-lg font-semibold text-muted-foreground">/ {usd(group.lastPrice)}</span>
        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{group.company}</span>
        <span className={`ml-auto text-base font-bold ${group.profitTotal >= 0 ? "text-profit" : "text-loss"}`}>
          Profit: {usd(group.profitTotal)} ({pct(group.profitPercent)})
        </span>
      </div>

      <div className="mb-3 flex flex-wrap gap-2 text-xs">
        <span className="rounded-md bg-emerald-500/15 px-2 py-1 font-mono font-semibold text-emerald-700">+ {group.openCallPercent}% offene Calls</span>
        <span className="rounded-md bg-amber-500/15 px-2 py-1 font-mono font-semibold text-amber-700">{group.openPutPercent}% offene Puts</span>
        <span className="rounded-md bg-sky-500/15 px-2 py-1 font-mono font-semibold text-sky-700">{group.closedPercent}% geschlossen</span>
        <span className="rounded-md bg-muted px-2 py-1 font-mono">Investiert: {usd(group.invested)}</span>
        <span className="rounded-md bg-muted px-2 py-1 font-mono">Kapitalbedarf: {usd(group.capitalNeed)}</span>
      </div>

      <div className="card-base overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2">Symbol</th>
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Aktion</th>
              <th className="px-3 py-2">Typ</th>
              <th className="px-3 py-2 text-right">Anzahl</th>
              <th className="px-3 py-2 text-right">Cashflow / Aktie</th>
              <th className="px-3 py-2 text-right">Realisiert</th>
              <th className="px-3 py-2 text-right">Gebühren</th>
              <th className="px-3 py-2 text-right">Effektiver Einstieg</th>
              <th className="px-3 py-2 text-right">∅ Kaufwert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {group.rows.map((r, i) => (
              <tr key={i} className="hover:bg-accent/40">
                <td className="px-3 py-2 font-mono font-bold text-brand">{r.ticker}</td>
                <td className="px-3 py-2 font-mono text-muted-foreground">{r.date}</td>
                <td className="px-3 py-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${ACTION_BG[r.action] ?? "bg-muted"}`}>{r.action}</span>
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${TYPE_BG[r.type] ?? "bg-muted"}`}>{r.type}</span>
                </td>
                <td className="px-3 py-2 text-right font-mono">{r.shares}</td>
                <td className={`px-3 py-2 text-right font-mono ${r.cashflowPerShare >= 0 ? "text-profit" : "text-loss"}`}>
                  {r.cashflowPerShare ? `${r.cashflowPerShare >= 0 ? "+" : ""}${r.cashflowPerShare.toFixed(2)}` : "-"}
                </td>
                <td className="px-3 py-2 text-right font-mono">{usd(r.realizedTotal)}</td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{r.fees ? `${r.fees.toFixed(2)} $` : "-"}</td>
                <td className="px-3 py-2 text-right font-mono">{usd(r.effectivePrice)}</td>
                <td className="px-3 py-2 text-right font-mono text-muted-foreground">{usd(r.effectivePriceAfter)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Daten aus unserem Excel-Trade-Journal („Anlegerclub Trade Journals.xlsx", Arbeitsblatt APA).
        Phase 2: Live-Anbindung an das Visual Trading Journal — keine manuelle Pflege mehr.
      </p>
    </div>
  );
}
