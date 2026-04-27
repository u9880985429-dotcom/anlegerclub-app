"use client";
import { useState } from "react";
import { Plus, Copy, Trash2, Eye, EyeOff, KeyRound, Check } from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  prefix: string;       // sichtbarer Teil (z. B. "tiq_live_a3F9…")
  fullKey: string;      // Vollständig nur einmal angezeigt
  scopes: string[];
  createdAt: string;
  lastUsedAt: string | null;
}

const AVAILABLE_SCOPES = [
  { value: "trades.read", label: "Trades lesen" },
  { value: "trades.write", label: "Trades schreiben" },
  { value: "users.read", label: "User lesen" },
  { value: "users.write", label: "User schreiben" },
  { value: "subscriptions.read", label: "Subscriptions lesen" },
  { value: "subscriptions.write", label: "Subscriptions schreiben" },
  { value: "notifications.send", label: "Push/Mail senden" },
  { value: "audit.read", label: "Audit-Log lesen" },
];

const INITIAL_KEYS: ApiKey[] = [
  {
    id: "k_1",
    name: "Ablefy-Sync",
    prefix: "tiq_live_aB3F9k…",
    fullKey: "tiq_live_aB3F9kQrWzPlmN7XyZ8oP4kL2bV6hT",
    scopes: ["subscriptions.read", "subscriptions.write", "users.read"],
    createdAt: "2026-04-01T08:00:00Z",
    lastUsedAt: "2026-04-26T14:32:00Z",
  },
  {
    id: "k_2",
    name: "Push-Service (Expo)",
    prefix: "tiq_live_p8H2x…",
    fullKey: "tiq_live_p8H2xVnQrTYmK4LpDdF6oXhU9bN3wE",
    scopes: ["notifications.send"],
    createdAt: "2026-03-12T10:30:00Z",
    lastUsedAt: "2026-04-27T03:18:00Z",
  },
];

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>(INITIAL_KEYS);
  const [showForm, setShowForm] = useState(false);
  const [revealKey, setRevealKey] = useState<{ id: string; full: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function generateKey(name: string, scopes: string[]) {
    const random = Array.from({ length: 30 })
      .map(() => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(Math.floor(Math.random() * 62)))
      .join("");
    const fullKey = `tiq_live_${random}`;
    const prefix = `${fullKey.slice(0, 14)}…`;
    const id = `k_${Date.now()}`;
    const newKey: ApiKey = {
      id,
      name,
      prefix,
      fullKey,
      scopes,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
    };
    setKeys((prev) => [newKey, ...prev]);
    setRevealKey({ id, full: fullKey });
    setShowForm(false);
  }

  function revoke(id: string) {
    if (!confirm("Diesen API-Key wirklich widerrufen? Alle Anfragen mit diesem Key werden ab sofort abgelehnt.")) return;
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  function copyKey(id: string, key: string) {
    void navigator.clipboard?.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          API-Keys für externe Systeme (Ablefy, Push-Provider, n8n/Zapier, ITler-Tools).
          Keys werden nur einmal vollständig angezeigt — bewahre sie sicher auf.
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Neuer API-Key
        </button>
      </div>

      {showForm && <ApiKeyForm onCreate={generateKey} onCancel={() => setShowForm(false)} />}

      {revealKey && (
        <div className="rounded-md border border-brand/40 bg-brand/5 p-4">
          <div className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
            <KeyRound className="h-3.5 w-3.5" /> Neuer Key — JETZT KOPIEREN! Wird nicht erneut angezeigt.
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-card p-2">
            <code className="flex-1 break-all font-mono text-xs">{revealKey.full}</code>
            <button
              onClick={() => {
                copyKey(revealKey.id, revealKey.full);
              }}
              className="btn-secondary inline-flex items-center gap-1"
            >
              {copiedId === revealKey.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedId === revealKey.id ? "Kopiert" : "Kopieren"}
            </button>
          </div>
          <button
            onClick={() => setRevealKey(null)}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Schließen — habe den Key gesichert
          </button>
        </div>
      )}

      <div className="card-base divide-y divide-border">
        {keys.length === 0 && (
          <div className="p-5 text-sm text-muted-foreground">Keine aktiven API-Keys.</div>
        )}
        {keys.map((k) => (
          <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{k.name}</div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <code className="font-mono">{k.prefix}</code>
                <span>·</span>
                <span>Scopes: {k.scopes.length}</span>
                <span>·</span>
                <span>Erstellt: {new Date(k.createdAt).toLocaleDateString("de-DE")}</span>
                <span>·</span>
                <span>{k.lastUsedAt ? `Letzte Nutzung: ${new Date(k.lastUsedAt).toLocaleString("de-DE")}` : "Noch nicht genutzt"}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {k.scopes.map((s) => (
                  <span key={s} className="badge-base">{s}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => revoke(k.id)}
              className="btn-secondary inline-flex items-center gap-1 text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" /> Widerrufen
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ApiKeyForm({
  onCreate,
  onCancel,
}: {
  onCreate: (name: string, scopes: string[]) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);

  function toggleScope(s: string) {
    setScopes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || scopes.length === 0) return;
    onCreate(name.trim(), scopes);
  }

  return (
    <form onSubmit={submit} className="card-base p-4">
      <div className="mb-3">
        <label className="text-xs font-semibold">Name (intern)</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z. B. Ablefy-Sync, Push-Provider, ITler-Tool"
          className="input-base mt-1"
          required
        />
      </div>
      <div className="mb-3">
        <span className="text-xs font-semibold">Scopes (Berechtigungen)</span>
        <div className="mt-1 grid gap-1.5 sm:grid-cols-2">
          {AVAILABLE_SCOPES.map((s) => (
            <label key={s.value} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs transition hover:border-brand/40">
              <input
                type="checkbox"
                checked={scopes.includes(s.value)}
                onChange={() => toggleScope(s.value)}
                className="accent-brand"
              />
              <span>{s.label}</span>
              <code className="ml-auto font-mono text-[10px] text-muted-foreground">{s.value}</code>
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Abbrechen</button>
        <button type="submit" disabled={!name.trim() || scopes.length === 0} className="btn-brand">
          Key generieren
        </button>
      </div>
    </form>
  );
}
