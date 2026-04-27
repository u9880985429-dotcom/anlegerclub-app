/**
 * Phase 1: type-only re-exports of domain enums so app + api can share them
 * without depending on a generated Prisma client (no DB yet).
 * Phase 2: replace these with the actual Prisma client.
 */

export const Role = {
  MEMBER: "MEMBER",
  MODERATOR: "MODERATOR",
  ADMIN: "ADMIN",
  OWNER: "OWNER",
  STAFF: "STAFF",
  /**
   * Sales-Mitarbeiter (Vertrieb).
   * Intern als „SALES" gefuehrt. Fuer Kunden im Public-Display unsichtbar als
   * „Mitarbeiter" — nur Admin-internes Listing zeigt das Department.
   */
  SALES: "SALES",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const SubStatus = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
  REFUNDED: "REFUNDED",
  /** Mitarbeiter / interne Accounts — gilt als bezahlt + Vollzugriff. */
  PAID: "PAID",
} as const;
export type SubStatus = (typeof SubStatus)[keyof typeof SubStatus];

export const ActionType = {
  NEUER_KAUF: "NEUER_KAUF",
  NEUER_VERKAUF: "NEUER_VERKAUF",
  ANPASSUNG_STOP: "ANPASSUNG_STOP",
  TAKE_PROFIT: "TAKE_PROFIT",
  NEUER_TRADE: "NEUER_TRADE",
  GEFUELLT: "GEFUELLT",
  TEUER_TRADE: "TEUER_TRADE",
} as const;
export type ActionType = (typeof ActionType)[keyof typeof ActionType];

export const PRODUCT_SLUGS = [
  "starter",
  "trend",
  "stillhalter",
  "cockpit",
  "all-access",
] as const;
export type ProductSlug = (typeof PRODUCT_SLUGS)[number];
