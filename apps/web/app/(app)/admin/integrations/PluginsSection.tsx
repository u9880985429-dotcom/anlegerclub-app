"use client";
import { useState } from "react";
import { Settings, Check, ExternalLink, Puzzle } from "lucide-react";

interface Plugin {
  id: string;
  name: string;
  vendor: string;
  description: string;
  category: "Sync" | "Notifications" | "Video" | "Analytics" | "AI" | "Storage";
  installed: boolean;
  enabled: boolean;
  url?: string;
}

const INITIAL_PLUGINS: Plugin[] = [
  { id: "p_ablefy", name: "Ablefy Subscription Sync", vendor: "Ablefy GmbH", description: "Bidirektionaler Sync von Abos, Status, Order-IDs.", category: "Sync", installed: true, enabled: true, url: "https://docs.ablefy.com/api" },
  { id: "p_twilio", name: "Twilio Verify (SMS-OTP)", vendor: "Twilio", description: "SMS-basierte 2-Faktor-Authentifizierung beim Erstlogin.", category: "Notifications", installed: true, enabled: false, url: "https://www.twilio.com/verify" },
  { id: "p_expo", name: "Expo Push Notifications", vendor: "Expo", description: "Native Push für iOS (APNs) + Android (FCM) via Expo SDK.", category: "Notifications", installed: false, enabled: false, url: "https://docs.expo.dev/push-notifications" },
  { id: "p_mux", name: "Mux Video", vendor: "Mux", description: "DRM-geschützte Video-Hosting + Wasserzeichen für Welcome-Videos & Auswertungen.", category: "Video", installed: false, enabled: false, url: "https://www.mux.com/" },
  { id: "p_r2", name: "Cloudflare R2 Storage", vendor: "Cloudflare", description: "S3-kompatibler Object-Storage für User-Avatare + Community-Anhänge.", category: "Storage", installed: true, enabled: true, url: "https://www.cloudflare.com/products/r2/" },
  { id: "p_blob", name: "Vercel Blob", vendor: "Vercel", description: "Alternative zu R2 — Blob-Storage direkt auf Vercel.", category: "Storage", installed: false, enabled: false, url: "https://vercel.com/docs/storage/vercel-blob" },
  { id: "p_gamma", name: "Gamma AI", vendor: "Gamma", description: "KI-generierte Marktanalyse-PDFs für das Trader Cockpit.", category: "AI", installed: false, enabled: false, url: "https://gamma.app/" },
  { id: "p_finnhub", name: "Finnhub Earnings API", vendor: "Finnhub", description: "Live-Earnings-Daten + IV für die Cockpit-Earnings-Übersicht.", category: "Analytics", installed: false, enabled: false, url: "https://finnhub.io/" },
  { id: "p_n8n", name: "n8n / Zapier Mail-Webhook", vendor: "n8n / Zapier", description: "Mail-Versand über deinen eigenen n8n-/Zapier-Stack (info@traderiq.net).", category: "Notifications", installed: true, enabled: true, url: "https://n8n.io" },
];

const CAT_BADGE: Record<Plugin["category"], string> = {
  Sync: "bg-blue-500/15 text-blue-700",
  Notifications: "bg-amber-500/15 text-amber-700",
  Video: "bg-purple-500/15 text-purple-700",
  Analytics: "bg-emerald-500/15 text-emerald-700",
  AI: "bg-pink-500/15 text-pink-700",
  Storage: "bg-slate-500/15 text-slate-700",
};

export function PluginsSection() {
  const [plugins, setPlugins] = useState<Plugin[]>(INITIAL_PLUGINS);

  function install(id: string) {
    setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, installed: true, enabled: true } : p)));
  }
  function toggleEnable(id: string) {
    setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p)));
  }
  function uninstall(id: string) {
    if (!confirm("Plugin wirklich deinstallieren? Konfigurationen gehen verloren.")) return;
    setPlugins((prev) => prev.map((p) => (p.id === id ? { ...p, installed: false, enabled: false } : p)));
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Plugin-Marketplace für externe Integrationen. Klick „Installieren" → Konfiguration via API-Keys oben.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {plugins.map((p) => (
          <article key={p.id} className="card-base p-4">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4 text-brand" />
                  <h3 className="font-semibold">{p.name}</h3>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className={`rounded-md px-1.5 py-0.5 font-semibold ${CAT_BADGE[p.category]}`}>{p.category}</span>
                  <span>·</span>
                  <span>von {p.vendor}</span>
                </div>
              </div>
              {p.installed && p.enabled && (
                <span className="inline-flex items-center gap-1 rounded-md bg-profit/15 px-2 py-0.5 text-[10px] font-semibold text-profit">
                  <Check className="h-3 w-3" /> Aktiv
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{p.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!p.installed ? (
                <button onClick={() => install(p.id)} className="btn-brand inline-flex items-center gap-1">
                  <Puzzle className="h-3.5 w-3.5" /> Installieren
                </button>
              ) : (
                <>
                  <button onClick={() => toggleEnable(p.id)} className="btn-secondary inline-flex items-center gap-1">
                    {p.enabled ? "Deaktivieren" : "Aktivieren"}
                  </button>
                  <button className="btn-secondary inline-flex items-center gap-1">
                    <Settings className="h-3.5 w-3.5" /> Konfigurieren
                  </button>
                  <button onClick={() => uninstall(p.id)} className="btn-ghost text-xs text-destructive">
                    Deinstallieren
                  </button>
                </>
              )}
              {p.url && (
                <a href={p.url} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-1 text-xs">
                  Doku <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
