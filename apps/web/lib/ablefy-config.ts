/**
 * Ablefy-Integration: gemeinsame Typen + Storage-Helpers.
 *
 * Phase 1: Konfiguration im Browser-localStorage (Client-Side).
 * Server-Endpoints (z.B. Webhook-Receiver) lesen aktuell aus dem Cookie-Mirror.
 * Phase 2: alles in Postgres + AES-256-GCM-verschluesseltem Vault.
 */

import type { ProductSlug } from "@traderiq/api";

export interface AblefyProductMapping {
  /** Ablefy-Product-ID (numerisch oder als String). */
  ablefyProductId: string;
  /** TraderIQ-Depot zu dem dieses Produkt gehoert. */
  traderiqProductSlug: ProductSlug;
  /** Optional: Zugehoeriger Pricing-Plan-Name (Hilfslabel). */
  planLabel?: string;
}

export interface AblefyConfig {
  /** Aktiviert die Integration global. */
  enabled: boolean;
  /** API-Key aus Ablefy → Anbieter-Account → API. */
  apiKey: string;
  /** API-Secret aus Ablefy → Anbieter-Account → API. */
  apiSecret: string;
  /** Webhook-Signing-Secret zur HMAC-Verifizierung eingehender Webhooks. */
  webhookSecret: string;
  /** Produkt-Mapping Ablefy → TraderIQ. */
  productMapping: AblefyProductMapping[];
  /** Letztes Sync-Datum (ISO). Wird vom /api/v1/ablefy/sync aktualisiert. */
  lastSyncAt: string | null;
  /** Letzter erfolgreicher Verbindungstest (ISO). */
  lastTestAt: string | null;
}

export const DEFAULT_ABLEFY_CONFIG: AblefyConfig = {
  enabled: false,
  apiKey: "",
  apiSecret: "",
  webhookSecret: "",
  productMapping: [],
  lastSyncAt: null,
  lastTestAt: null,
};

const STORAGE_KEY = "traderiq:ablefy-config";
const COOKIE_NAME = "tiq_ablefy_secret";

export function readAblefyConfig(): AblefyConfig {
  if (typeof window === "undefined") return DEFAULT_ABLEFY_CONFIG;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ABLEFY_CONFIG;
    return { ...DEFAULT_ABLEFY_CONFIG, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_ABLEFY_CONFIG;
  }
}

export function writeAblefyConfig(cfg: AblefyConfig) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  // Cookie-Mirror nur fuers webhook-secret + enabled-Flag, damit der Server
  // eingehende Webhooks signieren-pruefen kann.
  const minimal = { e: cfg.enabled, ws: cfg.webhookSecret };
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(minimal))}; path=/; max-age=31536000; SameSite=Lax`;
}

/**
 * Server-Side: liest das webhook-secret aus dem Cookie (Phase-1-Bridge).
 * Phase 2: aus DB + Vault.
 */
export function readAblefyWebhookSecretFromCookieHeader(cookieHeader: string | null): {
  enabled: boolean;
  webhookSecret: string;
} | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(/;\s*/).find((c) => c.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const raw = decodeURIComponent(match.split("=").slice(1).join("="));
    const parsed = JSON.parse(raw) as { e?: boolean; ws?: string };
    return { enabled: Boolean(parsed.e), webhookSecret: parsed.ws ?? "" };
  } catch {
    return null;
  }
}

/**
 * Phase 1: liefert den absoluten Public-URL des Webhook-Endpoints, den der
 * Anwender in Ablefy eintragen muss.
 *
 * Im Browser nutzt es window.location.origin.
 * Auf dem Server (z.B. fuer SSR-Anzeige) Fallback auf NEXT_PUBLIC_APP_URL.
 */
export function getAblefyWebhookUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/api/v1/ablefy/webhook`;
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "https://member.traderiq.net";
  return `${base}/api/v1/ablefy/webhook`;
}
