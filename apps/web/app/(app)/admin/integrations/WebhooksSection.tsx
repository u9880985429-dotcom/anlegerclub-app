"use client";
import { useState } from "react";
import { Plus, Trash2, ExternalLink, Send, Check } from "lucide-react";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  createdAt: string;
}

const AVAILABLE_EVENTS = [
  "trade.published",
  "trade.closed",
  "report.published",
  "report.monthly",
  "user.subscribed",
  "user.unsubscribed",
  "user.paused",
  "user.expired",
  "user.refunded",
  "community.post.new",
  "community.report.new",
  "community.strike.issued",
];

const INITIAL_HOOKS: Webhook[] = [
  {
    id: "wh_1",
    url: "https://hooks.zapier.com/hooks/catch/12345/abcdef",
    events: ["trade.published", "report.published"],
    secret: "whsec_••••••••",
    active: true,
    createdAt: "2026-04-10T08:00:00Z",
  },
  {
    id: "wh_2",
    url: "https://traderiq.app.n8n.cloud/webhook/ablefy-sync",
    events: ["user.subscribed", "user.paused", "user.expired", "user.refunded"],
    secret: "whsec_••••••••",
    active: true,
    createdAt: "2026-04-12T11:15:00Z",
  },
];

export function WebhooksSection() {
  const [hooks, setHooks] = useState<Webhook[]>(INITIAL_HOOKS);
  const [showForm, setShowForm] = useState(false);
  const [testStatus, setTestStatus] = useState<{ id: string; ok: boolean } | null>(null);

  function add(url: string, events: string[]) {
    const wh: Webhook = {
      id: `wh_${Date.now()}`,
      url,
      events,
      secret: `whsec_${Array.from({ length: 24 }).map(() => Math.random().toString(36).charAt(2)).join("")}`,
      active: true,
      createdAt: new Date().toISOString(),
    };
    setHooks((prev) => [wh, ...prev]);
    setShowForm(false);
  }

  function remove(id: string) {
    if (!confirm("Webhook wirklich entfernen?")) return;
    setHooks((prev) => prev.filter((w) => w.id !== id));
  }

  function toggleActive(id: string) {
    setHooks((prev) => prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
  }

  function testWebhook(id: string) {
    setTestStatus({ id, ok: true });
    setTimeout(() => setTestStatus(null), 2500);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Webhooks erhalten POST-Requests bei den abonnierten Events. Signatur via HMAC-SHA256 mit dem Secret.
        </p>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand inline-flex items-center gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Neuer Webhook
        </button>
      </div>

      {showForm && <WebhookForm onCreate={add} onCancel={() => setShowForm(false)} />}

      <div className="card-base divide-y divide-border">
        {hooks.length === 0 && (
          <div className="p-5 text-sm text-muted-foreground">Keine Webhooks angelegt.</div>
        )}
        {hooks.map((w) => (
          <div key={w.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <code className="break-all font-mono text-xs">{w.url}</code>
                  {w.active ? (
                    <span className="badge-profit">Aktiv</span>
                  ) : (
                    <span className="badge-base">Inaktiv</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Erstellt: {new Date(w.createdAt).toLocaleDateString("de-DE")} · Secret: <code className="font-mono">{w.secret}</code>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {w.events.map((e) => (
                    <span key={e} className="badge-base">{e}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
                <button onClick={() => testWebhook(w.id)} className="btn-secondary inline-flex items-center gap-1">
                  {testStatus?.id === w.id ? <Check className="h-3.5 w-3.5 text-profit" /> : <Send className="h-3.5 w-3.5" />}
                  {testStatus?.id === w.id ? "Test gesendet" : "Test"}
                </button>
                <button onClick={() => toggleActive(w.id)} className="btn-secondary inline-flex items-center gap-1">
                  {w.active ? "Deaktivieren" : "Aktivieren"}
                </button>
                <button onClick={() => remove(w.id)} className="btn-secondary inline-flex items-center gap-1 text-destructive">
                  <Trash2 className="h-3.5 w-3.5" /> Entfernen
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WebhookForm({
  onCreate,
  onCancel,
}: {
  onCreate: (url: string, events: string[]) => void;
  onCancel: () => void;
}) {
  const [url, setUrl] = useState("https://");
  const [events, setEvents] = useState<string[]>([]);

  function toggleEvent(e: string) {
    setEvents((prev) => (prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.startsWith("https://")) return;
    if (events.length === 0) return;
    onCreate(url, events);
    setUrl("https://");
    setEvents([]);
  }

  return (
    <form onSubmit={submit} className="card-base p-4">
      <div className="mb-3">
        <label className="text-xs font-semibold">Webhook-URL (HTTPS only)</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input-base mt-1"
          placeholder="https://hooks.example.com/webhook"
          required
        />
      </div>
      <div className="mb-3">
        <span className="text-xs font-semibold">Events</span>
        <div className="mt-1 grid gap-1 sm:grid-cols-2">
          {AVAILABLE_EVENTS.map((ev) => (
            <label key={ev} className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs transition hover:border-brand/40">
              <input
                type="checkbox"
                checked={events.includes(ev)}
                onChange={() => toggleEvent(ev)}
                className="accent-brand"
              />
              <code className="font-mono">{ev}</code>
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Abbrechen</button>
        <button type="submit" disabled={!url.startsWith("https://") || events.length === 0} className="btn-brand">
          Webhook anlegen
        </button>
      </div>
    </form>
  );
}
