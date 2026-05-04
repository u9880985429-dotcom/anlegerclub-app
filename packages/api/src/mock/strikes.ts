/**
 * Strike-System für Community-Moderation (Iteration 3).
 *
 * Spec: Mitarbeiter, Admin, Owner können User für Verstöße "striken".
 * Bei Wiederholung kann der User temporär oder dauerhaft gesperrt werden.
 *
 * Phase 1: Mock-Daten + lokale Mutation in der Demo.
 * Phase 2: persistiert in DB, Audit-Log wird erweitert.
 */

export type StrikeReason =
  | "Beleidigung"
  | "Werbung / Promo"
  | "Spam"
  | "Off-Topic"
  | "Manipulation / Falschinformation"
  | "Sonstiges";

export type StrikeSeverity = "WARN" | "STRIKE" | "MUTE_24H" | "MUTE_7D" | "BAN";

export interface Strike {
  id: string;
  userId: string;
  userName: string;
  reason: StrikeReason;
  severity: StrikeSeverity;
  /** Auszug aus dem geahndeten Text (intern). */
  excerpt: string;
  issuedById: string;
  issuedByName: string;
  createdAt: string;
  /** Falls der Strike eine Sperre ausgelöst hat: bis wann (ISO oder null = dauerhaft). */
  expiresAt?: string | null;
  resolved?: boolean;
}

export const SEVERITY_LABELS: Record<StrikeSeverity, string> = {
  WARN: "Verwarnung",
  STRIKE: "Strike",
  MUTE_24H: "Mute 24h",
  MUTE_7D: "Mute 7 Tage",
  BAN: "Permanent gesperrt",
};

export const SEVERITY_BADGE_CLASS: Record<StrikeSeverity, string> = {
  WARN: "bg-blue-500/15 text-blue-700",
  STRIKE: "bg-amber-500/15 text-amber-700",
  MUTE_24H: "bg-orange-500/15 text-orange-700",
  MUTE_7D: "bg-orange-500/20 text-orange-800",
  BAN: "bg-red-500/15 text-red-700",
};

// Iter 40: Test-Strikes entfernt — kommen ab Phase 2 aus echten Mod-Aktionen.
export const initialStrikes: Strike[] = [];

export interface StrikeSummary {
  userId: string;
  userName: string;
  warnCount: number;
  strikeCount: number;
  isMuted: boolean;
  isBanned: boolean;
  lastStrikeAt: string | null;
  history: Strike[];
}

export function summarizeStrikes(strikes: Strike[]): StrikeSummary[] {
  const map = new Map<string, StrikeSummary>();
  for (const s of strikes) {
    if (!map.has(s.userId)) {
      map.set(s.userId, {
        userId: s.userId,
        userName: s.userName,
        warnCount: 0,
        strikeCount: 0,
        isMuted: false,
        isBanned: false,
        lastStrikeAt: null,
        history: [],
      });
    }
    const summary = map.get(s.userId)!;
    summary.history.push(s);
    if (s.severity === "WARN") summary.warnCount += 1;
    if (s.severity === "STRIKE") summary.strikeCount += 1;
    if (s.severity === "MUTE_24H" || s.severity === "MUTE_7D") {
      const exp = s.expiresAt ? new Date(s.expiresAt).getTime() : 0;
      if (exp > Date.now()) summary.isMuted = true;
    }
    if (s.severity === "BAN") summary.isBanned = true;
    if (!summary.lastStrikeAt || s.createdAt > summary.lastStrikeAt) {
      summary.lastStrikeAt = s.createdAt;
    }
  }
  return [...map.values()].sort((a, b) => (a.lastStrikeAt && b.lastStrikeAt && a.lastStrikeAt > b.lastStrikeAt ? -1 : 1));
}

export const STRIKE_THRESHOLDS = {
  // Empfehlungen für Eskalation:
  // 2 Warns → 1 Strike automatisch eskaliert.
  // 3 Strikes → MUTE_7D.
  // 5 Strikes → BAN.
  warnEscalation: 2,
  strikeEscalation: 3,
  banThreshold: 5,
};
