/**
 * Oeffentliche API des kpi-Moduls ("die Tuer").
 *
 * Vorerst der Layout-Datenzugriff (Prisma gekapselt). In Stufe 6 kommen die
 * KPI-Berechnungen (computeKpiSnapshot, applyKpiFilters) als Service dazu.
 */

export { getKpiLayout, saveKpiLayout, type SaveKpiLayoutInput } from "./layout-repository";

export {
  getRevenueBucketSlug,
  isInternalSubscription,
  filterKpiRelevantSubs,
  aggregateAblefyByProductIntoSlug,
  countSubscriptionsBySlug,
  type SlugBucket,
} from "./bucket";

export {
  detectSwitchers,
  detectReactivations,
  type MatchStrategy,
  type SubSummary,
  type SwitcherEntry,
  type ReactivationEntry,
} from "./anomaly";
