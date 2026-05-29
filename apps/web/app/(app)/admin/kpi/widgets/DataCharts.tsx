"use client";
/**
 * Re-Export-Barrel fuer die KPI-Chart-Widgets.
 *
 * Die Charts liegen — nach Chart-Art gebuendelt — in eigenen Dateien:
 *   - charts-line-area.tsx     (Linien/Flaechen + Combo)
 *   - charts-bars.tsx          (vertikale/horizontale/gruppierte/gestapelte Bars, Waterfall, Histogram)
 *   - charts-pie-donut.tsx     (Donuts/Pies)
 *   - charts-funnel-scatter.tsx (Funnels + Scatter)
 *
 * Gemeinsame Helfer (Produkt-Mapping/Farben) liegen in _chart-utils.ts.
 * Diese Datei haelt die bisherigen Import-Pfade (`./DataCharts`) stabil.
 */
export { RevenueAreaChart, LineRevenueChart, TargetLineChart, ComboBarLineChart } from "./charts-line-area";
export {
  VerticalBarChart, HorizontalBarsChart, GroupedBarChart, YoYCompareBars, TopProductBars,
  StackedVerticalBarsChart, StackedHorizontalBarsChart, WaterfallChart, HistogramChart,
} from "./charts-bars";
export {
  ChurnDonut, ProductMixPie, DonutWithCenterStat, MiniDonutRow, ChurnReasonDonut,
} from "./charts-pie-donut";
export { SalesFunnelChart, FunnelStepsChart, BubbleScatterChart } from "./charts-funnel-scatter";
