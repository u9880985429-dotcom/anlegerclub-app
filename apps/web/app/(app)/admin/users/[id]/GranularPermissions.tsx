"use client";
import { useEffect, useState } from "react";
import { Lock, Unlock, AlertTriangle } from "lucide-react";

interface AreaPermission {
  key: string;
  label: string;
  description: string;
}

const AREAS: AreaPermission[] = [
  { key: "depot.starter", label: "Starter Depot", description: "Welcome, Strategie, Trade-Signale, Auswertungen" },
  { key: "depot.trend", label: "Trend Depot", description: "Welcome, Strategie, Trade-Signale, Auswertungen" },
  { key: "depot.stillhalter", label: "Stillhalter Depot", description: "Welcome, Strategie, Trade-Signale, Auswertungen" },
  { key: "depot.cockpit", label: "Trader Cockpit", description: "Marktupdates, Earnings, Lexikon" },
  { key: "community.read", label: "Community lesen", description: "Posts, Kommentare, Reactions ansehen" },
  { key: "community.post", label: "Community posten", description: "Eigene Beiträge schreiben" },
  { key: "admin.users", label: "Admin: Mitglieder", description: "User-Liste + Profile + Rollen" },
  { key: "admin.subscriptions", label: "Admin: Subscriptions", description: "Abos einsehen und verwalten" },
  { key: "admin.community", label: "Admin: Mod-Queue", description: "Community moderieren, Strikes vergeben" },
  { key: "admin.integrations", label: "Admin: API/Webhooks/Plugins", description: "Externe Integrationen verwalten" },
  { key: "admin.audit", label: "Admin: Audit-Log", description: "Wer · Was · Wann · Warum" },
  { key: "billing.export", label: "Billing-Daten exportieren", description: "Umsätze + Subs als CSV/Excel" },
];

const STORAGE_KEY = (uid: string) => `traderiq:perms:${uid}`;

export function GranularPermissions({ userId, userName }: { userId: string; userName: string }) {
  const [grants, setGrants] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY(userId));
      if (raw) setGrants(JSON.parse(raw));
    } catch {
      // Defaults bleiben
    }
  }, [userId]);

  function toggle(key: string) {
    const next = { ...grants, [key]: !grants[key] };
    setGrants(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(next));
    }
  }

  function clearAll() {
    if (!confirm("Alle Bereichs-Berechtigungen für diesen User entfernen?")) return;
    setGrants({});
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY(userId));
    }
  }

  if (!mounted) {
    return <div className="card-base p-5 text-sm text-muted-foreground">Lade Berechtigungen…</div>;
  }

  const grantCount = Object.values(grants).filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4 text-xs text-amber-800">
        <div className="mb-1 inline-flex items-center gap-1.5 font-semibold">
          <AlertTriangle className="h-3.5 w-3.5" /> Achtung – additive Sonderrechte
        </div>
        Diese Toggles erlauben dir, einem User <strong>einzelne Bereiche zusätzlich</strong> freizugeben — z. B. einem ITler nur Zugang zu API/Webhooks, oder einem Ablefy-Mitarbeiter nur Subscriptions-Read. Sie überschreiben NICHT die Rolle, sondern erweitern sie. Aktionen werden im Audit-Log protokolliert.
      </div>

      <div className="card-base p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            <strong className="text-foreground">{grantCount}</strong> von {AREAS.length} Bereichen für{" "}
            <strong className="text-foreground">{userName}</strong> freigeschaltet.
          </div>
          {grantCount > 0 && (
            <button onClick={clearAll} className="btn-secondary text-xs text-destructive">
              Alle entfernen
            </button>
          )}
        </div>
        <div className="grid gap-2">
          {AREAS.map((a) => {
            const enabled = grants[a.key] === true;
            return (
              <label
                key={a.key}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 transition hover:border-brand/40"
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md ${enabled ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}>
                    {enabled ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{a.label}</div>
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                    <code className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{a.key}</code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(a.key)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border transition ${
                    enabled ? "border-brand bg-brand" : "border-border bg-muted"
                  }`}
                  aria-label={enabled ? "Berechtigung entfernen" : "Berechtigung gewähren"}
                  aria-pressed={enabled}
                >
                  <span
                    className={`absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      enabled ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
