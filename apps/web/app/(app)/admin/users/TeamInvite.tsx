"use client";
import { useState } from "react";
import { Mail, Send, UserPlus, Check, X } from "lucide-react";
import type { Role } from "@traderiq/api";

const TEAM_ROLES: { value: Exclude<Role, "MEMBER">; label: string; description: string }[] = [
  { value: "MODERATOR", label: "Moderator", description: "Posts verstecken, Reports bearbeiten" },
  { value: "ADMIN", label: "Admin", description: "Inhalte bearbeiten, Mitglieder verwalten" },
  { value: "STAFF", label: "Mitarbeiter", description: "Voller Zugriff auf alle Depots (PAID-Status)" },
  { value: "OWNER", label: "Owner / GF", description: "Vollzugriff auf alles inkl. Audit-Log" },
];

const DEFAULT_SUBJECT = (firstName: string, role: string) =>
  `Willkommen im Trader-IQ-Team, ${firstName}! Dein ${role}-Zugang`;

const DEFAULT_BODY = (firstName: string, role: string, registerLink: string) => `Hallo ${firstName},

willkommen im Trader-IQ-Team!

Dein Zugang als ${role} ist eingerichtet. Über folgenden Link kannst du deinen Account aktivieren und dein Passwort setzen:

${registerLink}

Wichtig:
• Du wirst als Trader-IQ-Team-Mitglied geführt — dein voller Name + Rolle ist für Mitglieder sichtbar.
• Mitglieder werden in der Community immer nur als „Vorname N." angezeigt (Datenschutz).
• Bei Fragen schreib mir gerne direkt zurück.

Beste Grüße
Trader IQ Anlegerclub
info@traderiq.net`;

export function TeamInvite() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Exclude<Role, "MEMBER">>("MODERATOR");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);

  function applyDefaults() {
    const link = `https://anlegerclub-app-web.vercel.app/team/aktivieren?token=DEMO_${Date.now()}`;
    const roleLabel = TEAM_ROLES.find((r) => r.value === role)?.label ?? role;
    setSubject(DEFAULT_SUBJECT(firstName || "Vorname", roleLabel));
    setBody(DEFAULT_BODY(firstName || "Vorname", roleLabel, link));
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !firstName || !lastName) return;
    const finalSubject = subject || DEFAULT_SUBJECT(firstName, role);
    const finalBody = body || DEFAULT_BODY(firstName, role, "https://anlegerclub-app-web.vercel.app/team/aktivieren?token=DEMO");
    const mailto = `mailto:${email}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`;
    if (typeof window !== "undefined") window.location.href = mailto;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setOpen(false);
      setEmail("");
      setFirstName("");
      setLastName("");
      setSubject("");
      setBody("");
    }, 2500);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-brand inline-flex items-center gap-2"
      >
        <UserPlus className="h-4 w-4" />
        Teammitglied einladen
      </button>
    );
  }

  return (
    <div className="card-base p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold inline-flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Teammitglied einladen
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Sendet eine Einladungs-Mail mit Aktivierungs-Link. Im Gegensatz zu normalen Mitgliedern wird dieser User mit
            <strong className="text-foreground"> vollem Namen</strong> + <strong className="text-foreground">Trader-IQ-Badge</strong> in der Community angezeigt.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md p-2 text-muted-foreground transition hover:bg-accent"
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <form onSubmit={send} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="mb-1 block font-semibold">Vorname</span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="input-base"
              placeholder="z.B. Lars"
            />
          </label>
          <label className="text-xs">
            <span className="mb-1 block font-semibold">Nachname</span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="input-base"
              placeholder="z.B. Müller"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">
            <span className="mb-1 block font-semibold">E-Mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-base"
              placeholder="lars.mueller@traderiq.net"
            />
          </label>
          <label className="text-xs">
            <span className="mb-1 block font-semibold">Rolle</span>
            <select value={role} onChange={(e) => setRole(e.target.value as Exclude<Role, "MEMBER">)} className="input-base">
              {TEAM_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
          <strong className="text-foreground">{TEAM_ROLES.find((r) => r.value === role)?.label}-Rechte:</strong>{" "}
          {TEAM_ROLES.find((r) => r.value === role)?.description}
        </div>

        <details className="rounded-md border border-border bg-card">
          <summary
            className="cursor-pointer px-3 py-2 text-xs font-semibold"
            onClick={(e) => {
              if (!subject || !body) {
                e.preventDefault();
                applyDefaults();
                (e.target as HTMLElement).click();
              }
            }}
          >
            Mail-Vorlage anpassen (optional)
          </summary>
          <div className="space-y-2 border-t border-border p-3">
            <label className="text-xs">
              <span className="mb-1 block font-semibold">Betreff</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="input-base"
              />
            </label>
            <label className="text-xs">
              <span className="mb-1 block font-semibold">Nachricht</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="input-base h-44 resize-y font-mono text-xs"
              />
            </label>
            <p className="text-[10px] text-muted-foreground">
              Wenn leer: Standard-Vorlage wird verwendet (mit Vorname + Rolle + Aktivierungs-Link).
            </p>
          </div>
        </details>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-muted-foreground">
            Phase 2: Direktversand via Outlook (info@traderiq.net) statt Mailto.
          </span>
          <button type="submit" className="btn-brand inline-flex items-center gap-2">
            {sent ? (
              <>
                <Check className="h-4 w-4" /> Gestartet
              </>
            ) : (
              <>
                <Send className="h-4 w-4" /> Einladung senden
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
