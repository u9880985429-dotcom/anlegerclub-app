import type { Subscription, User, ProductSlug } from "@traderiq/api";

/**
 * Anomalie-Detection fuer das KPI-Modul "sonstige Daten".
 *
 * Zwei Klassen:
 *   - Switcher: Eine Person hat im Verlauf der Zeit *unterschiedliche*
 *     Produkte gebucht (z.B. erst Trend, dann All Access Pass).
 *   - Re-Aktivierungen: Eine Person hat fuer das *gleiche* Produkt zwei (oder
 *     mehr) Subscriptions — alte ist beendet (CANCELLED/EXPIRED/REFUNDED),
 *     neue ist aktiv (ACTIVE/PAID). Das ist oft ein Indikator dass jemand
 *     nach einer Pause / Refund / Storno wieder eingestiegen ist.
 *
 * Match-Strategien:
 *   - **userId**: gleiche User-ID → mehrere Subs.
 *   - **email**: zwei verschiedene User-IDs mit gleicher (case-insensitiver)
 *     E-Mail-Adresse — Indikator fuer Doppelregistrierung.
 *   - **name**: zwei verschiedene User-IDs mit gleichem
 *     `firstName + lastName` (case-insensitiv) — ggf. selbe Person.
 *
 * Jeder Anomalie-Eintrag enthaelt sichtbare Felder fuer Backend-Mitarbeiter:
 * Mailadresse(n), Name, Bestell-IDs, Produkte mit Status, Datum.
 */

const TERMINATED = new Set(["CANCELLED", "EXPIRED", "REFUNDED"]);
const ACTIVE = new Set(["ACTIVE", "PAID"]);

export type MatchStrategy = "user_id" | "email" | "name";

export interface SubSummary {
  id: string;
  userId: string;
  productSlug: ProductSlug;
  status: string;
  ablefyOrderId: string | null;
  ablefyProductId: string | null;
  startedAt: string;
  currentPeriodEnd: string | null;
}

export interface SwitcherEntry {
  /** Eindeutiger Schluessel pro Anomalie (Personen-Identifizierer + Produkt-Pfad). */
  key: string;
  matchStrategy: MatchStrategy;
  email: string;
  fullName: string;
  /** Subscriptions chronologisch sortiert (aelteste zuerst). */
  subs: SubSummary[];
  /** Pfad als Lesehilfe: "trend → all-access". */
  pathLabel: string;
}

export interface ReactivationEntry {
  key: string;
  matchStrategy: MatchStrategy;
  email: string;
  fullName: string;
  productSlug: ProductSlug;
  /** Beendete (alte) Subs. */
  oldSubs: SubSummary[];
  /** Aktive (neue) Subs. */
  newSubs: SubSummary[];
}

interface PersonGroup {
  /** Eindeutiger Personen-Key (z.B. "uid:u_max" / "email:foo@bar.de" / "name:max#mustermann"). */
  key: string;
  matchStrategy: MatchStrategy;
  email: string;
  fullName: string;
  subs: SubSummary[];
}

function buildSubSummary(s: Subscription): SubSummary {
  return {
    id: s.id,
    userId: s.userId,
    productSlug: s.productSlug,
    status: s.status,
    ablefyOrderId: s.ablefyOrderId ?? null,
    ablefyProductId: s.ablefyProductId ?? null,
    startedAt: s.startedAt,
    currentPeriodEnd: s.currentPeriodEnd ?? null,
  };
}

function userLabel(u: User | undefined): { email: string; fullName: string } {
  if (!u) return { email: "(unbekannt)", fullName: "(unbekannt)" };
  return {
    email: u.email,
    fullName: `${u.firstName} ${u.lastName}`.trim(),
  };
}

/**
 * Gruppiert Subscriptions nach allen drei Match-Strategien. Pro Gruppe
 * mit >1 Sub kommt ein PersonGroup-Eintrag raus. Fuer User-ID-Matches
 * erscheint die Gruppe nur einmal; fuer Email-/Name-Matches nur, wenn
 * mehrere User-IDs zur selben Gruppe gehoeren (sonst doppelt sich das
 * mit dem User-ID-Match).
 */
function groupPersons(users: User[], subs: Subscription[]): PersonGroup[] {
  const userById = new Map(users.map((u) => [u.id, u]));
  const subsByUserId = new Map<string, SubSummary[]>();
  for (const s of subs) {
    const list = subsByUserId.get(s.userId) ?? [];
    list.push(buildSubSummary(s));
    subsByUserId.set(s.userId, list);
  }

  const groups: PersonGroup[] = [];

  // 1) User-ID-Match: Subs eines einzelnen Users
  for (const [userId, list] of subsByUserId) {
    if (list.length < 2) continue;
    const u = userById.get(userId);
    const { email, fullName } = userLabel(u);
    groups.push({
      key: `uid:${userId}`,
      matchStrategy: "user_id",
      email,
      fullName,
      subs: list.slice().sort(byStartAsc),
    });
  }

  // 2) Email-Match: zwei verschiedene User-IDs mit identischer Email
  const userIdsByEmail = new Map<string, Set<string>>();
  for (const u of users) {
    const key = u.email.trim().toLowerCase();
    if (!key) continue;
    const set = userIdsByEmail.get(key) ?? new Set();
    set.add(u.id);
    userIdsByEmail.set(key, set);
  }
  for (const [emailKey, userIds] of userIdsByEmail) {
    if (userIds.size < 2) continue;
    const aggSubs: SubSummary[] = [];
    for (const uid of userIds) aggSubs.push(...(subsByUserId.get(uid) ?? []));
    if (aggSubs.length < 2) continue;
    const anyUser = users.find((u) => userIds.has(u.id));
    const { email, fullName } = userLabel(anyUser);
    groups.push({
      key: `email:${emailKey}`,
      matchStrategy: "email",
      email,
      fullName,
      subs: aggSubs.slice().sort(byStartAsc),
    });
  }

  // 3) Name-Match: zwei verschiedene User-IDs mit identischem Vor+Nachname
  const userIdsByName = new Map<string, Set<string>>();
  for (const u of users) {
    const key = `${u.firstName}#${u.lastName}`.toLowerCase().trim();
    if (!key || key === "#") continue;
    const set = userIdsByName.get(key) ?? new Set();
    set.add(u.id);
    userIdsByName.set(key, set);
  }
  for (const [nameKey, userIds] of userIdsByName) {
    if (userIds.size < 2) continue;
    // Wenn die Personen schon ueber Email-Match abgedeckt sind, ueberspringen.
    const emails = new Set<string>();
    for (const uid of userIds) {
      const u = userById.get(uid);
      if (u) emails.add(u.email.trim().toLowerCase());
    }
    if (emails.size === 1) continue; // bereits durch Email-Match abgedeckt

    const aggSubs: SubSummary[] = [];
    for (const uid of userIds) aggSubs.push(...(subsByUserId.get(uid) ?? []));
    if (aggSubs.length < 2) continue;
    const anyUser = users.find((u) => userIds.has(u.id));
    const { email, fullName } = userLabel(anyUser);
    groups.push({
      key: `name:${nameKey}`,
      matchStrategy: "name",
      email,
      fullName,
      subs: aggSubs.slice().sort(byStartAsc),
    });
  }

  return groups;
}

function byStartAsc(a: SubSummary, b: SubSummary): number {
  return new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime();
}

/**
 * Wechsler: Subs einer Person mit *unterschiedlichen* productSlugs.
 */
export function detectSwitchers(users: User[], subs: Subscription[]): SwitcherEntry[] {
  const groups = groupPersons(users, subs);
  const out: SwitcherEntry[] = [];
  for (const g of groups) {
    const slugs = Array.from(new Set(g.subs.map((s) => s.productSlug)));
    if (slugs.length < 2) continue;
    const pathLabel = g.subs
      .map((s) => s.productSlug)
      .filter((slug, i, arr) => i === 0 || arr[i - 1] !== slug)
      .join(" → ");
    out.push({
      key: g.key,
      matchStrategy: g.matchStrategy,
      email: g.email,
      fullName: g.fullName,
      subs: g.subs,
      pathLabel,
    });
  }
  return out;
}

/**
 * Re-Aktivierungen: Subs einer Person fuer den **gleichen** Slug — eine
 * beendet (CANCELLED/EXPIRED/REFUNDED), eine aktiv (ACTIVE/PAID).
 */
export function detectReactivations(users: User[], subs: Subscription[]): ReactivationEntry[] {
  const groups = groupPersons(users, subs);
  const out: ReactivationEntry[] = [];
  for (const g of groups) {
    // Pro Slug pruefen: gibt es alte (terminated) UND neue (active) Subs?
    const bySlug = new Map<ProductSlug, SubSummary[]>();
    for (const s of g.subs) {
      const list = bySlug.get(s.productSlug) ?? [];
      list.push(s);
      bySlug.set(s.productSlug, list);
    }
    for (const [slug, list] of bySlug) {
      if (list.length < 2) continue;
      const oldSubs = list.filter((s) => TERMINATED.has(s.status));
      const newSubs = list.filter((s) => ACTIVE.has(s.status));
      if (oldSubs.length === 0 || newSubs.length === 0) continue;
      out.push({
        key: `${g.key}|${slug}`,
        matchStrategy: g.matchStrategy,
        email: g.email,
        fullName: g.fullName,
        productSlug: slug,
        oldSubs,
        newSubs,
      });
    }
  }
  return out;
}
