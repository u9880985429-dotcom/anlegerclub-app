"use client";
/**
 * Re-Export-Barrel fuer die KPI-Kennzahl-Kacheln.
 *
 * Die Bausteine liegen jetzt in:
 *   - metric-primitives.tsx    (wiederverwendbare Basis-Karten/Gauges/Sparklines)
 *   - metric-cards-simple.tsx  (einfache MetricCard-/MetricListCard-Wrapper)
 *   - metric-cards-visual.tsx  (Gauge-/Sparkline-/Ring-/Strip-Wrapper + YoY-Liste)
 *
 * Diese Datei haelt die bisherigen Import-Pfade (`./MetricCards`) stabil.
 */
export {
  MetricCard, MetricListCard, SparklineCard, GaugeCard, ProgressBarCard, ZoneGauge,
  BigNumberWithSparkline, ThermometerCard, AreaSparklineCard, MetricTrioCompact,
  PercentageRingCard, MultiQuadrantStatsCard, MiniStatsList, ProgressListCard, StatusStripBar,
} from "./metric-primitives";
export {
  MrrCard, ArrCard, ActiveMembersCard, ChurnRateCard, ArpuCard, LtvCard,
  GrossMarginCard, PaymentIssuesCard, RevenueTotalCard, RefundRateCard, VisitorsBreakdownCard,
} from "./metric-cards-simple";
export {
  MrrSparkline, ChurnGauge, ConversionGauge, MonthlyGoalsProgress, ChurnZoneGauge,
  ConversionZoneGauge, RevenueBigNumber, MrrThermometer, PromotionsAreaCard, CompetitorsAreaCard,
  GrowthTrioCard, GoalAchievementRing, MembersQuadrantCard, ProductTrendList, FeatureUsageProgress,
  SubscriptionStatusStrip, YoYHistoryList,
} from "./metric-cards-visual";
