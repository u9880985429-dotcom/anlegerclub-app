/**
 * API-Key-Persistenz (Phase 1: localStorage; Phase 2: DB).
 *
 * Test-Endpoints:
 *   GET  /api/v1/ping           — validiert Key, gibt Owner-Info zurück
 *   GET  /api/v1/users          — Scope users.read
 *   GET  /api/v1/trades         — Scope trades.read
 *   GET  /api/v1/subscriptions  — Scope subscriptions.read
 *
 * Authentifizierung: Header `X-API-Key: tiq_live_…` ODER `Authorization: Bearer tiq_live_…`
 *
 * WICHTIG: Diese Funktionalität ist NUR im Admin-Backend (OWNER + ADMIN) sichtbar.
 * Kunden bekommen davon nichts mit.
 */

export interface StoredApiKey {
  id: string;
  name: string;
  fullKey: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

const STORAGE_KEY = "traderiq:api-keys";
const COOKIE_NAME = "tiq_api_keys"; // synchronisiert für Server-Validation

export function readApiKeys(): StoredApiKey[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredApiKey[]) : [];
  } catch {
    return [];
  }
}

export function writeApiKeys(keys: StoredApiKey[]) {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(keys);
  window.localStorage.setItem(STORAGE_KEY, json);
  // Cookie ist serverseitig lesbar via headers().get('cookie') in route handlers.
  // Wir speichern nur die KEYS (nicht prefix/name) damit der Server validieren kann.
  const minimal = keys.map((k) => ({ k: k.fullKey, s: k.scopes }));
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(minimal))}; path=/; max-age=${
    60 * 60 * 24 * 365
  }; SameSite=Lax`;
}

export function generateApiKey(name: string, scopes: string[]): StoredApiKey {
  const random = Array.from({ length: 30 })
    .map(() =>
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(
        Math.floor(Math.random() * 62),
      ),
    )
    .join("");
  const fullKey = `tiq_live_${random}`;
  return {
    id: `k_${Date.now()}`,
    name,
    fullKey,
    prefix: `${fullKey.slice(0, 14)}…`,
    scopes,
    createdAt: new Date().toISOString(),
    lastUsedAt: null,
  };
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
