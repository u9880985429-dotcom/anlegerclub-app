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
// Iter 40: Test-User aus Audit-Log entfernt — nur noch echte Eintraege ab
// Phase 2 (wenn Owner/Admin tatsaechliche Aktionen ausfuehren).
export const auditLog: AuditEntry[] = [];
