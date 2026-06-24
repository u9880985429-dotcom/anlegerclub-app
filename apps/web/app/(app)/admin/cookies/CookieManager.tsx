"use client";
import { useEffect, useState } from "react";
import { Cookie, Plus, Trash2, CheckCircle2, AlertCircle, Code } from "lucide-react";

type Category = "necessary" | "preferences" | "statistics" | "marketing";

interface CookieEntry {
  id: string;
  name: string;
  domain: string;
  category: Category;
  durationDays: number;
  purpose: string;
  isCustom: boolean;
}

interface BannerSettings {
  enabled: boolean;
  position: "bottom" | "top" | "modal";
  acceptAllByDefault: boolean;
  bannerText: string;
  privacyUrl: string;
}

const CATEGORY_LABEL: Record<Category, string> = {
  necessary: "Notwendig",
  preferences: "Praeferenzen",
  statistics: "Statistik",
  marketing: "Marketing",
};

const CATEGORY_COLOR: Record<Category, string> = {
  necessary: "bg-emerald-500/15 text-emerald-700",
  preferences: "bg-blue-500/15 text-blue-700",
  statistics: "bg-purple-500/15 text-purple-700",
  marketing: "bg-amber-500/15 text-amber-700",
};

const DEFAULT_COOKIES: CookieEntry[] = [
  { id: "c1", name: "next-auth.session-token", domain: "member.traderiq.net", category: "necessary", durationDays: 30, purpose: "Login-Session (NextAuth JWT)", isCustom: false },
  { id: "c2", name: "tiq_api_keys", domain: "member.traderiq.net", category: "necessary", durationDays: 365, purpose: "Server-Side-API-Key-Validierung im Admin-Backend.", isCustom: false },
  { id: "c3", name: "tiq_consent", domain: "member.traderiq.net", category: "necessary", durationDays: 365, purpose: "Speichert deine Cookie-Einstellungen.", isCustom: false },
  { id: "c4", name: "_ga", domain: ".traderiq.net", category: "statistics", durationDays: 730, purpose: "Google Analytics — Nutzer-ID fuer Reichweiten-Messung.", isCustom: false },
  { id: "c5", name: "_fbp", domain: ".traderiq.net", category: "marketing", durationDays: 90, purpose: "Meta-Pixel — Conversion-Tracking fuer Werbeanzeigen.", isCustom: false },
];

const DEFAULT_BANNER: BannerSettings = {
  enabled: true,
  position: "bottom",
  acceptAllByDefault: false,
  bannerText:
    "Wir verwenden Cookies, damit unsere App fuer dich funktioniert (z.B. Login-Session). Optional setzen wir mit deiner Zustimmung Statistik- und Marketing-Cookies, um unsere Inhalte zu verbessern.",
  privacyUrl: "/info#datenschutz",
};

const STORAGE_BANNER = "traderiq:cookie-banner";
const STORAGE_COOKIES = "traderiq:cookie-list";

export function CookieManager() {
  const [banner, setBanner] = useState<BannerSettings>(DEFAULT_BANNER);
  const [cookies, setCookies] = useState<CookieEntry[]>(DEFAULT_COOKIES);
  const [mounted, setMounted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Partial<CookieEntry>>({ category: "preferences", durationDays: 30 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const b = localStorage.getItem(STORAGE_BANNER);
      const c = localStorage.getItem(STORAGE_COOKIES);
      if (b) setBanner({ ...DEFAULT_BANNER, ...JSON.parse(b) });
      if (c) setCookies(JSON.parse(c));
    } catch {}
  }, []);

  function persistBanner(next: BannerSettings) {
    setBanner(next);
    localStorage.setItem(STORAGE_BANNER, JSON.stringify(next));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }
  function persistCookies(next: CookieEntry[]) {
    setCookies(next);
    localStorage.setItem(STORAGE_COOKIES, JSON.stringify(next));
  }

  function addCookie() {
    if (!draft.name || !draft.domain) return;
    const entry: CookieEntry = {
      id: `c_${Date.now().toString(36)}`,
      name: draft.name!,
      domain: draft.domain!,
      category: (draft.category as Category) ?? "preferences",
      durationDays: draft.durationDays ?? 30,
      purpose: draft.purpose ?? "",
      isCustom: true,
    };
    persistCookies([...cookies, entry]);
    setDraft({ category: "preferences", durationDays: 30 });
    setAdding(false);
  }

  function removeCookie(id: string) {
    if (!confirm("Cookie wirklich aus der Konfiguration entfernen?")) return;
    persistCookies(cookies.filter((c) => c.id !== id));
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Banner-Settings */}
      <div className="card-base p-5">
        <h3 className="mb-3 text-sm font-semibold">Cookie-Banner</h3>
        <Toggle
          label="Cookie-Banner anzeigen"
          description="Wenn deaktiviert, werden nur notwendige Cookies gesetzt — keine Einwilligungs-UI fuer den User."
          enabled={banner.enabled}
          onChange={(v) => persistBanner({ ...banner, enabled: v })}
        />
        <Toggle
          label='"Alle akzeptieren" als Default-Button hervorheben'
          description='Wenn aktiv, wird "Alle akzeptieren" visuell prominent. Sonst gleichberechtigt mit "Nur notwendige".'
          enabled={banner.acceptAllByDefault}
          onChange={(v) => persistBanner({ ...banner, acceptAllByDefault: v })}
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs">
            <span className="mb-1 block font-semibold">Banner-Position</span>
            <select
              className="input-base"
              value={banner.position}
              onChange={(e) => persistBanner({ ...banner, position: e.target.value as BannerSettings["position"] })}
            >
              <option value="bottom">Unten haftend</option>
              <option value="top">Oben haftend</option>
              <option value="modal">Modal (zentriert, blockierend)</option>
            </select>
          </label>
          <label className="block text-xs">
            <span className="mb-1 block font-semibold">Datenschutz-URL</span>
            <input className="input-base" value={banner.privacyUrl} onChange={(e) => persistBanner({ ...banner, privacyUrl: e.target.value })} />
          </label>
        </div>
        <label className="mt-3 block text-xs">
          <span className="mb-1 block font-semibold">Banner-Text</span>
          <textarea
            rows={3}
            className="input-base"
            value={banner.bannerText}
            onChange={(e) => persistBanner({ ...banner, bannerText: e.target.value })}
          />
        </label>
        {saved && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-md bg-profit/15 px-2 py-0.5 text-xs text-profit">
            <CheckCircle2 className="h-3 w-3" /> Gespeichert
          </span>
        )}
      </div>

      {/* Cookie-Liste */}
      <div className="card-base p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
            <Cookie className="h-4 w-4 text-brand" /> Cookies & Tracking-Codes
          </h3>
          <button onClick={() => setAdding(!adding)} className="btn-secondary inline-flex items-center gap-1 text-xs">
            <Plus className="h-3.5 w-3.5" /> {adding ? "Abbrechen" : "Eigenen Cookie hinzufuegen"}
          </button>
        </div>

        {adding && (
          <div className="mb-4 rounded-md border border-dashed border-brand/40 bg-brand/5 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs">
                <span className="mb-1 block font-semibold">Cookie-Name *</span>
                <input className="input-base font-mono" placeholder="_klicktipp_session" value={draft.name ?? ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block font-semibold">Domain *</span>
                <input className="input-base font-mono" placeholder=".traderiq.net" value={draft.domain ?? ""} onChange={(e) => setDraft({ ...draft, domain: e.target.value })} />
              </label>
              <label className="block text-xs">
                <span className="mb-1 block font-semibold">Kategorie</span>
                <select className="input-base" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as Category })}>
                  <option value="necessary">Notwendig</option>
                  <option value="preferences">Praeferenzen</option>
                  <option value="statistics">Statistik</option>
                  <option value="marketing">Marketing</option>
                </select>
              </label>
              <label className="block text-xs">
                <span className="mb-1 block font-semibold">Lebensdauer (Tage)</span>
                <input type="number" className="input-base" value={draft.durationDays ?? 30} onChange={(e) => setDraft({ ...draft, durationDays: Number(e.target.value) })} />
              </label>
              <label className="block text-xs sm:col-span-2">
                <span className="mb-1 block font-semibold">Zweck / Beschreibung</span>
                <textarea rows={2} className="input-base" placeholder="z.B. KlickTipp-Tag-Synchronisation" value={draft.purpose ?? ""} onChange={(e) => setDraft({ ...draft, purpose: e.target.value })} />
              </label>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <button onClick={() => { setAdding(false); setDraft({ category: "preferences", durationDays: 30 }); }} className="btn-ghost">Abbrechen</button>
              <button onClick={addCookie} disabled={!draft.name || !draft.domain} className="btn-brand">Hinzufuegen</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Domain</th>
                <th className="px-3 py-2">Kategorie</th>
                <th className="px-3 py-2">Laufzeit</th>
                <th className="px-3 py-2">Zweck</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cookies.map((c) => (
                <tr key={c.id} className="hover:bg-accent/40">
                  <td className="px-3 py-2 font-mono">
                    <Code className="mr-1 inline h-3 w-3 text-muted-foreground" />
                    {c.name}
                  </td>
                  <td className="px-3 py-2 font-mono text-muted-foreground">{c.domain}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ${CATEGORY_COLOR[c.category]}`}>
                      {CATEGORY_LABEL[c.category]}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono">{c.durationDays} Tage</td>
                  <td className="px-3 py-2 text-muted-foreground">{c.purpose}</td>
                  <td className="px-3 py-2 text-right">
                    {c.isCustom ? (
                      <button onClick={() => removeCookie(c.id)} className="btn-ghost text-destructive" aria-label="Cookie entfernen">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <AlertCircle className="h-3 w-3" /> System
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-pressed={enabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border transition ${enabled ? "border-brand bg-brand" : "border-border bg-muted"}`}
      >
        <span className={`absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? "translate-x-6" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
