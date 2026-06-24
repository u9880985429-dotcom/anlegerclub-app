"use client";
import { useEffect, useState } from "react";
import { Plus, Copy, Trash2, KeyRound, Check, Terminal, Send, Loader2 } from "lucide-react";
import { readApiKeys, writeApiKeys, generateApiKey, type StoredApiKey } from "@/lib/api-keys";

type ApiKey = StoredApiKey;

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

export function ApiKeysSection() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [revealKey, setRevealKey] = useState<{ id: string; full: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; ok: boolean; body: string } | null>(null);

  // Lade gespeicherte Keys aus localStorage
  useEffect(() => {
    setKeys(readApiKeys());
  }, []);

  function persistKeys(next: ApiKey[]) {
    setKeys(next);
    writeApiKeys(next);
  }

  function generateKey(name: string, scopes: string[]) {
    const newKey = generateApiKey(name, scopes);
    const next = [newKey, ...keys];
    persistKeys(next);
    setRevealKey({ id: newKey.id, full: newKey.fullKey });
    setShowForm(false);
  }

  function revoke(id: string) {
    if (!confirm("Diesen API-Key wirklich widerrufen? Alle Anfragen mit diesem Key werden ab sofort abgelehnt.")) return;
    persistKeys(keys.filter((k) => k.id !== id));
  }

  function copyKey(id: string, key: string) {
    void navigator.clipboard?.writeText(key);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function testKey(id: string, key: string) {
    setTestingId(id);
    setTestResult(null);
    try {
      const res = await fetch("/api/v1/ping", { headers: { "X-API-Key": key } });
      const json = await res.json();
      setTestResult({ id, ok: res.ok, body: JSON.stringify(json, null, 2) });
      // Update lastUsedAt lokal
      persistKeys(keys.map((k) => (k.id === id ? { ...k, lastUsedAt: new Date().toISOString() } : k)));
    } catch (err) {
      setTestResult({ id, ok: false, body: String(err) });
    } finally {
      setTestingId(null);
    }
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

          {/* Sofort-Test-Snippet */}
          <details className="mt-3 rounded-md border border-border bg-card p-2 text-xs">
            <summary className="cursor-pointer font-semibold inline-flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5" /> So testest du den Key (curl)
            </summary>
            <pre className="mt-2 overflow-x-auto rounded bg-muted/50 p-2 font-mono text-xs">{`curl -H "X-API-Key: ${revealKey.full}" \\
  https://anlegerclub-app-web.vercel.app/api/v1/ping`}</pre>
            <div className="mt-1 text-xs text-muted-foreground">
              Endpoints: <code>/api/v1/ping</code>, <code>/api/v1/users</code>, <code>/api/v1/trades</code>, <code>/api/v1/subscriptions</code>
            </div>
          </details>

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
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => testKey(k.id, k.fullKey)}
                disabled={testingId === k.id}
                className="btn-secondary inline-flex items-center gap-1"
              >
                {testingId === k.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Test-Ping
              </button>
              <button
                onClick={() => revoke(k.id)}
                className="btn-secondary inline-flex items-center gap-1 text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" /> Widerrufen
              </button>
            </div>
          </div>
        ))}
        {testResult && (
          <div className={`p-3 ${testResult.ok ? "bg-profit/5 border-t border-profit/30" : "bg-destructive/5 border-t border-destructive/30"}`}>
            <div className={`mb-1 text-xs font-semibold ${testResult.ok ? "text-profit" : "text-destructive"}`}>
              {testResult.ok ? "✓ API antwortet sauber" : "✗ Fehler beim Test"}
            </div>
            <pre className="overflow-x-auto rounded bg-muted/40 p-2 font-mono text-xs">{testResult.body}</pre>
          </div>
        )}
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
              <code className="ml-auto font-mono text-xs text-muted-foreground">{s.value}</code>
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
