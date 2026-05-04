import type { Subscription, User } from "../types";

// Spec §12 — Phase 1 hardcoded demo users.
// Phase 2: replace with Prisma-backed lookup. Passwords move to Argon2id hashes.

export const DEMO_PASSWORD = "traderiq2026";

export const demoUsers: User[] = [
  {
    id: "u_andrei",
    email: "andrei@traderiq.net",
    firstName: "Andrei",
    lastName: "Trader IQ",
    role: "OWNER",
    isTeamMember: true,
    notifyPush: true,
    notifyEmail: true,
    loginCount: 0,
    onboardedFor: ["starter", "trend", "stillhalter", "cockpit"],
    ablefyId: "AF-OWNER-0001",
    notes: "Geschäftsführer · Owner-Account.",
  },
  {
    id: "u_max",
    email: "max@traderiq.net",
    firstName: "Max",
    lastName: "Bauer",
    role: "ADMIN",
    isTeamMember: true,
    notifyPush: true,
    notifyEmail: true,
    loginCount: 42,
    onboardedFor: ["starter", "trend", "stillhalter", "cockpit"],
    phone: "+49 151 23456789",
    street: "Hauptstraße 12",
    zip: "10115",
    city: "Berlin",
    country: "Deutschland",
    ablefyId: "AF-USR-0001",
    notes: "Admin (vollumfänglich, kann nicht den Owner kicken).",
  },
  {
    id: "u_babsi",
    email: "babsi@traderiq.net",
    firstName: "Babsi",
    lastName: "Trader IQ",
    role: "MEMBER",
    notifyPush: true,
    notifyEmail: true,
    loginCount: 0,
    onboardedFor: ["starter", "trend", "stillhalter", "cockpit"],
    ablefyId: "AF-INTERNAL-BABSI",
    notes: "Phase-1-Kunden-Sicht. Kostenfreier All Access Pass via INTERNAL-Order — KPI-irrelevant. Owner kann den Account spaeter manuell auf Mitarbeiter (isTeamMember=true) hochstufen.",
  },
  {
    id: "u_hendrik",
    email: "hendrik@traderiq.net",
    firstName: "Hendrik",
    lastName: "Trader IQ",
    role: "MEMBER",
    notifyPush: true,
    notifyEmail: true,
    loginCount: 0,
    onboardedFor: ["starter", "trend", "stillhalter", "cockpit"],
    ablefyId: "AF-INTERNAL-HENDRIK",
    notes: "Phase-1-Kunden-Sicht. Kostenfreier All Access Pass via INTERNAL-Order — KPI-irrelevant. Owner kann den Account spaeter manuell auf Mitarbeiter (isTeamMember=true) hochstufen.",
  },
];

export const demoSubscriptions: Subscription[] = [
  {
    id: "s_andrei",
    userId: "u_andrei",
    productSlug: "all-access",
    status: "PAID",
    ablefyOrderId: "AF-INTERNAL-OWNER",
    ablefyProductId: "424736",
    startedAt: "2024-01-01T00:00:00Z",
    currentPeriodEnd: null,
    pausedReason: null,
  },
  {
    id: "s_max",
    userId: "u_max",
    productSlug: "all-access",
    status: "PAID",
    ablefyOrderId: "AF-INTERNAL-MAX",
    ablefyProductId: "424736",
    startedAt: "2025-08-01T00:00:00Z",
    currentPeriodEnd: null,
    pausedReason: null,
  },
  {
    id: "s_babsi",
    userId: "u_babsi",
    productSlug: "all-access",
    status: "PAID",
    ablefyOrderId: "AF-INTERNAL-BABSI",
    ablefyProductId: "424736",
    startedAt: "2026-05-04T00:00:00Z",
    currentPeriodEnd: null,
    pausedReason: null,
  },
  {
    id: "s_hendrik",
    userId: "u_hendrik",
    productSlug: "all-access",
    status: "PAID",
    ablefyOrderId: "AF-INTERNAL-HENDRIK",
    ablefyProductId: "424736",
    startedAt: "2026-05-04T00:00:00Z",
    currentPeriodEnd: null,
    pausedReason: null,
  },
];

// Iteration 40: alle Test-Member entfernt — nur noch Andrei (OWNER) + Max (ADMIN).
// additionalUsers / anomalyDemoUsers / anomalyDemoSubscriptions sind leer; sie
// werden vom Aggregator weiterhin gespreaded, damit Phase-2-Code, der diese
// Exporte importiert, nicht bricht.
export const additionalUsers: (User & { sub: Subscription })[] = [];
export const anomalyDemoUsers: User[] = [];
export const anomalyDemoSubscriptions: Subscription[] = [];

export const allUsers: User[] = [
  ...demoUsers,
  ...additionalUsers.map(({ sub: _sub, ...u }) => u),
  ...anomalyDemoUsers,
];
export const allSubscriptions: Subscription[] = [
  ...demoSubscriptions,
  ...additionalUsers.map((u) => u.sub),
  ...anomalyDemoSubscriptions,
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
      (s.status === "ACTIVE" || s.status === "CANCELLED" || s.status === "PAID"),
  );
}
