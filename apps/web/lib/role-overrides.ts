/**
 * Persistente Rollen-Override-Map (Phase 1: localStorage).
 * Phase 2: DB-Migration → role-Feld der User-Tabelle wird gepflegt.
 *
 * Schlüssel: `traderiq:role-overrides` → JSON-Map { userId: Role }
 */
import type { Role } from "@traderiq/api";

const STORAGE_KEY = "traderiq:role-overrides";

export function readRoleOverrides(): Record<string, Role> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Role>;
  } catch {
    return {};
  }
}

export function writeRoleOverride(userId: string, role: Role) {
  if (typeof window === "undefined") return;
  const all = readRoleOverrides();
  all[userId] = role;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("traderiq:role-change", { detail: { userId, role } }));
}

export function clearRoleOverride(userId: string) {
  if (typeof window === "undefined") return;
  const all = readRoleOverrides();
  delete all[userId];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  window.dispatchEvent(new CustomEvent("traderiq:role-change", { detail: { userId, role: null } }));
}

export function getEffectiveRole(userId: string, canonicalRole: Role): Role {
  if (typeof window === "undefined") return canonicalRole;
  const overrides = readRoleOverrides();
  return overrides[userId] ?? canonicalRole;
}
