"use client";
import { useMemo, useState } from "react";
import {
  Mail, Bell, Plug, Webhook, Activity, FileSpreadsheet, Search, Download,
  CheckCircle2, AlertCircle, XCircle, Clock,
} from "lucide-react";

type Tab = "email" | "push" | "integrations" | "webhooks" | "tracking" | "csv";
type Status = "ok" | "pending" | "warn" | "error";

interface LogRow {
  id: string;
  ts: string;
  status: Status;
  primary: string;
  secondary: string;
  meta: string;
}

const EMAIL_LOGS: LogRow[] = [
  { id: "e1", ts: "2026-04-27 09:14:12", status: "ok", primary: "neuer-trade@traderiq.net", secondary: "anna.huber@example.com", meta: "Template: trade-signal · 142 ms" },
  { id: "e2", ts: "2026-04-27 09:14:11", status: "ok", primary: "neuer-trade@traderiq.net", secondary: "klaus.berger@example.com", meta: "Template: trade-signal · 98 ms" },
  { id: "e3", ts: "2026-04-27 08:42:03", status: "warn", primary: "wochenblick@traderiq.net", secondary: "j.weiss@example.com", meta: "Soft bounce · re-queued" },
  { id: "e4", ts: "2026-04-27 08:31:55", status: "ok", primary: "willkommen@traderiq.net", secondary: "starter.demo@traderiq.net", meta: "Onboarding · 188 ms" },
  { id: "e5", ts: "2026-04-26 22:02:11", status: "error", primary: "newsletter@traderiq.net", secondary: "p.fischer@example.com", meta: "Hard bounce · invalid mailbox" },
  { id: "e6", ts: "2026-04-26 19:45:09", status: "ok", primary: "passwort-reset@traderiq.net", secondary: "max@traderiq.net", meta: "Reset-Token · 64 ms" },
];

const PUSH_LOGS: LogRow[] = [
  { id: "p1", ts: "2026-04-27 09:14:14", status: "ok", primary: "Neuer Trade: AVGO Kauf", secondary: "Empfaenger: 247", meta: "FCM 198 · APNs 49" },
  { id: "p2", ts: "2026-04-27 08:00:01", status: "ok", primary: "Tagesblick verfuegbar", secondary: "Empfaenger: 312", meta: "FCM 251 · APNs 61" },
  { id: "p3", ts: "2026-04-27 07:42:17", status: "warn", primary: "Erwaehnung @michael.s.", secondary: "Empfaenger: 1", meta: "APNs token expired" },
  { id: "p4", ts: "2026-04-26 18:30:00", status: "ok", primary: "Stop angepasst: MRNA", secondary: "Empfaenger: 188", meta: "FCM 152 · APNs 36" },
  { id: "p5", ts: "2026-04-26 12:15:33", status: "error", primary: "Webinar startet in 15 Min", secondary: "Empfaenger: 0", meta: "Provider down · re-queued" },
];

const INT_LOGS: LogRow[] = [
  { id: "i1", ts: "2026-04-27 09:00:00", status: "ok", primary: "Ablefy → Sub-Sync", secondary: "12 neue Subscriptions", meta: "POST /v2/subscriptions · 312 ms" },
  { id: "i2", ts: "2026-04-27 08:30:00", status: "ok", primary: "KlickTipp → Tag-Update", secondary: "anna.huber+stillhalter-active", meta: "POST /api/tag · 88 ms" },
  { id: "i3", ts: "2026-04-27 07:15:00", status: "warn", primary: "Vimeo → Video-Status", secondary: "Embed-Token expired", meta: "GET /me/videos · 401 · re-auth gequeued" },
  { id: "i4", ts: "2026-04-26 23:00:00", status: "ok", primary: "Tracify → Conversion-Sync", secondary: "5 Conversions", meta: "POST /events · 142 ms" },
];

const WEBHOOK_LOGS: LogRow[] = [
  { id: "w1", ts: "2026-04-27 09:14:00", status: "ok", primary: "POST → n8n.traderiq.net/hook/new-trade", secondary: "200 OK", meta: "Body: 1.2 KB · 78 ms" },
  { id: "w2", ts: "2026-04-27 08:00:00", status: "ok", primary: "POST → zapier.com/hooks/T-9aFq", secondary: "200 OK", meta: "Body: 0.6 KB · 124 ms" },
  { id: "w3", ts: "2026-04-26 22:30:00", status: "error", primary: "POST → custom.example.net/sub-event", secondary: "500 Internal Server Error", meta: "Retry 3/3 · gibt auf" },
  { id: "w4", ts: "2026-04-26 14:12:11", status: "pending", primary: "POST → activecampaign.com/hooks/...", secondary: "queued", meta: "Wait 1.2s · backoff" },
];

const TRACKING_LOGS: LogRow[] = [
  { id: "t1", ts: "2026-04-27 09:00:00", status: "ok", primary: "GA4 / page_view", secondary: "/dashboard", meta: "Client-ID 18a... · 12 events" },
  { id: "t2", ts: "2026-04-27 08:55:00", status: "ok", primary: "Tracify / pageView", secondary: "/depot/trend", meta: "Visitor 9c2... · 1 event" },
  { id: "t3", ts: "2026-04-27 08:54:32", status: "ok", primary: "Custom Pixel / signup", secondary: "/onboarding/starter", meta: "uid u_starter_only · 1 event" },
  { id: "t4", ts: "2026-04-27 08:52:11", status: "warn", primary: "Meta-Pixel / PageView", secondary: "blocked-by-consent", meta: "User hat Marketing-Cookies abgelehnt" },
];

const CSV_LOGS: LogRow[] = [
  { id: "c1", ts: "2026-04-26 18:42:00", status: "ok", primary: "members-export.csv", secondary: "1.241 Datensaetze", meta: "Erstellt von max@traderiq.net · 224 KB" },
  { id: "c2", ts: "2026-04-25 11:03:21", status: "ok", primary: "subscriptions-2026-Q1.csv", secondary: "318 Datensaetze", meta: "Erstellt von andrei@traderiq.net · 89 KB" },
  { id: "c3", ts: "2026-04-22 16:30:09", status: "ok", primary: "audit-log-april.csv", secondary: "4.812 Datensaetze", meta: "Erstellt von max@traderiq.net · 1.1 MB" },
  { id: "c4", ts: "2026-04-19 09:11:48", status: "warn", primary: "trades-export-q1.csv", secondary: "Teilexport (Timeout)", meta: "Erneut anfordern empfohlen" },
];

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }>; rows: LogRow[]; }[] = [
  { key: "email", label: "E-Mails", icon: Mail, rows: EMAIL_LOGS },
  { key: "push", label: "Push-Benachrichtigungen", icon: Bell, rows: PUSH_LOGS },
  { key: "integrations", label: "Integrationen", icon: Plug, rows: INT_LOGS },
  { key: "webhooks", label: "Webhooks", icon: Webhook, rows: WEBHOOK_LOGS },
  { key: "tracking", label: "Custom Tracking", icon: Activity, rows: TRACKING_LOGS },
  { key: "csv", label: "CSV-Exporte", icon: FileSpreadsheet, rows: CSV_LOGS },
];

const STATUS_META: Record<Status, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  ok: { label: "OK", cls: "bg-profit/15 text-profit", icon: CheckCircle2 },
  pending: { label: "Pending", cls: "bg-blue-500/15 text-blue-700", icon: Clock },
  warn: { label: "Warnung", cls: "bg-amber-500/15 text-amber-700", icon: AlertCircle },
  error: { label: "Fehler", cls: "bg-loss/15 text-loss", icon: XCircle },
};

export function LogsTabs() {
  const [active, setActive] = useState<Tab>("email");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | Status>("all");

  const tab = TABS.find((t) => t.key === active)!;
  const filtered = useMemo(() => {
    return tab.rows.filter((r) => {
      if (filter !== "all" && r.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        r.primary.toLowerCase().includes(q) ||
        r.secondary.toLowerCase().includes(q) ||
        r.meta.toLowerCase().includes(q) ||
        r.ts.includes(q)
      );
    });
  }, [tab, filter, query]);

  function exportCsv() {
    const header = ["timestamp", "status", "primary", "secondary", "meta"].join(",");
    const body = filtered
      .map((r) => [r.ts, r.status, r.primary, r.secondary, r.meta].map((c) => `"${c.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logs-${active}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      {/* Tab-Leiste */}
      <div className="flex flex-wrap gap-1 border-b border-border px-3 pt-2">
        {TABS.map((t) => {
          const isActive = t.key === active;
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition ${
                isActive ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
              <span className={`ml-1 rounded-full px-1.5 py-px text-[10px] ${isActive ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}>
                {t.rows.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/20 px-3 py-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suche in Logs ..."
            className="input-base h-8 w-full pl-8 text-xs"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | Status)}
          className="input-base h-8 text-xs"
        >
          <option value="all">Alle Status</option>
          <option value="ok">OK</option>
          <option value="pending">Pending</option>
          <option value="warn">Warnung</option>
          <option value="error">Fehler</option>
        </select>
        <button onClick={exportCsv} className="btn-secondary inline-flex h-8 items-center gap-1 text-xs">
          <Download className="h-3.5 w-3.5" /> CSV
        </button>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr className="border-b border-border bg-muted/10">
              <th className="px-3 py-2 whitespace-nowrap">Zeitstempel</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Ereignis</th>
              <th className="px-3 py-2">Empfaenger / Ziel</th>
              <th className="px-3 py-2">Meta</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                  Keine Eintraege fuer diese Suche / diesen Filter.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const meta = STATUS_META[r.status];
                const Icon = meta.icon;
                return (
                  <tr key={r.id} className="hover:bg-accent/40">
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{r.ts}</td>
                    <td className="px-3 py-2">
                      <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold ${meta.cls}`}>
                        <Icon className="h-3 w-3" /> {meta.label}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-medium">{r.primary}</td>
                    <td className="px-3 py-2 text-muted-foreground">{r.secondary}</td>
                    <td className="px-3 py-2 font-mono text-[10px] text-muted-foreground">{r.meta}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
        {filtered.length} von {tab.rows.length} Eintraegen
      </div>
    </div>
  );
}
