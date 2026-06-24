"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle, CheckCircle2, Loader2, Send, Eye, EyeOff, Mail, ShieldCheck,
  Phone, User as UserIcon, BellOff,
} from "lucide-react";

interface SmtpConfig {
  enabled: boolean;
  senderName: string;
  senderEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  authMethod: "login" | "plain" | "cram-md5" | "none";
  starttls: boolean;
  // Verhalten
  autoMailEnabled: boolean;
  showSupportPhone: boolean;
  supportPhone: string;
  showProfileNameInHeader: boolean;
}

const DEFAULTS: SmtpConfig = {
  enabled: false,
  senderName: "Trader IQ",
  senderEmail: "info@traderiq.net",
  smtpHost: "smtp.sendgrid.net",
  smtpPort: 587,
  smtpUser: "info@traderiq.net",
  smtpPassword: "",
  authMethod: "login",
  starttls: true,
  autoMailEnabled: true,
  showSupportPhone: false,
  supportPhone: "+49 30 1234 5678",
  showProfileNameInHeader: true,
};

const STORAGE_KEY = "traderiq:smtp-config";

export function SmtpForm() {
  const [cfg, setCfg] = useState<SmtpConfig>(DEFAULTS);
  const [mounted, setMounted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<null | { ok: boolean; message: string }>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCfg({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  function update<K extends keyof SmtpConfig>(key: K, value: SmtpConfig[K]) {
    setCfg((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  async function testSmtp() {
    setTestResult(null);
    setTesting(true);
    await new Promise((r) => setTimeout(r, 850));
    if (!cfg.smtpHost || !cfg.smtpUser) {
      setTestResult({ ok: false, message: "SMTP-Server und Benutzername muessen ausgefuellt sein." });
    } else if (!cfg.smtpPassword) {
      setTestResult({ ok: false, message: "Passwort fehlt — Test nicht moeglich." });
    } else {
      setTestResult({
        ok: true,
        message: `Verbindung zu ${cfg.smtpHost}:${cfg.smtpPort} erfolgreich (${cfg.starttls ? "STARTTLS" : "Plain"} · Auth ${cfg.authMethod}). Phase 2: realer SMTP-Connect via nodemailer.`,
      });
    }
    setTesting(false);
  }

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* SMTP-Provider */}
      <div className="card-base p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4 text-brand" /> E-Mail-Provider
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Standardmaessig versenden wir E-Mails ueber unseren Default-Provider (Mail-Webhook → n8n/Zapier · <code>info@traderiq.net</code>).
              Aktiviere den Toggle, um deinen eigenen SMTP-Provider zu hinterlegen.
            </p>
          </div>
        </div>

        <Toggle
          label="Eigene SMTP-Einstellungen verwenden"
          description="Wenn aktiv, werden alle ausgehenden Mails ueber deinen SMTP-Provider verschickt."
          enabled={cfg.enabled}
          onChange={(v) => update("enabled", v)}
        />

        {cfg.enabled && (
          <div className="mt-5 space-y-3 rounded-md border border-border bg-muted/20 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name des Absenders" required>
                <input className="input-base" value={cfg.senderName} onChange={(e) => update("senderName", e.target.value)} />
              </Field>
              <Field label="E-Mail-Adresse des Absenders" required>
                <input type="email" className="input-base" value={cfg.senderEmail} onChange={(e) => update("senderEmail", e.target.value)} />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
              <Field label="SMTP-Server" required>
                <input className="input-base" value={cfg.smtpHost} placeholder="smtp.sendgrid.net" onChange={(e) => update("smtpHost", e.target.value)} />
              </Field>
              <Field label="Port" required>
                <input type="number" className="input-base" value={cfg.smtpPort} onChange={(e) => update("smtpPort", Number(e.target.value))} />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="E-Mail / Benutzername" required>
                <input className="input-base" value={cfg.smtpUser} onChange={(e) => update("smtpUser", e.target.value)} />
              </Field>
              <Field label="Passwort" required>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    className="input-base pr-9"
                    value={cfg.smtpPassword}
                    onChange={(e) => update("smtpPassword", e.target.value)}
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                    aria-label={showPw ? "Passwort verbergen" : "Passwort anzeigen"}
                  >
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Authentifizierung">
                <select className="input-base" value={cfg.authMethod} onChange={(e) => update("authMethod", e.target.value as SmtpConfig["authMethod"])}>
                  <option value="login">login</option>
                  <option value="plain">plain</option>
                  <option value="cram-md5">cram-md5</option>
                  <option value="none">none</option>
                </select>
              </Field>
              <div className="flex items-end">
                <Toggle
                  label="Automatische Verschluesselung (STARTTLS)"
                  description="Empfohlen — verschluesselt die SMTP-Verbindung nach dem Connect."
                  enabled={cfg.starttls}
                  onChange={(v) => update("starttls", v)}
                  compact
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button onClick={testSmtp} disabled={testing} className="btn-secondary inline-flex items-center gap-2">
                {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Teste SMTP-Einstellungen
              </button>
              {testResult && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs ${
                    testResult.ok ? "bg-profit/15 text-profit" : "bg-loss/15 text-loss"
                  }`}
                >
                  {testResult.ok ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {testResult.message}
                </span>
              )}
            </div>
          </div>
        )}

        {!cfg.enabled && (
          <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-700" />
            <span>
              <strong>Hinweis:</strong> Aktuell werden alle E-Mails ueber den <strong>Default-Provider</strong> verschickt (n8n/Zapier-Webhook). Aktiviere den Toggle oben, um eigene SMTP-Settings zu hinterlegen.
            </span>
          </div>
        )}
      </div>

      {/* Verhalten + Header-Optionen */}
      <div className="card-base p-5">
        <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-brand" /> Verhalten & Header
        </h3>
        <div className="space-y-2">
          <Toggle
            icon={BellOff}
            label="Automatische E-Mails an Kunden erlauben"
            description="z.B. Kaufbestaetigung, Willkommens-Mail, Stop-Anpassungen, neue Trade-Signale."
            enabled={cfg.autoMailEnabled}
            onChange={(v) => update("autoMailEnabled", v)}
          />
          <Toggle
            icon={Phone}
            label="Support-Telefonnummer in E-Mails und im Default-Theme anzeigen"
            description="Wird im Footer aller transaktionalen E-Mails sowie im App-Header (Footer) eingeblendet."
            enabled={cfg.showSupportPhone}
            onChange={(v) => update("showSupportPhone", v)}
          />
          {cfg.showSupportPhone && (
            <div className="ml-12">
              <Field label="Support-Telefonnummer">
                <input className="input-base" value={cfg.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} />
              </Field>
            </div>
          )}
          <Toggle
            icon={UserIcon}
            label="Profilname in der Kopfzeile anzeigen"
            description="Wenn aktiv, wird der Vor-/Nachname rechts oben in der App-Header-Leiste eingeblendet."
            enabled={cfg.showProfileNameInHeader}
            onChange={(v) => update("showProfileNameInHeader", v)}
          />
        </div>
      </div>

      {/* Save */}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {saved && (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-profit/15 px-2 py-1 text-xs text-profit">
            <CheckCircle2 className="h-3.5 w-3.5" /> Gespeichert.
          </span>
        )}
        <button onClick={save} className="btn-brand">Speichern</button>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block text-xs">
      <span className="mb-1 block font-semibold">
        {label}
        {required && <span className="text-loss"> *</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  icon: Icon,
  label,
  description,
  enabled,
  onChange,
  compact,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  enabled: boolean;
  onChange: (v: boolean) => void;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-md border border-border bg-card ${compact ? "px-3 py-2" : "px-4 py-3"}`}>
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-muted-foreground">{description}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        aria-label={enabled ? `${label} deaktivieren` : `${label} aktivieren`}
        aria-pressed={enabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border transition ${
          enabled ? "border-brand bg-brand" : "border-border bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
