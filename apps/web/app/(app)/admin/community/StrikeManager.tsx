"use client";
import { useMemo, useState } from "react";
import { AlertTriangle, ShieldOff, ShieldAlert, Plus, X } from "lucide-react";
import {
  initialStrikes,
  summarizeStrikes,
  SEVERITY_LABELS,
  SEVERITY_BADGE_CLASS,
  STRIKE_THRESHOLDS,
  type Strike,
  type StrikeReason,
  type StrikeSeverity,
} from "@traderiq/api";
import { formatRelative } from "@/lib/format";

const REASONS: StrikeReason[] = [
  "Beleidigung",
  "Werbung / Promo",
  "Spam",
  "Off-Topic",
  "Manipulation / Falschinformation",
  "Sonstiges",
];

const SEVERITIES: StrikeSeverity[] = ["WARN", "STRIKE", "MUTE_24H", "MUTE_7D", "BAN"];

const COMMON_USERS: { id: string; name: string }[] = [
  { id: "u_anonA", name: "Anonym A." },
  { id: "u_anonB", name: "Anonym B." },
  { id: "u_anonC", name: "Anonym C." },
  { id: "u_anna", name: "Anna Huber" },
  { id: "u_klaus", name: "Klaus Berger" },
  { id: "u_jonas", name: "Jonas Weiß" },
  { id: "u_petra", name: "Petra Fischer" },
];

export function StrikeManager() {
  const [strikes, setStrikes] = useState<Strike[]>(initialStrikes);
  const [showForm, setShowForm] = useState(false);

  const summaries = useMemo(() => summarizeStrikes(strikes), [strikes]);

  function addStrike(s: Omit<Strike, "id" | "createdAt">) {
    const full: Strike = {
      ...s,
      id: `strk_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setStrikes((prev) => [full, ...prev]);
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-amber-500/40 bg-amber-500/5 p-4 text-xs text-amber-800">
        ⚖️ <strong>Strike-System:</strong> Verstöße werden hier dokumentiert und sind für{" "}
        <strong>alle Mitarbeiter, Admins und Owner sichtbar</strong>. Empfehlung: ab{" "}
        <strong>{STRIKE_THRESHOLDS.warnEscalation} Verwarnungen</strong> → Strike, ab{" "}
        <strong>{STRIKE_THRESHOLDS.strikeEscalation} Strikes</strong> → Mute 7 Tage, ab{" "}
        <strong>{STRIKE_THRESHOLDS.banThreshold} Strikes</strong> → Permanent-Ban.
      </div>

      <div className="flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldAlert className="h-4 w-4" />
          Aktive User-Strikes ({summaries.length})
        </h3>
        <button onClick={() => setShowForm(!showForm)} className="btn-brand inline-flex items-center gap-1.5">
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "Abbrechen" : "Neuen Strike vergeben"}
        </button>
      </div>

      {showForm && <StrikeForm onSubmit={addStrike} onCancel={() => setShowForm(false)} />}

      {/* User-Übersicht */}
      <div className="card-base divide-y divide-border">
        {summaries.length === 0 && (
          <div className="p-5 text-sm text-muted-foreground">Keine aktiven Strikes. ✨</div>
        )}
        {summaries.map((s) => (
          <UserStrikeRow key={s.userId} summary={s} />
        ))}
      </div>

      {/* Recent strikes log */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Letzte Verstöße (Audit-Log)</h3>
        <div className="card-base divide-y divide-border">
          {strikes.slice(0, 6).map((s) => (
            <div key={s.id} className="p-4">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${SEVERITY_BADGE_CLASS[s.severity]}`}>
                  {SEVERITY_LABELS[s.severity]}
                </span>
                <span className="font-semibold">{s.userName}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{s.reason}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{formatRelative(s.createdAt)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{s.excerpt}</p>
              <div className="mt-1 text-[10px] text-muted-foreground">Vergeben durch: <strong className="text-foreground">{s.issuedByName}</strong></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserStrikeRow({ summary }: { summary: ReturnType<typeof summarizeStrikes>[number] }) {
  const total = summary.warnCount + summary.strikeCount;
  const recommendation = summary.isBanned
    ? null
    : summary.strikeCount >= STRIKE_THRESHOLDS.banThreshold
    ? "Empfehlung: Permanent-Ban."
    : summary.strikeCount >= STRIKE_THRESHOLDS.strikeEscalation
    ? "Empfehlung: Mute 7 Tage."
    : summary.warnCount >= STRIKE_THRESHOLDS.warnEscalation
    ? "Empfehlung: Strike vergeben."
    : null;

  return (
    <div className="flex flex-wrap items-start justify-between gap-3 p-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{summary.userName}</span>
          {summary.isBanned && (
            <span className="inline-flex items-center gap-1 rounded-md bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-700">
              <ShieldOff className="h-3 w-3" /> Gesperrt
            </span>
          )}
          {summary.isMuted && !summary.isBanned && (
            <span className="rounded-md bg-orange-500/15 px-2 py-0.5 text-[10px] font-semibold text-orange-700">Mute aktiv</span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Verwarnungen: <strong className="text-foreground">{summary.warnCount}</strong></span>
          <span>Strikes: <strong className="text-foreground">{summary.strikeCount}</strong></span>
          <span>Letzter Verstoß: {summary.lastStrikeAt ? formatRelative(summary.lastStrikeAt) : "—"}</span>
        </div>
        {recommendation && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1 text-[11px] text-amber-800">
            <AlertTriangle className="h-3 w-3" /> {recommendation}
          </div>
        )}
        <details className="mt-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium hover:text-foreground">Vollständige Historie ({total + (summary.isMuted ? 1 : 0)})</summary>
          <ul className="mt-2 space-y-1.5">
            {summary.history.map((h) => (
              <li key={h.id} className="flex items-start gap-2 rounded-md border border-border bg-muted/20 p-2">
                <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${SEVERITY_BADGE_CLASS[h.severity]}`}>
                  {SEVERITY_LABELS[h.severity]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-foreground">{h.reason}</div>
                  <div className="line-clamp-2">{h.excerpt}</div>
                  <div className="mt-0.5 text-[10px]">{formatRelative(h.createdAt)} · {h.issuedByName}</div>
                </div>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}

function StrikeForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (s: Omit<Strike, "id" | "createdAt">) => void;
  onCancel: () => void;
}) {
  const [userId, setUserId] = useState(COMMON_USERS[0]!.id);
  const [reason, setReason] = useState<StrikeReason>("Beleidigung");
  const [severity, setSeverity] = useState<StrikeSeverity>("STRIKE");
  const [excerpt, setExcerpt] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!excerpt.trim()) return;
    const user = COMMON_USERS.find((u) => u.id === userId)!;
    let expiresAt: string | null | undefined = undefined;
    if (severity === "MUTE_24H") expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    if (severity === "MUTE_7D") expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    if (severity === "BAN") expiresAt = null;
    onSubmit({
      userId,
      userName: user.name,
      reason,
      severity,
      excerpt,
      issuedById: "u_admin",
      issuedByName: "Admin Trader IQ",
      expiresAt,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="card-base p-4">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs">
          <span className="mb-1 block font-semibold">User</span>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} className="input-base">
            {COMMON_USERS.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold">Grund</span>
          <select value={reason} onChange={(e) => setReason(e.target.value as StrikeReason)} className="input-base">
            {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className="text-xs">
          <span className="mb-1 block font-semibold">Schweregrad</span>
          <select value={severity} onChange={(e) => setSeverity(e.target.value as StrikeSeverity)} className="input-base">
            {SEVERITIES.map((s) => <option key={s} value={s}>{SEVERITY_LABELS[s]}</option>)}
          </select>
        </label>
      </div>
      <label className="mt-3 block text-xs">
        <span className="mb-1 block font-semibold">Auszug / Begründung (intern)</span>
        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Beleidigender Wortlaut, Werbe-Link, etc. – diese Notiz sehen nur Mitarbeiter."
          className="input-base h-20 resize-y"
          required
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn-secondary inline-flex items-center gap-1">
          <X className="h-3.5 w-3.5" /> Abbrechen
        </button>
        <button type="submit" className="btn-brand inline-flex items-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5" /> Strike vergeben
        </button>
      </div>
    </form>
  );
}
