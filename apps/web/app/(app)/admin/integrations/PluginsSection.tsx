"use client";
import { useEffect, useState } from "react";
import { Settings, Check, ExternalLink, Puzzle, X, Eye, EyeOff, Save, Loader2, CheckCircle2 } from "lucide-react";

type Category = "Sync" | "Notifications" | "Video" | "Analytics" | "AI" | "Storage" | "E-Mail-Marketing" | "Automation" | "Support" | "Tracking";

interface PluginField {
  key: string;
  label: string;
  type: "text" | "secret" | "url";
  placeholder?: string;
  required?: boolean;
  hint?: string;
}

interface Plugin {
  id: string;
  name: string;
  vendor: string;
  description: string;
  category: Category;
  installed: boolean;
  enabled: boolean;
  url?: string;
  configFields: PluginField[];
}

const PLUGINS: Plugin[] = [
  // === Bestand ===
  {
    id: "p_ablefy",
    name: "Ablefy Subscription Sync",
    vendor: "Ablefy GmbH",
    description: "Bidirektionaler Sync von Abos, Status, Order-IDs. Webhook-Empfang fuer neue Bestellungen, Refunds, Pausen.",
    category: "Sync",
    installed: true,
    enabled: true,
    url: "https://docs.ablefy.com/api",
    configFields: [
      { key: "apiKey", label: "Ablefy API-Key", type: "secret", required: true, hint: "Aus Ablefy-Backend → Einstellungen → API." },
      { key: "apiSecret", label: "API-Secret", type: "secret", required: true },
      { key: "webhookSecret", label: "Webhook-Signing-Secret", type: "secret", hint: "HMAC-SHA256 zur Webhook-Verifizierung." },
      { key: "shopId", label: "Shop-ID", type: "text", placeholder: "z.B. shop_traderiq" },
    ],
  },
  {
    id: "p_twilio",
    name: "Twilio Verify (SMS-OTP)",
    vendor: "Twilio",
    description: "SMS-basierte 2-Faktor-Authentifizierung beim Erstlogin.",
    category: "Notifications",
    installed: true,
    enabled: false,
    url: "https://www.twilio.com/verify",
    configFields: [
      { key: "accountSid", label: "Account SID", type: "text", required: true },
      { key: "authToken", label: "Auth Token", type: "secret", required: true },
      { key: "verifyServiceSid", label: "Verify Service SID", type: "text", required: true },
    ],
  },
  {
    id: "p_expo",
    name: "Expo Push Notifications",
    vendor: "Expo",
    description: "Native Push fuer iOS (APNs) + Android (FCM) ueber Expo SDK.",
    category: "Notifications",
    installed: false,
    enabled: false,
    url: "https://docs.expo.dev/push-notifications",
    configFields: [
      { key: "accessToken", label: "Expo Access Token", type: "secret", required: true },
      { key: "projectId", label: "Project ID", type: "text", required: true },
    ],
  },
  {
    id: "p_vimeo",
    name: "Vimeo (Pro / Premium)",
    vendor: "Vimeo",
    description: "DRM-geschuetzte Video-Embed fuer Welcome-Videos, Webinare, Auswertungen. Optional Domain-Lock + Wasserzeichen.",
    category: "Video",
    installed: false,
    enabled: false,
    url: "https://developer.vimeo.com/api/start",
    configFields: [
      { key: "accessToken", label: "Vimeo Personal Access Token", type: "secret", required: true, hint: "Scopes: private + video_files." },
      { key: "clientId", label: "Client ID (optional, fuer OAuth)", type: "text" },
      { key: "clientSecret", label: "Client Secret (optional)", type: "secret" },
    ],
  },
  {
    id: "p_r2",
    name: "Cloudflare R2 Storage",
    vendor: "Cloudflare",
    description: "S3-kompatibler Object-Storage fuer User-Avatare + Community-Anhaenge.",
    category: "Storage",
    installed: true,
    enabled: true,
    url: "https://www.cloudflare.com/products/r2/",
    configFields: [
      { key: "accessKeyId", label: "Access Key ID", type: "secret", required: true },
      { key: "secretAccessKey", label: "Secret Access Key", type: "secret", required: true },
      { key: "bucket", label: "Bucket-Name", type: "text", required: true, placeholder: "traderiq-uploads" },
      { key: "endpoint", label: "S3-Endpoint", type: "url", required: true, placeholder: "https://<account>.r2.cloudflarestorage.com" },
    ],
  },
  {
    id: "p_blob",
    name: "Vercel Blob",
    vendor: "Vercel",
    description: "Alternative zu R2 — Blob-Storage direkt auf Vercel.",
    category: "Storage",
    installed: false,
    enabled: false,
    url: "https://vercel.com/docs/storage/vercel-blob",
    configFields: [
      { key: "readWriteToken", label: "Read-Write Token", type: "secret", required: true, hint: "Vercel Dashboard → Storage → Create Blob." },
    ],
  },
  {
    id: "p_finnhub",
    name: "Finnhub Earnings API",
    vendor: "Finnhub",
    description: "Live-Earnings-Daten + IV fuer die Cockpit-Earnings-Uebersicht.",
    category: "Analytics",
    installed: false,
    enabled: false,
    url: "https://finnhub.io/",
    configFields: [
      { key: "apiKey", label: "Finnhub API-Key", type: "secret", required: true },
    ],
  },

  // === E-Mail-Marketing ===
  {
    id: "p_klicktipp",
    name: "KlickTipp",
    vendor: "KlickTipp GmbH",
    description: "Tag-basiertes E-Mail-Marketing. Automatisches Tagging bei Subscription-Aenderungen, Triggern fuer Trade-Signal-Mails.",
    category: "E-Mail-Marketing",
    installed: false,
    enabled: false,
    url: "https://www.klicktipp.com/api",
    configFields: [
      { key: "apiKey", label: "API-Key", type: "secret", required: true },
      { key: "username", label: "API-Benutzer", type: "text", required: true, hint: "Im KlickTipp-Account → Einstellungen → API-Zugang." },
      { key: "password", label: "API-Passwort", type: "secret", required: true },
    ],
  },
  {
    id: "p_activecampaign",
    name: "ActiveCampaign",
    vendor: "ActiveCampaign LLC",
    description: "CRM + Marketing-Automation. Sync von Subscribern, Engagement-Scores, Custom-Field-Update.",
    category: "E-Mail-Marketing",
    installed: false,
    enabled: false,
    url: "https://developers.activecampaign.com",
    configFields: [
      { key: "apiUrl", label: "API-URL", type: "url", required: true, placeholder: "https://traderiq.api-us1.com" },
      { key: "apiKey", label: "API-Key", type: "secret", required: true },
    ],
  },
  {
    id: "p_mailchimp",
    name: "MailChimp",
    vendor: "Intuit MailChimp",
    description: "Listen-basiertes E-Mail-Marketing. Member-Sync auf Audiences mit Segmenten pro Depot.",
    category: "E-Mail-Marketing",
    installed: false,
    enabled: false,
    url: "https://mailchimp.com/developer/marketing/api",
    configFields: [
      { key: "apiKey", label: "API-Key (mit Datacenter-Suffix)", type: "secret", required: true, placeholder: "z.B. abc123-us21" },
      { key: "audienceId", label: "Audience-ID", type: "text", required: true },
    ],
  },
  {
    id: "p_getresponse",
    name: "GetResponse",
    vendor: "GetResponse S.A.",
    description: "Marketing-Automation + Webinar-Plattform. Sync von Kontakten, Tags und Webinar-Anmeldungen.",
    category: "E-Mail-Marketing",
    installed: false,
    enabled: false,
    url: "https://apidocs.getresponse.com",
    configFields: [
      { key: "apiKey", label: "API-Key", type: "secret", required: true },
      { key: "campaignId", label: "Default Campaign-ID", type: "text", required: true },
    ],
  },
  {
    id: "p_mailerlite",
    name: "MailerLite / MailWork",
    vendor: "MailerLite",
    description: "Schlanker Newsletter-Service mit Automations und Segmentierung.",
    category: "E-Mail-Marketing",
    installed: false,
    enabled: false,
    url: "https://developers.mailerlite.com",
    configFields: [
      { key: "apiKey", label: "API-Key", type: "secret", required: true, hint: "Aus MailerLite → Integrations → Developer API." },
      { key: "groupId", label: "Default Group-ID", type: "text" },
    ],
  },

  // === Automation ===
  {
    id: "p_zapier",
    name: "Zapier",
    vendor: "Zapier Inc.",
    description: "Generische Webhook-Bruecke zu 5000+ Apps. Trigger auf neue Trades, Subscriptions, Comments — Aktion in deinem Stack.",
    category: "Automation",
    installed: true,
    enabled: true,
    url: "https://zapier.com",
    configFields: [
      { key: "webhookUrl", label: "Catch-Hook-URL", type: "url", required: true, placeholder: "https://hooks.zapier.com/hooks/catch/..." },
      { key: "signingSecret", label: "Signing Secret (optional)", type: "secret" },
    ],
  },
  {
    id: "p_n8n",
    name: "n8n / Make",
    vendor: "n8n / Make",
    description: "Self-hosted Automation. Eigener Webhook-Endpoint, vollstaendige Datenkontrolle.",
    category: "Automation",
    installed: true,
    enabled: true,
    url: "https://n8n.io",
    configFields: [
      { key: "webhookUrl", label: "n8n / Make Webhook-URL", type: "url", required: true, placeholder: "https://n8n.traderiq.net/hook/..." },
      { key: "apiKey", label: "X-API-Key (optional, eigener Header)", type: "secret" },
    ],
  },

  // === Support ===
  {
    id: "p_supportchat",
    name: "SupportChat / Crisp",
    vendor: "Crisp IM SAS",
    description: "Live-Chat im Footer der App. Nachrichten + Email-Threading + Bot-Vorqualifikation.",
    category: "Support",
    installed: false,
    enabled: false,
    url: "https://crisp.chat",
    configFields: [
      { key: "websiteId", label: "Website-ID", type: "text", required: true },
      { key: "apiToken", label: "API Token (optional, fuer Bot-Aktionen)", type: "secret" },
    ],
  },

  // === Tracking ===
  {
    id: "p_tracify",
    name: "Tracify",
    vendor: "Tracify GmbH",
    description: "First-Party-Conversion-Tracking ohne Cookies. Attribution fuer Werbeanzeigen, Customer-Journeys.",
    category: "Tracking",
    installed: false,
    enabled: false,
    url: "https://tracify.ai",
    configFields: [
      { key: "shopId", label: "Shop-ID", type: "text", required: true },
      { key: "apiKey", label: "API-Key", type: "secret", required: true },
      { key: "scriptUrl", label: "Skript-URL (optional)", type: "url", placeholder: "https://app.tracify.ai/tracify.js" },
    ],
  },

  // === AI ===
  {
    id: "p_gamma",
    name: "Gamma AI",
    vendor: "Gamma",
    description: "KI-generierte Marktanalyse-PDFs fuer das Trader Cockpit.",
    category: "AI",
    installed: false,
    enabled: false,
    url: "https://gamma.app/",
    configFields: [
      { key: "apiKey", label: "API-Key", type: "secret", required: true },
    ],
  },
];

const CAT_BADGE: Record<Category, string> = {
  Sync: "bg-blue-500/15 text-blue-700",
  Notifications: "bg-amber-500/15 text-amber-700",
  Video: "bg-purple-500/15 text-purple-700",
  Analytics: "bg-emerald-500/15 text-emerald-700",
  AI: "bg-pink-500/15 text-pink-700",
  Storage: "bg-slate-500/15 text-slate-700",
  "E-Mail-Marketing": "bg-orange-500/15 text-orange-700",
  Automation: "bg-cyan-500/15 text-cyan-700",
  Support: "bg-teal-500/15 text-teal-700",
  Tracking: "bg-indigo-500/15 text-indigo-700",
};

const STORAGE_STATE = "traderiq:plugins-state";
const STORAGE_CONFIG = "traderiq:plugins-config";

interface PluginState {
  installed: boolean;
  enabled: boolean;
}

export function PluginsSection() {
  const [state, setState] = useState<Record<string, PluginState>>({});
  const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState<"all" | Category>("all");
  const [configuring, setConfiguring] = useState<Plugin | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const s = localStorage.getItem(STORAGE_STATE);
      const c = localStorage.getItem(STORAGE_CONFIG);
      if (s) setState(JSON.parse(s));
      if (c) setConfigs(JSON.parse(c));
    } catch {}
  }, []);

  function getState(p: Plugin): PluginState {
    return state[p.id] ?? { installed: p.installed, enabled: p.enabled };
  }
  function persistState(next: Record<string, PluginState>) {
    setState(next);
    localStorage.setItem(STORAGE_STATE, JSON.stringify(next));
  }
  function persistConfig(next: Record<string, Record<string, string>>) {
    setConfigs(next);
    localStorage.setItem(STORAGE_CONFIG, JSON.stringify(next));
  }

  function install(p: Plugin) {
    persistState({ ...state, [p.id]: { installed: true, enabled: true } });
    setConfiguring(p);
  }
  function toggleEnable(p: Plugin) {
    const s = getState(p);
    persistState({ ...state, [p.id]: { ...s, enabled: !s.enabled } });
  }
  function uninstall(p: Plugin) {
    if (!confirm("Plugin wirklich deinstallieren? Konfiguration geht verloren.")) return;
    const nextState = { ...state, [p.id]: { installed: false, enabled: false } };
    const nextConfig = { ...configs };
    delete nextConfig[p.id];
    persistState(nextState);
    persistConfig(nextConfig);
  }

  if (!mounted) return null;

  const categories = Array.from(new Set(PLUGINS.map((p) => p.category)));
  const visiblePlugins = filter === "all" ? PLUGINS : PLUGINS.filter((p) => p.category === filter);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Plugin-Marketplace fuer externe Integrationen. Klick „Installieren" → Konfiguration im Modal (API-Keys, Secrets).
      </p>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
            filter === "all" ? "bg-brand text-white" : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Alle
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
              filter === cat ? "bg-brand text-white" : `${CAT_BADGE[cat]} hover:opacity-80`
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {visiblePlugins.map((p) => {
          const s = getState(p);
          const cfg = configs[p.id] ?? {};
          const cfgComplete = p.configFields.filter((f) => f.required).every((f) => Boolean(cfg[f.key]));
          return (
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
                {s.installed && s.enabled && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-profit/15 px-2 py-0.5 text-[10px] font-semibold text-profit">
                    <Check className="h-3 w-3" /> Aktiv
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{p.description}</p>

              {s.installed && !cfgComplete && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Konfiguration unvollstaendig
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {!s.installed ? (
                  <button onClick={() => install(p)} className="btn-brand inline-flex items-center gap-1">
                    <Puzzle className="h-3.5 w-3.5" /> Installieren
                  </button>
                ) : (
                  <>
                    <button onClick={() => toggleEnable(p)} className="btn-secondary inline-flex items-center gap-1">
                      {s.enabled ? "Deaktivieren" : "Aktivieren"}
                    </button>
                    <button onClick={() => setConfiguring(p)} className="btn-secondary inline-flex items-center gap-1">
                      <Settings className="h-3.5 w-3.5" /> Konfigurieren
                    </button>
                    <button onClick={() => uninstall(p)} className="btn-ghost text-xs text-destructive">
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
          );
        })}
      </div>

      {configuring && (
        <ConfigModal
          plugin={configuring}
          values={configs[configuring.id] ?? {}}
          onClose={() => setConfiguring(null)}
          onSave={(values) => {
            persistConfig({ ...configs, [configuring.id]: values });
            setConfiguring(null);
          }}
        />
      )}
    </div>
  );
}

function ConfigModal({
  plugin,
  values,
  onClose,
  onSave,
}: {
  plugin: Plugin;
  values: Record<string, string>;
  onClose: () => void;
  onSave: (next: Record<string, string>) => void;
}) {
  const [draft, setDraft] = useState<Record<string, string>>(values);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [testing, setTesting] = useState(false);
  const [testOk, setTestOk] = useState<null | boolean>(null);

  function update(key: string, value: string) {
    setDraft({ ...draft, [key]: value });
    setTestOk(null);
  }

  async function testConnection() {
    setTesting(true);
    setTestOk(null);
    await new Promise((r) => setTimeout(r, 700));
    const requiredOk = plugin.configFields.filter((f) => f.required).every((f) => Boolean(draft[f.key]));
    setTesting(false);
    setTestOk(requiredOk);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="card-base w-full max-w-xl p-6">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold inline-flex items-center gap-2">
              <Puzzle className="h-4 w-4 text-brand" /> {plugin.name}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{plugin.description}</p>
          </div>
          <button onClick={onClose} aria-label="Schliessen" className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {plugin.configFields.map((f) => {
            const isSecret = f.type === "secret";
            const visible = showSecrets[f.key] ?? false;
            return (
              <label key={f.key} className="block text-xs">
                <span className="mb-1 block font-semibold">
                  {f.label}
                  {f.required && <span className="text-loss"> *</span>}
                </span>
                <div className="relative">
                  <input
                    type={isSecret && !visible ? "password" : f.type === "url" ? "url" : "text"}
                    className="input-base pr-9 font-mono text-[11px]"
                    placeholder={f.placeholder}
                    value={draft[f.key] ?? ""}
                    onChange={(e) => update(f.key, e.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {isSecret && (
                    <button
                      type="button"
                      onClick={() => setShowSecrets({ ...showSecrets, [f.key]: !visible })}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label={visible ? "Verbergen" : "Anzeigen"}
                    >
                      {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  )}
                </div>
                {f.hint && <span className="mt-1 block text-[10px] text-muted-foreground">{f.hint}</span>}
              </label>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
          {testOk === true && (
            <span className="inline-flex items-center gap-1 rounded-md bg-profit/15 px-2 py-0.5 text-[11px] text-profit">
              <CheckCircle2 className="h-3 w-3" /> Verbindungstest erfolgreich (Demo)
            </span>
          )}
          {testOk === false && (
            <span className="inline-flex items-center gap-1 rounded-md bg-loss/15 px-2 py-0.5 text-[11px] text-loss">
              Pflichtfelder fehlen
            </span>
          )}
          <button onClick={testConnection} disabled={testing} className="btn-secondary inline-flex items-center gap-2">
            {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Settings className="h-3.5 w-3.5" />}
            Verbindung testen
          </button>
          <button onClick={onClose} className="btn-ghost">Abbrechen</button>
          <button onClick={() => onSave(draft)} className="btn-brand inline-flex items-center gap-1">
            <Save className="h-3.5 w-3.5" /> Speichern
          </button>
        </div>
      </div>
    </div>
  );
}
