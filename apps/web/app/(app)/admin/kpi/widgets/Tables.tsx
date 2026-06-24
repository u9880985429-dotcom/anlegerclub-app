"use client";
import type { WidgetData } from "./types";

/**
 * Tabellen-Widgets.
 * Inspiriert von:
 *  - Email-Marketing-Campaign-Tabelle (Excel-KPI-Dashboard)
 *  - Latest Income / Last 10 Balances (Personal-Finance-Card)
 *  - Top Trade-Signale nach Engagement (eigene Mock)
 */

/** Cohort-Retention-Tabelle. */
export function CohortRetentionTable() {
  const cohorts = [
    { month: "Nov 25", initial: 42, m1: 95, m2: 88, m3: 82, m4: 79, m5: 77 },
    { month: "Dez 25", initial: 51, m1: 96, m2: 89, m3: 84, m4: 80, m5: null },
    { month: "Jan 26", initial: 38, m1: 92, m2: 85, m3: 81, m4: null, m5: null },
    { month: "Feb 26", initial: 64, m1: 94, m2: 88, m3: null, m4: null, m5: null },
    { month: "Mär 26", initial: 47, m1: 96, m2: null, m3: null, m4: null, m5: null },
    { month: "Apr 26", initial: 14, m1: null, m2: null, m3: null, m4: null, m5: null },
  ];
  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Kohorten-Retention</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-2 py-1.5">Cohort</th>
              <th className="px-2 py-1.5 text-right">Start</th>
              <th className="px-2 py-1.5 text-right">M+1</th>
              <th className="px-2 py-1.5 text-right">M+2</th>
              <th className="px-2 py-1.5 text-right">M+3</th>
              <th className="px-2 py-1.5 text-right">M+4</th>
              <th className="px-2 py-1.5 text-right">M+5</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cohorts.map((c) => (
              <tr key={c.month}>
                <td className="px-2 py-1.5 font-semibold">{c.month}</td>
                <td className="px-2 py-1.5 text-right font-mono">{c.initial}</td>
                {[c.m1, c.m2, c.m3, c.m4, c.m5].map((v, i) => (
                  <td key={i} className="px-2 py-1.5 text-right">
                    {v === null ? (
                      <span className="text-muted-foreground/40">—</span>
                    ) : (
                      <span
                        className="inline-block rounded px-1.5 py-0.5 font-mono"
                        style={{
                          background: `rgba(16, 185, 129, ${(v / 100) * 0.3})`,
                          color: v >= 90 ? "#059669" : v >= 80 ? "#16a34a" : "#ca8a04",
                        }}
                      >
                        {v}%
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">% der urspruenglichen Kohorte, die nach N Monaten noch aktiv ist.</p>
    </div>
  );
}

/** Top Trade-Signale nach Engagement. */
export function TopTradesTable() {
  const trades = [
    { date: "07.04.2026", title: "AVGO Neuer Kauf, Anpassung Stops", depot: "Trend", views: 1842, comments: 47, reactions: 213 },
    { date: "17.04.2026", title: "CSX, MCD, SLV Take Profit + neue Trades", depot: "Stillhalter", views: 1623, comments: 38, reactions: 184 },
    { date: "15.04.2026", title: "Neuer Kauf VICI", depot: "Starter", views: 1201, comments: 22, reactions: 142 },
    { date: "31.03.2026", title: "Anpassung Stops AMKR/FITB/MRNA/TFC", depot: "Trend", views: 1109, comments: 29, reactions: 119 },
    { date: "19.03.2026", title: "NOW Take Profit + Roll", depot: "Stillhalter", views: 982, comments: 24, reactions: 98 },
  ];
  return (
    <div className="card-base h-full">
      <div className="flex items-start justify-between p-4 pb-0">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top-Trades nach Engagement</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Titel</th>
              <th className="px-3 py-2">Depot</th>
              <th className="px-3 py-2 text-right">Views</th>
              <th className="px-3 py-2 text-right">Kommentare</th>
              <th className="px-3 py-2 text-right">Reaktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {trades.map((t, i) => (
              <tr key={i} className="hover:bg-accent/40">
                <td className="px-3 py-2 font-mono">{t.date}</td>
                <td className="px-3 py-2 font-semibold">{t.title}</td>
                <td className="px-3 py-2"><span className="badge-brand">{t.depot}</span></td>
                <td className="px-3 py-2 text-right font-mono">{t.views.toLocaleString("de-DE")}</td>
                <td className="px-3 py-2 text-right font-mono">{t.comments}</td>
                <td className="px-3 py-2 text-right font-mono">{t.reactions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Latest Subscriptions / Orders — inspiriert von „Latest Income"-Tabelle. */
export function LatestOrdersTable({ data }: { data: WidgetData }) {
  // Phase 1: Mock — Phase 2: aus Ablefy /api/orders + lokal gesyncten Subscriptions.
  const _ = data;
  void _;
  const orders = [
    { date: "27.04.2026", customer: "anna.h@example.com", product: "Stillhalter Depot", amount: 89.0, status: "paid" as const },
    { date: "27.04.2026", customer: "klaus.b@example.com", product: "All-Access", amount: 199.0, status: "paid" as const },
    { date: "26.04.2026", customer: "p.fischer@example.com", product: "Starter Depot", amount: 49.0, status: "refunded" as const },
    { date: "26.04.2026", customer: "j.weiss@example.com", product: "Cockpit", amount: 119.0, status: "paid" as const },
    { date: "25.04.2026", customer: "starter.demo@traderiq.net", product: "Starter Depot", amount: 49.0, status: "paid" as const },
    { date: "25.04.2026", customer: "trend.demo@traderiq.net", product: "Trend Depot", amount: 89.0, status: "open" as const },
  ];
  return (
    <div className="card-base h-full">
      <div className="flex items-start justify-between p-4 pb-0">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Letzte Bestellungen</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2">Datum</th>
              <th className="px-3 py-2">Kunde</th>
              <th className="px-3 py-2">Produkt</th>
              <th className="px-3 py-2 text-right">Betrag</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((o, i) => (
              <tr key={i} className="hover:bg-accent/40">
                <td className="px-3 py-2 font-mono">{o.date}</td>
                <td className="px-3 py-2 font-mono text-xs">{o.customer}</td>
                <td className="px-3 py-2">{o.product}</td>
                <td className="px-3 py-2 text-right font-mono">{o.amount.toFixed(2).replace(".", ",")} €</td>
                <td className="px-3 py-2">
                  <span className={`inline-flex rounded-md px-1.5 py-0.5 text-xs font-semibold ${
                    o.status === "paid" ? "bg-profit/15 text-profit" :
                    o.status === "open" ? "bg-amber-500/15 text-amber-700" :
                    "bg-loss/15 text-loss"
                  }`}>
                    {o.status === "paid" ? "Bezahlt" : o.status === "open" ? "Offen" : "Erstattet"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/** Sales-Performance je Agent — inspiriert von Department-Tabellen im Excel-KPI-Dashboard. */
export function SalesPerformanceTable() {
  const agents = [
    { name: "Sara Verkauf", role: "Sales", deals: 18, revenue: 16020, conversion: 14.2 },
    { name: "Max Bauer", role: "Admin", deals: 7, revenue: 6230, conversion: 8.1 },
    { name: "Andrei Trader IQ", role: "Owner", deals: 4, revenue: 3960, conversion: 6.8 },
  ];
  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sales-Performance · Agent-Vergleich</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-3 py-2">Mitarbeiter</th>
              <th className="px-3 py-2">Rolle</th>
              <th className="px-3 py-2 text-right">Deals</th>
              <th className="px-3 py-2 text-right">Umsatz</th>
              <th className="px-3 py-2 text-right">Conv-Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {agents.map((a) => (
              <tr key={a.name}>
                <td className="px-3 py-2 font-semibold">{a.name}</td>
                <td className="px-3 py-2 text-muted-foreground">{a.role}</td>
                <td className="px-3 py-2 text-right font-mono">{a.deals}</td>
                <td className="px-3 py-2 text-right font-mono">{a.revenue.toLocaleString("de-DE")} €</td>
                <td className="px-3 py-2 text-right font-mono">{a.conversion.toFixed(1).replace(".", ",")} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Status-Verteilung der Subscriptions.
 * Inspiriert vom „Prozentualer Aufgabenstatus"-Donut im PM-Dashboard.
 */
export function SubscriptionStatusBreakdown({ data }: { data: WidgetData }) {
  const total = data.activeMembers + data.pausedMembers + data.expiredMembers;
  const segments = [
    { label: "Aktiv", value: data.activeMembers, color: "#10b981" },
    { label: "Pausiert", value: data.pausedMembers, color: "#f59e0b" },
    { label: "Beendet/Refund", value: data.expiredMembers, color: "#ef4444" },
  ];
  const r = 38;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div className="card-base h-full p-5">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subscription-Status</h3>
      </div>
      <div className="mt-4 flex items-center gap-5">
        <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
          {segments.map((s) => {
            if (total === 0) return null;
            const fraction = s.value / total;
            const dash = fraction * c;
            const offset = (acc / total) * c;
            acc += s.value;
            return (
              <circle
                key={s.label}
                cx="50" cy="50" r={r}
                fill="none"
                stroke={s.color}
                strokeWidth="14"
                strokeDasharray={`${dash.toFixed(2)} ${(c - dash).toFixed(2)}`}
                strokeDashoffset={(-offset).toFixed(2)}
              />
            );
          })}
        </svg>
        <ul className="flex-1 space-y-1.5 text-xs">
          {segments.map((s) => {
            const pct = total > 0 ? (s.value / total) * 100 : 0;
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
 * Leaderboard-Tabelle mit Avatar + Name + Wert + Mini-Bar.
 * Inspiriert von Bild 1 (Q3 Performance „Weekly leaderboard past week").
 */
export function DealsLeaderboard() {
  const rows = [
    { name: "Sara Verkauf", role: "Sales", deals: 18, revenue: 16020, initials: "SV", color: "#7c3aed" },
    { name: "Max Bauer", role: "Admin", deals: 12, revenue: 10460, initials: "MB", color: "#0ea5e9" },
    { name: "Andrei Trader IQ", role: "Owner", deals: 7, revenue: 6230, initials: "AT", color: "#10b981" },
    { name: "Mira Schulz", role: "Moderator", deals: 4, revenue: 3560, initials: "MS", color: "#f59e0b" },
    { name: "Tom Weber", role: "Staff", deals: 2, revenue: 1780, initials: "TW", color: "#ef4444" },
  ];
  const max = rows[0]?.revenue ?? 1;
  return (
    <div className="card-base h-full p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Sales-Leaderboard · Diese Woche
      </h3>
      <div className="space-y-2.5">
        {rows.map((r, i) => {
          const pct = (r.revenue / max) * 100;
          return (
            <div key={r.name} className="flex items-center gap-3">
              <span className="w-5 flex-shrink-0 text-center font-mono text-xs text-muted-foreground">{i + 1}</span>
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: r.color }}
              >
                {r.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-xs font-semibold">{r.name}</span>
                  <span className="font-mono text-xs">
                    <strong>{r.revenue.toLocaleString("de-DE")} €</strong>
                    <span className="ml-1 text-xs text-muted-foreground">· {r.deals} Deals</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: r.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
