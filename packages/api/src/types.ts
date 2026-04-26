import { z } from "zod";
import type { ActionType, ProductSlug, Role, SubStatus } from "@traderiq/db";

export type { ActionType, ProductSlug, Role, SubStatus };

// ─── Domain entities ───────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  notifyPush: boolean;
  notifyEmail: boolean;
  loginCount: number;
  onboardedFor: ProductSlug[];
  /** Felder die Ablefy in Phase 2 weiterleitet — Phase 1 als optionale Demo-Daten. */
  phone?: string;
  street?: string;
  zip?: string;
  city?: string;
  country?: string;
  ablefyId?: string;
  notes?: string;
}

export interface Subscription {
  id: string;
  userId: string;
  productSlug: ProductSlug;
  status: SubStatus;
  ablefyOrderId: string | null;
  startedAt: string;
  currentPeriodEnd: string | null;
  pausedReason: string | null;
}

export interface TradeSignal {
  id: string;
  productSlug: ProductSlug;
  date: string;
  action: ActionType;
  tickers: string[];
  title: string;
  bodyMd: string;
  publishedAt: string | null;
}

export interface MonthlyReport {
  id: string;
  productSlug: ProductSlug;
  monthLabel: string;
  videoAssetId: string | null;
  pdfUrl: string | null;
  bodyMd: string;
  publishedAt: string | null;
}

export interface Lesson {
  id: string;
  productSlug: ProductSlug;
  section: string;
  title: string;
  bodyMd: string;
  videoAssetId: string | null;
  order: number;
  visible: boolean;
}

export interface FocusStock {
  id: string;
  ticker: string;
  company: string;
  thesis: string;
  publishedAt: string;
  /** Volltext für die Detail-Seite. */
  longTextMd?: string;
  videoAssetId?: string | null;
  videoDuration?: string;
}

export interface MarketUpdate {
  id: string;
  kind: "tag" | "woche" | "monat";
  title: string;
  bodyMd: string;
  publishedAt: string;
}

export interface LexikonEntry {
  id: string;
  term: string;
  definitionMd: string;
}

export interface OnboardingSlide {
  order: number;
  title: string;
  bodyMd: string;
}

export interface PitchModule {
  id: string;
  audienceProductSlug: ProductSlug;
  headline: string;
  bodyMd: string;
  ctaLabel: string;
  ctaUrl: string;
  active: boolean;
}

export interface Community {
  id: string;
  productSlug: ProductSlug;
  name: string;
  archiveUrl: string;
}

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  authorName: string;
  title: string | null;
  bodyMd: string;
  pinned: boolean;
  visible: boolean;
  hiddenById: string | null;
  reactions: { emoji: string; count: number }[];
  commentCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  bodyMd: string;
  parentId: string | null;
  visible: boolean;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  postId: string | null;
  commentId: string | null;
  reason: string;
  status: "OPEN" | "RESOLVED" | "DISMISSED";
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: "trade.new" | "trade.closed" | "report.new" | "community.mention" | "editorial";
  title: string;
  body: string;
  deeplink: string | null;
  readAt: string | null;
  createdAt: string;
}

// ─── Zod schemas (used at API/admin form boundaries) ───────────────────────

export const TradeSignalInputSchema = z.object({
  productSlug: z.enum(["starter", "trend", "stillhalter", "cockpit", "all-access"]),
  date: z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Format TT.MM.JJJJ"),
  action: z.enum([
    "NEUER_KAUF",
    "NEUER_VERKAUF",
    "ANPASSUNG_STOP",
    "TAKE_PROFIT",
    "NEUER_TRADE",
    "GEFUELLT",
    "TEUER_TRADE",
  ]),
  tickers: z.array(z.string().min(1)).min(1),
  title: z.string().min(3),
  bodyMd: z.string().min(1),
});
export type TradeSignalInput = z.infer<typeof TradeSignalInputSchema>;

export const PostInputSchema = z.object({
  communityId: z.string().min(1),
  title: z.string().optional(),
  bodyMd: z.string().min(1),
});
export type PostInput = z.infer<typeof PostInputSchema>;
