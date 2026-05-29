"use client";
import { Users, AlertTriangle } from "lucide-react";
import type { WidgetData } from "./types";
import {
  SparklineCard, GaugeCard, ProgressBarCard, ZoneGauge, BigNumberWithSparkline,
  ThermometerCard, AreaSparklineCard, MetricTrioCompact, PercentageRingCard,
  MultiQuadrantStatsCard, MiniStatsList, ProgressListCard, StatusStripBar,
} from "./metric-primitives";

export function MrrSparkline({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.values(data.ablefyAggregate.byMonth).slice(-12).map((m) => m.revenue)
    : [4200, 4480, 4910, 5150, 5680, 6020, 6510, 7080, 7740, 8390, 9050, 9870];
  const last = series[series.length - 1] ?? 0;
  return <SparklineCard title="MRR · 12-Monats-Trend" value={`${last.toLocaleString("de-DE")} €`} trend="up" data={series} />;
}

export function ChurnGauge({ data }: { data: WidgetData }) {
  const rate = data.activeMembers > 0 ? (data.churnedMembersThisMonth / data.activeMembers) * 100 : 0;
  return <GaugeCard title="Churn-Rate (30d)" value={Number(rate.toFixed(2))} goal={5} unit="%" threshold={{ warn: 4, bad: 6 }} />;
}

export function ConversionGauge() {
  return <GaugeCard title="Conversion-Rate Webinar→Kauf" value={3.4} goal={3.0} unit="%" threshold={{ warn: 2, bad: 1 }} />;
}

export function MonthlyGoalsProgress({ data }: { data: WidgetData }) {
  return (
    <ProgressBarCard
      title="Monats-Ziele · Plan vs. Ist"
      rows={[
        { label: "Neue Mitglieder", actual: data.newMembersThisMonth, goal: 20 },
        { label: "Umsatz (k €)", actual: Math.round((data.activeMembers * data.avgArpu) / 1000), goal: 12 },
        { label: "Trade-Signale", actual: 11, goal: 15 },
        { label: "Webinare", actual: 2, goal: 2 },
      ]}
    />
  );
}

export function ChurnZoneGauge({ data }: { data: WidgetData }) {
  const rate = data.activeMembers > 0 ? (data.churnedMembersThisMonth / data.activeMembers) * 100 : 0;
  return <ZoneGauge title="Churn-Rate (30d)" value={Number(rate.toFixed(2))} goal={5} unit="%" invert />;
}

export function ConversionZoneGauge() {
  return <ZoneGauge title="Conversion-Rate Webinar→Kauf" value={3.4} goal={3.0} unit="%" />;
}

export function RevenueBigNumber({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.entries(data.ablefyAggregate.byMonth).sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([, v]) => v.revenue)
    : [4200, 4480, 4910, 5150, 5680, 6020, 6510, 7080, 7740, 8390, 9050, 9870];
  const total = series.reduce((s, v) => s + v, 0);
  const last = series[series.length - 1] ?? 0;
  const prev = series[series.length - 2] ?? last;
  const pct = prev > 0 ? ((last - prev) / prev) * 100 : 0;
  const abs = last - prev;
  return <BigNumberWithSparkline label="Umsatz YTD · letzter Monat" value={total} variancePct={pct} varianceAbs={abs} series={series} />;
}

export function MrrThermometer({ data }: { data: WidgetData }) {
  const mrr = data.ablefyAggregate ? Math.round(data.ablefyAggregate.totalRevenue / 12) : data.activeMembers * data.avgArpu;
  return <ThermometerCard title="MRR · Goal-Tracking" value={mrr} goal={15000} unit="€" />;
}

export function PromotionsAreaCard({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.values(data.ablefyAggregate.byMonth).slice(-7).map((m) => m.count)
    : [12, 8, 14, 10, 18, 16, 22];
  const first = series[0] ?? 1;
  const last = series[series.length - 1] ?? 0;
  const delta = first > 0 ? ((last - first) / first) * 100 : 0;
  return <AreaSparklineCard title="Neue Anmeldungen · 7-Tage" delta={delta} series={series} color="#10b981" />;
}

export function CompetitorsAreaCard({ data }: { data: WidgetData }) {
  const series = data.ablefyAggregate?.byMonth
    ? Object.values(data.ablefyAggregate.byMonth).slice(-7).map((m) => m.revenue / 100)
    : [320, 280, 410, 380, 520, 480, 610];
  const first = series[0] ?? 1;
  const last = series[series.length - 1] ?? 0;
  const delta = first > 0 ? ((last - first) / first) * 100 : 0;
  return <AreaSparklineCard title="Refund-Rate · Trend" delta={delta} series={series} color="#f59e0b" />;
}

export function GrowthTrioCard({ data }: { data: WidgetData }) {
  const churn = data.activeMembers > 0 ? (data.churnedMembersThisMonth / data.activeMembers) * 100 : 0;
  return (
    <MetricTrioCompact
      title="Wachstum auf einen Blick"
      metrics={[
        { label: "Neue Mitglieder", value: `+${data.newMembersThisMonth}`, color: "#10b981" },
        { label: "Churn (30d)", value: `${churn.toFixed(1).replace(".", ",")}%`, color: churn > 5 ? "#ef4444" : "#f59e0b" },
        { label: "Wachstum YoY", value: "+34%", color: "#ec4899" },
      ]}
    />
  );
}

export function GoalAchievementRing({ data }: { data: WidgetData }) {
  const mrr = data.ablefyAggregate ? Math.round(data.ablefyAggregate.totalRevenue / 12) : data.activeMembers * data.avgArpu;
  const goal = 15000;
  const pct = Math.min(100, (mrr / goal) * 100);
  return <PercentageRingCard title="MRR · Goal-Erfuellung" pct={pct} color={pct >= 100 ? "#10b981" : "#7c3aed"} subtitle={`${mrr.toLocaleString("de-DE")} € von ${goal.toLocaleString("de-DE")} €`} />;
}

export function MembersQuadrantCard({ data }: { data: WidgetData }) {
  return (
    <MultiQuadrantStatsCard
      title="Mitglieder · Status-Quadrant"
      quadrants={[
        { label: "Aktiv", value: String(data.activeMembers), icon: Users, color: "#10b981" },
        { label: "Pausiert", value: String(data.pausedMembers), icon: AlertTriangle, color: "#f59e0b" },
        { label: "Beendet", value: String(data.expiredMembers), icon: AlertTriangle, color: "#ef4444" },
        { label: "Total", value: String(data.totalUsers), icon: Users, color: "#7c3aed" },
      ]}
    />
  );
}

export function ProductTrendList({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  return (
    <MiniStatsList
      title="Produkte · 30-Tage-Trend"
      rows={[
        { label: "All-Access", delta: 12.4, value: "33,8k €" },
        { label: "Trend Depot", delta: 8.2, value: "28,4k €" },
        { label: "Stillhalter", delta: 5.7, value: "22,1k €" },
        { label: "Starter", delta: 3.5, value: "18,2k €" },
        { label: "Cockpit", delta: -2.1, value: "8,9k €" },
      ]}
    />
  );
}

export function FeatureUsageProgress({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  return (
    <ProgressListCard
      title="Feature-Usage · Aktive Mitglieder"
      rows={[
        { label: "Trade-Signale gelesen", pct: 92, color: "#10b981" },
        { label: "Marktupdates geöffnet", pct: 78, color: "#0ea5e9" },
        { label: "Community gepostet", pct: 41, color: "#7c3aed" },
        { label: "Webinare besucht", pct: 33, color: "#f59e0b" },
        { label: "Welcome-Video gesehen", pct: 88, color: "#ec4899" },
      ]}
    />
  );
}

export function SubscriptionStatusStrip({ data }: { data: WidgetData }) {
  return (
    <StatusStripBar
      title="Subscription-Status · Verteilung"
      segments={[
        { label: "Aktiv", value: data.activeMembers, color: "#10b981" },
        { label: "Pausiert", value: data.pausedMembers, color: "#f59e0b" },
        { label: "Beendet", value: data.expiredMembers, color: "#ef4444" },
      ]}
    />
  );
}

/**
 * YoY-History-List — Liste von Jahren/Monaten mit Δ% pro Eintrag.
 * Inspiriert von Bild 5 (Year-over-Year-Liste rechts mit %).
 */
export function YoYHistoryList({ data }: { data: WidgetData }) {
  const _data = data;
  void _data;
  const rows = [
    { label: "Aug 2025 vs Aug 2024", delta: 9 },
    { label: "Jul 2025 vs Jul 2024", delta: 5 },
    { label: "Jun 2025 vs Jun 2024", delta: -3 },
    { label: "Mai 2025 vs Mai 2024", delta: 9 },
    { label: "Apr 2025 vs Apr 2024", delta: 12 },
    { label: "Mär 2025 vs Mär 2024", delta: -2 },
    { label: "Feb 2025 vs Feb 2024", delta: 7 },
    { label: "Jan 2025 vs Jan 2024", delta: 14 },
  ];
  return (
    <div className="card-base h-full p-5">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">YoY-Vergleich · Letzte 8 Monate</div>
      <div className="space-y-1">
        {rows.map((r) => {
          const positive = r.delta >= 0;
          return (
            <div key={r.label} className="flex items-center justify-between gap-2 rounded-sm border-l-2 px-2 py-1 text-xs" style={{ borderLeftColor: positive ? "#10b981" : "#ef4444" }}>
              <span className="font-medium text-muted-foreground">{r.label}</span>
              <span className={`inline-flex items-center gap-1 font-mono font-bold ${positive ? "text-profit" : "text-loss"}`}>
                {positive ? "▲" : "▼"} {positive ? "+" : ""}{r.delta}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
