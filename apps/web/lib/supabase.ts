import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase-Client (server-side, mit Service-Role-Key).
 *
 * Wird in API-Routes / Server-Actions / Server-Components genutzt. Liest die
 * Konfiguration aus den Vercel-ENV-Variablen — fehlende Werte fuehren NICHT
 * zu einem Crash, sondern liefern einen `null`-Client zurueck. Aufrufer
 * pruefen `if (!supabase)` und faellt dann auf In-Memory-/Mock-Verhalten
 * zurueck — wichtig, damit lokale Entwicklung ohne Supabase weiterlaeuft.
 *
 * **Niemals** den Service-Role-Key in Client-Code (`"use client"`) nutzen!
 * Dieser Modul ist deshalb explizit nur fuer Server-Code gedacht.
 */
let cached: SupabaseClient | null = null;
let cacheChecked = false;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cacheChecked) return cached;
  cacheChecked = true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return null;
  }
  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
