export * from "./types";

export {
  DEMO_PASSWORD,
  allUsers,
  allSubscriptions,
  findUserByEmail,
  findSubscriptionsForUser,
  userHasAccessTo,
} from "./mock/users";

export {
  trendTrades,
  stillhalterTrades,
  starterTrades,
  allTrades,
  getTradesByProduct,
} from "./mock/trades";

export {
  trendReports,
  stillhalterReports,
  starterReports,
  cockpitReports,
  getReportsByProduct,
} from "./mock/reports";

export {
  focusStocks,
  daxMillionaerLessons,
  marketUpdates,
  lexikon,
  allLessons,
  getFocusStockById,
} from "./mock/content";

export {
  communities,
  allPosts,
  allComments,
  reports,
  moderationFlaggedComments,
  getPostsByCommunity,
  getCommunityBySlug,
  getCommunityById,
  getPostById,
  getCommentsByPost,
} from "./mock/community";

export {
  notificationsForUser,
  auditLog,
  getNotificationsForUser,
} from "./mock/notifications";

export { pitchModules, getPitchForAudience } from "./mock/pitch";

export { upcomingEarnings, searchEarnings } from "./mock/earnings";
export type { EarningsEntry } from "./mock/earnings";

export { BROKER, VTJ, STRATEGY_CALL, WEBINAR_STILLHALTER } from "./mock/brokers";

export {
  STARTER_STRATEGY,
  TREND_STRATEGY,
  STILLHALTER_STRATEGY,
  COCKPIT_STRATEGY,
  STARTER_PERFORMANCE,
  TREND_PERFORMANCE,
  STILLHALTER_PERFORMANCE,
} from "./mock/strategies";
export type { DepotPerformance } from "./mock/strategies";

export {
  tradeComments,
  tradeReactions,
  getCommentsByTrade,
  getReactionsByTrade,
  getTradeById,
} from "./mock/tradeComments";

export {
  PROFANITY_WORDS,
  PROMO_PATTERNS,
  ALLOWED_REACTIONS,
  filterText,
} from "./mock/wordfilter";
export type { FilterResult } from "./mock/wordfilter";

export {
  initialStrikes,
  summarizeStrikes,
  SEVERITY_LABELS,
  SEVERITY_BADGE_CLASS,
  STRIKE_THRESHOLDS,
} from "./mock/strikes";
export type { Strike, StrikeReason, StrikeSeverity, StrikeSummary } from "./mock/strikes";

export {
  daxStrategieSignale,
  daxMillJahresRenditen,
  daxMillEquityCurve,
  STRATEGIE_BADGE_CLASS,
} from "./mock/daxmillionaer";
export type {
  StrategieAction,
  StrategieSignal,
  DaxMillYearRow,
  DaxMillEquity,
} from "./mock/daxmillionaer";

export {
  cockpitDocuments,
  getCockpitDocumentById,
  getCockpitDocumentsByKind,
} from "./mock/cockpitContent";
export type { CockpitDocument } from "./mock/cockpitContent";

export {
  portfolioStarter,
  portfolioTrend,
  portfolioStillhalter,
  getPortfolioByProduct,
} from "./mock/portfolio";
export type { PortfolioCapital, PortfolioSnapshot } from "./mock/portfolio";
