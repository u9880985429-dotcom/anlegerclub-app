import { cookies } from "next/headers";

/**
 * Server-side: validiert einen aus Headers extrahierten API-Key gegen die
 * im Cookie hinterlegten Demo-Keys (Phase 1).
 * Phase 2: Lookup in DB-Tabelle ApiKey mit hashed-Key + scopes.
 */

interface MinimalKey {
  k: string;     // fullKey
  s: string[];   // scopes
}

const COOKIE_NAME = "tiq_api_keys";

export function getApiKeyFromRequest(req: Request): string | null {
  const xKey = req.headers.get("x-api-key");
  if (xKey) return xKey.trim();
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length).trim();
  return null;
}

export function validateApiKey(rawKey: string, requiredScope?: string): { valid: boolean; scopes: string[]; reason?: string } {
  if (!rawKey || !rawKey.startsWith("tiq_live_")) {
    return { valid: false, scopes: [], reason: "invalid_key_format" };
  }
  const cookieStore = cookies();
  const raw = cookieStore.get(COOKIE_NAME)?.value;
  if (!raw) return { valid: false, scopes: [], reason: "no_keys_configured" };

  let keys: MinimalKey[];
  try {
    keys = JSON.parse(decodeURIComponent(raw)) as MinimalKey[];
  } catch {
    return { valid: false, scopes: [], reason: "cookie_parse_error" };
  }
  const found = keys.find((k) => k.k === rawKey);
  if (!found) return { valid: false, scopes: [], reason: "unknown_key" };
  if (requiredScope && !found.s.includes(requiredScope)) {
    return { valid: false, scopes: found.s, reason: `missing_scope_${requiredScope}` };
  }
  return { valid: true, scopes: found.s };
}
