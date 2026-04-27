import type { AuditEntry, NotificationItem } from "../types";

export const notificationsForUser: NotificationItem[] = [
  {
    id: "n_1",
    userId: "u_max",
    type: "trade.new",
    title: "Neuer Trade im Trend Depot",
    body: "07.04.2026 – AVGO Neuer Kauf, Anpassung Stops",
    deeplink: "/depot/trend",
    readAt: null,
    createdAt: "2026-04-25T08:01:00Z",
  },
  {
    id: "n_2",
    userId: "u_max",
    type: "editorial",
    title: "Neue Marktanalyse verfügbar",
    body: "Wochenblick KW 17 ist online – Earnings-Saison Halbzeit.",
    deeplink: "/depot/cockpit",
    readAt: null,
    createdAt: "2026-04-21T08:05:00Z",
  },
  {
    id: "n_3",
    userId: "u_max",
    type: "community.mention",
    title: "Mira S. hat dich erwähnt",
    body: "„Was meinst du @max zu MCD?“",
    deeplink: "/community/stillhalter",
    readAt: "2026-04-20T19:00:00Z",
    createdAt: "2026-04-20T17:33:00Z",
  },
  {
    id: "n_4",
    userId: "u_max",
    type: "trade.closed",
    title: "Trade geschlossen – Stillhalter",
    body: "MCD Take Profit umgesetzt (Buyback bei 80% Restwertgewinn).",
    deeplink: "/depot/stillhalter",
    readAt: "2026-04-17T15:21:00Z",
    createdAt: "2026-04-17T15:20:00Z",
  },
  {
    id: "n_5",
    userId: "u_max",
    type: "report.new",
    title: "Monatsauswertung März 2026 ist da",
    body: "Februar & März 2026 zusammengefasst – inkl. Video-Update.",
    deeplink: "/depot/trend",
    readAt: "2026-04-02T10:00:00Z",
    createdAt: "2026-04-02T08:00:00Z",
  },
];

export function getNotificationsForUser(userId: string): NotificationItem[] {
  return notificationsForUser
    .filter((n) => n.userId === userId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

// ─── Audit Log ─────────────────────────────────────────────────────────────
export const auditLog: AuditEntry[] = [
  { id: "al_1", actorId: "u_admin", actorName: "Admin Trader IQ", action: "TRADE_PUBLISH", entity: "TradeSignal", entityId: "t_trend_10", createdAt: "2026-04-25T08:00:00Z" },
  { id: "al_2", actorId: "u_admin", actorName: "Admin Trader IQ", action: "REPORT_RESOLVED", entity: "Report", entityId: "rep_3", createdAt: "2026-04-22T19:00:00Z" },
  { id: "al_3", actorId: "u_mira", actorName: "Mira S. (MOD)", action: "POST_HIDE", entity: "Post", entityId: "p_c_starter_4", createdAt: "2026-04-21T11:30:00Z" },
  { id: "al_4", actorId: "u_admin", actorName: "Admin Trader IQ", action: "USER_STATUS_OVERRIDE", entity: "Subscription", entityId: "s_lisa", createdAt: "2026-04-20T09:15:00Z" },
  { id: "al_5", actorId: "u_admin", actorName: "Admin Trader IQ", action: "ONBOARDING_EDIT", entity: "OnboardingSlide", entityId: "starter:slide-3", createdAt: "2026-04-18T16:42:00Z" },
];
