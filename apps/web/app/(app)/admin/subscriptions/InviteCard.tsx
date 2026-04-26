"use client";
import { useState } from "react";
import { Mail, Link2, Check, ExternalLink, Send } from "lucide-react";

interface InviteCardProps {
  slug: string;
  label: string;
  url: string;
}

const DEFAULT_SUBJECT = (label: string) => `Dein Zugang zu ${label} bei Trader IQ`;
const DEFAULT_BODY = (label: string, url: string) => `Hallo {Vorname},

vielen Dank für dein Interesse am ${label}!

Über folgenden Link kannst du dich registrieren und sofort starten:
${url}

Bei Fragen schreib uns einfach zurück.

Beste Grüße
Dein Trader-IQ-Team

—
Trader IQ Anlegerclub
info@traderiq.net
https://traderiq.net`;

export function InviteCard({ slug, label, url }: InviteCardProps) {
  const [mode, setMode] = useState<"none" | "mail" | "link">("none");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT(label));
  const [body, setBody] = useState(DEFAULT_BODY(label, url));
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  function copyLink() {
    void navigator.clipboard?.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function sendMail(e: React.FormEvent) {
    e.preventDefault();
    // Phase 1: Mailto-Fallback. Phase 2: Outlook-API-Versand via /api/admin/mail.
    const mailto = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (typeof window !== "undefined") window.location.href = mailto;
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <div className="card-base p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold">{label}</h3>
        <span className="badge-brand font-mono">{slug}</span>
      </div>
      <p className="mb-4 truncate font-mono text-xs text-muted-foreground" title={url}>{url}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setMode(mode === "mail" ? "none" : "mail")}
          className={`btn-secondary inline-flex items-center gap-1 ${mode === "mail" ? "border-brand text-brand" : ""}`}
        >
          <Mail className="h-3.5 w-3.5" /> Per Mail einladen
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "link" ? "none" : "link")}
          className={`btn-secondary inline-flex items-center gap-1 ${mode === "link" ? "border-brand text-brand" : ""}`}
        >
          <Link2 className="h-3.5 w-3.5" /> Link kopieren
        </button>
        <a href={url} target="_blank" rel="noreferrer" className="btn-ghost inline-flex items-center gap-1">
          <ExternalLink className="h-3.5 w-3.5" /> Vorschau
        </a>
      </div>

      {mode === "mail" && (
        <form onSubmit={sendMail} className="space-y-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-base"
            placeholder="kunde@example.com"
          />
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="input-base"
            placeholder="Betreff"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="input-base h-40 resize-y font-mono text-xs"
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Phase 2: Outlook/Microsoft-365-Direktversand statt Mailto.</span>
            <button type="submit" className="btn-brand inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> {sent ? "Gestartet ✓" : "Mail-Programm öffnen"}
            </button>
          </div>
        </form>
      )}

      {mode === "link" && (
        <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
          <div className="mb-2 truncate font-mono text-xs">{url}</div>
          <button onClick={copyLink} className="btn-brand inline-flex items-center gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
            {copied ? "In Zwischenablage kopiert" : "Link kopieren"}
          </button>
        </div>
      )}
    </div>
  );
}
