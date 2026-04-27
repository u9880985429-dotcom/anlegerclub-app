import { redirect } from "next/navigation";
import {
  TrendingUp, Users, Euro, RefreshCcw, AlertTriangle, Crown,
  ArrowUpRight, ArrowDownRight, Activity,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { requireSession } from "@/lib/access";
import { allSubscriptions, allUsers } from "@traderiq/api";
import { RevenueChart, ChurnChart, ProductMixChart } from "./Charts";
import { KpiCardMenu } from "./KpiCardMenu";

export const dynamic = "force-dynamic";

/**
 * KPI-Dashboard — STRENG VERTRAULICH.
 * Sichtbar nur für OWNER und ADMIN. STAFF/MODERATOR/MEMBER sehen die Sektion nicht
 * im Sidebar-Menü und werden bei direktem URL-Aufruf zurück zur Übersicht geredirectet.
 *
 * Phase 1: Mock-Daten realistisch berechnet.
 * Phase 2: Daten aus DB-Abfragen (MRR via Stripe/Ablefy, Churn via Subscription-History).
 */
export default async function KpiDashboardPage() {
  const session = await requireSession();
  if (session.user.role !== "OWNER" && session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Aktuelle Zahlen aus Mock-Daten
  const activeMembers = allSubscriptions.filter((s) => s.status === "ACTIVE" || s.status === "PAID").length;
  const pausedMembers = allSubscriptions.filter((s) => s.status === "PAUSED").length;
  const expiredMembers = allSubscriptions.filter((s) => s.status === "EXPIRED" || s.status === "REFUNDED").length;
  const totalUsers = allUsers.length;

  // Realistische MRR-Schätzung (Demo): jeder ACTIVE/PAID-User trägt durchschnittlich 89 € MRR bei.
  const avgArpu = 89; // €/Monat pro aktiver User
  const mrr = activeMembers * avgArpu;
  const arr = mrr * 12;
  const newMembersThisMonth = 14; // Mock
  const churnedMembersThisMonth = 3; // Mock
  const churnRate = activeMembers > 0 ? (churnedMembersThisMonth / activeMembers) * 100 : 0;
  const ltv = avgArpu * 18; // 18 Monate durchschnittlich
  const grossMargin = 78.4; // %

  return (
    <>
      <PageHeader
        eyebrow="Admin · KPI"
        title="KPI-Dashboard"
        description="Vertraulich – nur OWNER + ADMIN. Aktualisiert in Phase 2 live aus DB + Stripe/Ablefy."
      />

      <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-brand/40 bg-brand/5 px-3 py-2 text-xs">
        <Crown className="h-4 w-4 text-brand" />
        <span>
          <strong className="text-brand">Vertraulicher Bereich</strong> — sichtbar nur für{" "}
          <strong>OWNER</strong> und <strong>ADMIN</strong>. Andere Rollen sehen nicht einmal den Link in der Sidebar.
        </span>
      </div>

      {/* Top-Level KPI-Kacheln */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="MRR (Monthly Recurring Revenue)"
          value={`${mrr.toLocaleString("de-DE")} €`}
          delta="+8,2 %"
          deltaSentiment="up"
          icon={Euro}
          accent
        />
        <KpiCard
          label="ARR (Annual Run-Rate)"
          value={`${(arr / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })}k €`}
          delta="+12,4 %"
          deltaSentiment="up"
          icon={TrendingUp}
        />
        <KpiCard
          label="Aktive Mitglieder"
          value={String(activeMembers)}
          delta={`+${newMembersThisMonth} diesen Monat`}
          deltaSentiment="up"
          icon={Users}
        />
        <KpiCard
          label="Churn-Rate (30d)"
          value={`${churnRate.toFixed(2).replace(".", ",")} %`}
          delta="-0,3 %"
          deltaSentiment="up"
          icon={RefreshCcw}
        />
      </section>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="ARPU (Avg Revenue / User)" value={`${avgArpu} €/Mo`} icon={Activity} />
        <KpiCard label="LTV (Lifetime-Value)" value={`${ltv.toLocaleString("de-DE")} €`} icon={TrendingUp} />
        <KpiCard label="Gross Margin" value={`${grossMargin}%`} icon={Euro} />
        <KpiCard label="Mitglieder mit Zahlungsproblemen" value={String(pausedMembers)} icon={AlertTriangle} alert={pausedMembers > 0} />
      </section>

      {/* Revenue & Churn Charts */}
      <section className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <ChurnChart />
      </section>

      {/* Product-Mix + Cohort */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <ProductMixChart />
        <CohortRetention />
      </section>

      {/* Realtime Funnel */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Conversion-Funnel (letzte 30 Tage)
        </h2>
        <FunnelView />
      </section>

      {/* Top-Trades Engagement */}
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Top Trade-Signale nach Engagement
        </h2>
        <EngagementTable />
      </section>

      <div className="rounded-md border border-dashed border-border p-4 text-xs text-muted-foreground">
        💡 <strong>Phase 2:</strong> Diese KPIs werden live aus der DB + Ablefy/Stripe-API berechnet.
        Aktuell sind die Mock-Daten an deinen User-Status angelehnt: {totalUsers} User, {activeMembers} aktiv,{" "}
        {pausedMembers} pausiert, {expiredMembers} beendet/erstattet.
      </div>
    </>
  );
}

function KpiCard({
  label,
  value,
  delta,
  deltaSentiment,
  icon: Icon,
  accent,
  alert,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaSentiment?: "up" | "down";
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
  alert?: boolean;
}) {
  return (
    <div className={`card-base p-5 ${accent ? "border-brand/40 bg-brand/5" : ""} ${alert ? "border-amber-500/40 bg-amber-500/5" : ""}`}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className={`flex h-9 w-9 items-center justify-center rounded-md ${accent ? "bg-brand/15 text-brand" : alert ? "bg-amber-500/15 text-amber-700" : "bg-muted text-muted-foreground"}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1">
          {delta && (
            <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${deltaSentiment === "up" ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"}`}>
              {deltaSentiment === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {delta}
            </span>
          )}
          <KpiCardMenu label={label} variant="metric" />
        </div>
      </div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function CohortRetention() {
  const cohorts = [
    { month: "Nov 25", initial: 42, m1: 95, m2: 88, m3: 82, m4: 79, m5: 77 },
    { month: "Dez 25", initial: 51, m1: 96, m2: 89, m3: 84, m4: 80, m5: null },
    { month: "Jan 26", initial: 38, m1: 92, m2: 85, m3: 81, m4: null, m5: null },
    { month: "Feb 26", initial: 64, m1: 94, m2: 88, m3: null, m4: null, m5: null },
    { month: "Mär 26", initial: 47, m1: 96, m2: null, m3: null, m4: null, m5: null },
    { month: "Apr 26", initial: 14, m1: null, m2: null, m3: null, m4: null, m5: null },
  ];
  return (
    <div className="card-base p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Kohorten-Retention</h3>
        <KpiCardMenu label="Kohorten-Retention" variant="table" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
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
      <p className="mt-3 text-[11px] text-muted-foreground">
        % der ursprünglichen Kohorte, die nach N Monaten noch aktiv ist.
      </p>
    </div>
  );
}

function FunnelView() {
  const steps = [
    { label: "Marketing-Splash-Aufrufe", value: 12420, conv: 100 },
    { label: 'Klick auf „Mehr erfahren"', value: 4870, conv: 39.2 },
    { label: "Webinar-Anmeldung", value: 1180, conv: 9.5 },
    { label: "Erst-Bestellung (Ablefy)", value: 142, conv: 1.14 },
    { label: "Erstlogin", value: 138, conv: 1.11 },
    { label: "Onboarding abgeschlossen", value: 121, conv: 0.97 },
  ];
  return (
    <div className="card-base p-5">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Schritt-fuer-Schritt-Conversion</h3>
        <KpiCardMenu label="Conversion-Funnel" variant="chart" />
      </div>
      <div className="space-y-2">
        {steps.map((s, i) => {
          const width = Math.max(20, (s.value / steps[0]!.value) * 100);
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
                  <div
                    className="h-full rounded-md bg-gradient-to-r from-brand to-brand/70 transition-all"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EngagementTable() {
  const trades = [
    { date: "07.04.2026", title: "AVGO Neuer Kauf, Anpassung Stops", depot: "Trend", views: 1842, comments: 47, reactions: 213 },
    { date: "17.04.2026", title: "CSX, MCD, SLV Take Profit + neue Trades", depot: "Stillhalter", views: 1623, comments: 38, reactions: 184 },
    { date: "15.04.2026", title: "Neuer Kauf VICI", depot: "Starter", views: 1201, comments: 22, reactions: 142 },
    { date: "31.03.2026", title: "Anpassung Stops AMKR/FITB/MRNA/TFC", depot: "Trend", views: 1109, comments: 29, reactions: 119 },
    { date: "19.03.2026", title: "NOW Take Profit + Roll", depot: "Stillhalter", views: 982, comments: 24, reactions: 98 },
  ];
  return (
    <div className="card-base">
      <div className="flex items-start justify-between p-4 pb-0">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top-Trades nach Engagement</h3>
        <KpiCardMenu label="Top Trade-Signale" variant="table" />
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
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
