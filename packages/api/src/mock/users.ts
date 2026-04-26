import type { Subscription, User } from "../types";

// Spec §12 — Phase 1 hardcoded demo users.
// Phase 2: replace with Prisma-backed lookup. Passwords move to Argon2id hashes.

export const DEMO_PASSWORD = "traderiq2026";

export const demoUsers: User[] = [
  {
    id: "u_max",
    email: "max@traderiq.net",
    firstName: "Max",
    lastName: "Bauer",
    role: "STAFF",
    notifyPush: true,
    notifyEmail: true,
    loginCount: 42,
    onboardedFor: ["starter", "trend", "stillhalter", "cockpit"],
  },
  {
    id: "u_lisa",
    email: "paused@traderiq.net",
    firstName: "Lisa",
    lastName: "Demo",
    role: "MEMBER",
    notifyPush: true,
    notifyEmail: true,
    loginCount: 7,
    onboardedFor: ["starter"],
  },
  {
    id: "u_tom",
    email: "expired@traderiq.net",
    firstName: "Tom",
    lastName: "Demo",
    role: "MEMBER",
    notifyPush: false,
    notifyEmail: true,
    loginCount: 23,
    onboardedFor: ["trend"],
  },
  {
    id: "u_admin",
    email: "staff@traderiq.net",
    firstName: "Admin",
    lastName: "Trader IQ",
    role: "STAFF",
    notifyPush: true,
    notifyEmail: true,
    loginCount: 312,
    onboardedFor: ["starter", "trend", "stillhalter", "cockpit"],
  },
];

export const demoSubscriptions: Subscription[] = [
  {
    id: "s_max",
    userId: "u_max",
    productSlug: "all-access",
    status: "ACTIVE",
    ablefyOrderId: "AF-2026-0001",
    startedAt: "2025-08-01T00:00:00Z",
    currentPeriodEnd: "2026-08-01T00:00:00Z",
    pausedReason: null,
  },
  {
    id: "s_lisa",
    userId: "u_lisa",
    productSlug: "starter",
    status: "PAUSED",
    ablefyOrderId: "AF-2026-0017",
    startedAt: "2025-11-15T00:00:00Z",
    currentPeriodEnd: "2026-05-15T00:00:00Z",
    pausedReason: "payment_failed",
  },
  {
    id: "s_tom",
    userId: "u_tom",
    productSlug: "trend",
    status: "EXPIRED",
    ablefyOrderId: "AF-2025-1442",
    startedAt: "2024-12-01T00:00:00Z",
    currentPeriodEnd: "2026-03-01T00:00:00Z",
    pausedReason: null,
  },
  {
    id: "s_admin",
    userId: "u_admin",
    productSlug: "all-access",
    status: "ACTIVE",
    ablefyOrderId: "AF-INTERNAL",
    startedAt: "2024-01-01T00:00:00Z",
    currentPeriodEnd: null,
    pausedReason: null,
  },
];

// Additional fake users to make admin lists feel real.
export const additionalUsers: (User & { sub: Subscription })[] = [
  {
    id: "u_anna",
    email: "anna.huber@example.com",
    firstName: "Anna",
    lastName: "Huber",
    role: "MEMBER",
    notifyPush: true,
    notifyEmail: true,
    loginCount: 89,
    onboardedFor: ["stillhalter"],
    sub: {
      id: "s_anna",
      userId: "u_anna",
      productSlug: "stillhalter",
      status: "ACTIVE",
      ablefyOrderId: "AF-2026-0223",
      startedAt: "2025-09-01T00:00:00Z",
      currentPeriodEnd: "2026-09-01T00:00:00Z",
      pausedReason: null,
    },
  },
  {
    id: "u_jonas",
    email: "j.weiss@example.com",
    firstName: "Jonas",
    lastName: "Weiß",
    role: "MEMBER",
    notifyPush: true,
    notifyEmail: false,
    loginCount: 12,
    onboardedFor: ["cockpit"],
    sub: {
      id: "s_jonas",
      userId: "u_jonas",
      productSlug: "cockpit",
      status: "CANCELLED",
      ablefyOrderId: "AF-2026-0118",
      startedAt: "2025-10-10T00:00:00Z",
      currentPeriodEnd: "2026-05-10T00:00:00Z",
      pausedReason: null,
    },
  },
  {
    id: "u_mira",
    email: "mira.schulz@example.com",
    firstName: "Mira",
    lastName: "Schulz",
    role: "MODERATOR",
    notifyPush: true,
    notifyEmail: true,
    loginCount: 178,
    onboardedFor: ["starter", "trend", "stillhalter"],
    sub: {
      id: "s_mira",
      userId: "u_mira",
      productSlug: "all-access",
      status: "ACTIVE",
      ablefyOrderId: "AF-2025-0903",
      startedAt: "2025-03-01T00:00:00Z",
      currentPeriodEnd: "2026-09-01T00:00:00Z",
      pausedReason: null,
    },
  },
  {
    id: "u_petra",
    email: "p.fischer@example.com",
    firstName: "Petra",
    lastName: "Fischer",
    role: "MEMBER",
    notifyPush: false,
    notifyEmail: true,
    loginCount: 4,
    onboardedFor: [],
    sub: {
      id: "s_petra",
      userId: "u_petra",
      productSlug: "starter",
      status: "REFUNDED",
      ablefyOrderId: "AF-2026-0301",
      startedAt: "2026-02-01T00:00:00Z",
      currentPeriodEnd: "2026-03-01T00:00:00Z",
      pausedReason: "refund_within_14_days",
    },
  },
  {
    id: "u_klaus",
    email: "klaus.berger@example.com",
    firstName: "Klaus",
    lastName: "Berger",
    role: "MEMBER",
    notifyPush: true,
    notifyEmail: true,
    loginCount: 56,
    onboardedFor: ["trend", "cockpit"],
    sub: {
      id: "s_klaus",
      userId: "u_klaus",
      productSlug: "all-access",
      status: "ACTIVE",
      ablefyOrderId: "AF-2026-0089",
      startedAt: "2025-06-15T00:00:00Z",
      currentPeriodEnd: "2026-06-15T00:00:00Z",
      pausedReason: null,
    },
  },
];

export const allUsers: User[] = [...demoUsers, ...additionalUsers.map(({ sub: _sub, ...u }) => u)];
export const allSubscriptions: Subscription[] = [
  ...demoSubscriptions,
  ...additionalUsers.map((u) => u.sub),
];

export function findUserByEmail(email: string): User | undefined {
  return allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findSubscriptionsForUser(userId: string): Subscription[] {
  return allSubscriptions.filter((s) => s.userId === userId);
}

export function userHasAccessTo(userId: string, productSlug: string): boolean {
  const subs = findSubscriptionsForUser(userId);
  return subs.some(
    (s) =>
      (s.productSlug === productSlug || s.productSlug === "all-access") &&
      (s.status === "ACTIVE" || s.status === "CANCELLED"),
  );
}
