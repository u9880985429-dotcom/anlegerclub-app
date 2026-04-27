/**
 * Berechtigungs-Hierarchie (Spec-Iteration 10):
 *
 * OWNER (höchste Stufe — z.B. Geschäftsführung, Andrei):
 *   - Kann jeden kicken (auch ADMIN, STAFF, MODERATOR, MEMBER)
 *   - Kann Teammitglieder einladen
 *   - Kann API-Keys / Webhooks / Plugins verwalten
 *   - Kann Bereichsberechtigungen für externe Zugänge vergeben
 *
 * ADMIN (zweitstärkste Rolle — Max etc.):
 *   - Kann fast alles wie OWNER
 *   - Kann KEINEN OWNER kicken
 *   - Kann KEINE anderen ADMINS kicken
 *   - Kann STAFF (Mitarbeiter) NICHT kicken
 *   - Kann MEMBER + MODERATOR kicken
 *   - Kann Teammitglieder einladen
 *   - Kann API-Keys / Webhooks / Plugins verwalten
 *
 * STAFF (Mitarbeiter ohne Admin-Rechte):
 *   - Hat Vollzugriff auf alle Depots + Trader Cockpit (PAID-Status)
 *   - Kann KEINE Teammitglieder einladen
 *   - Kann nicht kicken
 *
 * MODERATOR (Community-Moderator):
 *   - Kann Posts/Kommentare verstecken/löschen
 *   - Reports bearbeiten
 *   - Kann KEINE Teammitglieder einladen
 *   - Kann nicht kicken
 *
 * MEMBER (zahlende Kunden):
 *   - Standard-Zugriff auf eigene abonnierte Depots
 */

import type { Role } from "../types";

const HIERARCHY: Role[] = ["MEMBER", "MODERATOR", "SALES", "STAFF", "ADMIN", "OWNER"];
function level(r: Role): number {
  return HIERARCHY.indexOf(r);
}

/** Wer darf das Mitarbeiter-Backend ueberhaupt sehen? (STAFF/SALES/ADMIN/OWNER) */
export function canAccessAdmin(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN" || role === "STAFF" || role === "SALES";
}

/** Wer darf Teammitglieder einladen? */
export function canInviteTeam(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/** Wer darf API-Keys, Webhooks, Plugins verwalten? */
export function canManageIntegrations(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/** Wer darf granulare Berechtigungen pro User vergeben (z.B. ITler oder Ablefy-Zugriff)? */
export function canManagePermissions(role: Role): boolean {
  return role === "OWNER" || role === "ADMIN";
}

/**
 * Darf actor target kicken/sperren?
 * Regel: actor muss strikt höhere Hierarchie haben.
 * Sonderfall: ADMIN darf KEINEN STAFF und KEINEN ADMIN kicken (nur OWNER kann das).
 */
export function canKick(actorRole: Role, targetRole: Role): boolean {
  if (actorRole === "OWNER") {
    return targetRole !== "OWNER"; // OWNER kickt jeden außer einen anderen OWNER (es gibt nur einen)
  }
  if (actorRole === "ADMIN") {
    // ADMIN kickt MEMBER + MODERATOR + SALES — NICHT STAFF, NICHT ADMIN, NICHT OWNER
    return targetRole === "MEMBER" || targetRole === "MODERATOR" || targetRole === "SALES";
  }
  // STAFF + SALES + MODERATOR + MEMBER koennen niemanden kicken
  return false;
}

/**
 * Darf actor die Rolle von target ändern?
 * - OWNER kann alle Rollen ändern
 * - ADMIN kann Rollen ändern, aber nicht zu OWNER hochstufen und nicht andere ADMIN-Rollen ändern
 */
export function canChangeRole(actorRole: Role, targetRole: Role, newRole: Role): boolean {
  if (actorRole === "OWNER") {
    return true;
  }
  if (actorRole === "ADMIN") {
    if (targetRole === "OWNER" || targetRole === "ADMIN") return false;
    if (newRole === "OWNER") return false;
    return true;
  }
  return false;
}

export function isHigherOrEqual(a: Role, b: Role): boolean {
  return level(a) >= level(b);
}
