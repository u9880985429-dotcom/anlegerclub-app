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
} from "./mock/content";

export {
  communities,
  allPosts,
  allComments,
  reports,
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
