/**
 * Public-Display-Name-Logik (Datenschutz-Vorgabe vom Kunden):
 *
 * - MEMBER (normale Mitglieder)         → "Vorname N." (z. B. „Michael S.")
 * - STAFF / OWNER / ADMIN (Team)        → voller Name + Trader-IQ-Badge
 * - MODERATOR                           → abhängig von Herkunft
 *     - Aus dem Team eingeladen         → voller Name + Trader-IQ-Badge
 *     - Vom MEMBER befördert            → weiterhin „Vorname N." (anonymisiert)
 *
 * Für die Unterscheidung führen wir das Flag `isTeamMember` ein.
 */

import type { Role } from "../types";

export interface DisplayUser {
  firstName: string;
  lastName: string;
  role: Role;
  /**
   * `true`, wenn der User ursprünglich vom Team eingeladen wurde
   * (gilt automatisch für STAFF/OWNER/ADMIN; bei MODERATOR explizit).
   */
  isTeamMember?: boolean;
}

export function isTeamRole(role: Role, isTeamMember?: boolean): boolean {
  if (role === "STAFF" || role === "SALES" || role === "OWNER" || role === "ADMIN") return true;
  if (role === "MODERATOR") return isTeamMember === true;
  return false;
}

/**
 * Public-Display-Name (sichtbar in Community/Posts/Kommentaren für andere User).
 */
export function getPublicDisplayName(u: DisplayUser): string {
  if (isTeamRole(u.role, u.isTeamMember)) {
    return `${u.firstName} ${u.lastName}`;
  }
  // MEMBER oder MODERATOR-aus-MEMBER → anonymisieren
  const initial = u.lastName.trim().charAt(0).toUpperCase();
  return initial ? `${u.firstName} ${initial}.` : u.firstName;
}

/**
 * Avatar-Initialen für die Anzeige (basierend auf Public-Name, damit
 * MEMBER nicht durch Initialen identifiziert werden können).
 */
export function getPublicInitials(u: DisplayUser): string {
  if (isTeamRole(u.role, u.isTeamMember)) {
    return `${u.firstName.charAt(0)}${u.lastName.charAt(0)}`.toUpperCase();
  }
  // MEMBER/anon → nur 1 Buchstabe (Vorname) damit keine Identifikation möglich
  const first = u.firstName.charAt(0).toUpperCase();
  const lastInitial = u.lastName.trim().charAt(0).toUpperCase();
  return lastInitial ? `${first}${lastInitial}` : first;
}

/**
 * Liefert Hinweis-Label, wenn der User vom Trader-IQ-Team ist.
 * In der UI als kleines Badge neben dem Namen anzeigen.
 *
 * WICHTIG: Fuer Kunden/Teilnehmer ist „Mitarbeiter" das einheitliche Label —
 * Sales-Mitarbeiter werden NICHT als „Sales" geoutet. Die Abteilungs-Info
 * (z.B. „Sales") ist nur fuer Admins via getInternalRoleLabel(...) sichtbar.
 */
export function getTeamBadge(u: DisplayUser): string | null {
  if (!isTeamRole(u.role, u.isTeamMember)) return null;
  if (u.role === "OWNER") return "Trader IQ · Geschäftsführung";
  if (u.role === "ADMIN") return "Trader IQ · Admin";
  if (u.role === "STAFF" || u.role === "SALES") return "Trader IQ · Mitarbeiter";
  if (u.role === "MODERATOR") return "Trader IQ · Moderator";
  return null;
}

/**
 * Admin-internes Rollen-Label (z.B. fuer User-Listen, Audit-Log, KPI-Filter).
 * Hier zeigen wir die Abteilung in Klammern — z.B. „Mitarbeiter (Sales)".
 */
export function getInternalRoleLabel(role: Role): string {
  switch (role) {
    case "OWNER":
      return "Owner / Geschäftsführung";
    case "ADMIN":
      return "Admin";
    case "STAFF":
      return "Mitarbeiter";
    case "SALES":
      return "Mitarbeiter (Sales)";
    case "MODERATOR":
      return "Moderator";
    case "MEMBER":
      return "Mitglied";
    default:
      return role;
  }
}
