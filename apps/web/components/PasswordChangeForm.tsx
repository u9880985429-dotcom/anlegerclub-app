"use client";
import { useState } from "react";
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Shield } from "lucide-react";

/**
 * Passwort ändern (Settings → Sicherheit).
 *
 * Phase 1: Validiert lokal + Mock-Submit. Kein Backend-Call.
 * Phase 2: POST /api/auth/change-password mit currentPassword + newPassword.
 *  - Server verifiziert currentPassword via Argon2.verify()
 *  - Hasht neues Passwort, speichert in DB
 *  - Invalidiert alle anderen Sessions
 */
export function PasswordChangeForm() {
  const [open, setOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function reset() {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setError(null);
    setSuccess(false);
  }

  function strengthInfo(pw: string): { label: string; color: string; pct: number } {
    if (pw.length === 0) return { label: "—", color: "bg-muted", pct: 0 };
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 2) return { label: "Schwach", color: "bg-loss", pct: 33 };
    if (score === 3) return { label: "OK", color: "bg-amber-500", pct: 66 };
    return { label: "Stark", color: "bg-profit", pct: 100 };
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPw.length < 8) {
      setError("Neues Passwort muss mindestens 8 Zeichen haben.");
      return;
    }
    if (newPw === currentPw) {
      setError("Neues Passwort muss anders sein als das aktuelle.");
      return;
    }
    if (newPw !== confirmPw) {
      setError("Die beiden neuen Passwörter stimmen nicht überein.");
      return;
    }

    setLoading(true);
    // Phase 2: echter API-Call
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setOpen(false);
      reset();
    }, 2500);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-sm transition hover:border-brand/40"
      >
        <span className="flex items-center gap-3">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <span>
            <span className="block font-medium">Passwort ändern</span>
            <span className="block text-xs text-muted-foreground">Mindestens 8 Zeichen empfohlen</span>
          </span>
        </span>
        <span className="text-xs text-brand">Öffnen →</span>
      </button>
    );
  }

  const strength = strengthInfo(newPw);

  return (
    <form onSubmit={onSubmit} className="card-base p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
          <Shield className="h-4 w-4 text-brand" /> Passwort ändern
        </h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Abbrechen
        </button>
      </div>

      {/* Aktuelles Passwort */}
      <label className="mb-3 block text-xs">
        <span className="mb-1 block font-semibold">Aktuelles Passwort</span>
        <div className="relative">
          <input
            type={showCurrent ? "text" : "password"}
            value={currentPw}
            onChange={(e) => setCurrentPw(e.target.value)}
            className="input-base pr-10"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowCurrent(!showCurrent)}
            aria-label={showCurrent ? "Passwort verbergen" : "Passwort anzeigen"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
      </label>

      {/* Neues Passwort */}
      <label className="mb-3 block text-xs">
        <span className="mb-1 flex items-center justify-between">
          <span className="font-semibold">Neues Passwort</span>
          {newPw && (
            <span className="text-xs text-muted-foreground">Stärke: <strong className="text-foreground">{strength.label}</strong></span>
          )}
        </span>
        <div className="relative">
          <input
            type={showNew ? "text" : "password"}
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            className="input-base pr-10"
            placeholder="Mindestens 8 Zeichen"
            required
            minLength={8}
            autoComplete="new-password"
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            aria-label={showNew ? "Passwort verbergen" : "Passwort anzeigen"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        {newPw && (
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full transition-all ${strength.color}`}
              style={{ width: `${strength.pct}%` }}
            />
          </div>
        )}
      </label>

      {/* Bestätigung */}
      <label className="mb-3 block text-xs">
        <span className="mb-1 block font-semibold">Neues Passwort bestätigen</span>
        <input
          type={showNew ? "text" : "password"}
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          className="input-base"
          placeholder="Passwort wiederholen"
          required
          autoComplete="new-password"
        />
        {confirmPw && newPw && confirmPw !== newPw && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-loss">
            <AlertCircle className="h-3 w-3" /> Passwörter stimmen nicht überein
          </span>
        )}
        {confirmPw && newPw && confirmPw === newPw && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-profit">
            <CheckCircle2 className="h-3 w-3" /> Passwörter stimmen überein
          </span>
        )}
      </label>

      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-3 flex items-start gap-2 rounded-md border border-profit/40 bg-profit/5 p-2 text-xs text-profit">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
          <span>Passwort erfolgreich geändert. Andere Sessions werden in Phase 2 automatisch abgemeldet.</span>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="submit"
          disabled={loading || !currentPw || !newPw || !confirmPw}
          className="btn-brand inline-flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Speichere…
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" /> Passwort ändern
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Phase 1: Demo-Modus — keine echte Speicherung. Phase 2: Argon2id-Hash + Invalidierung anderer Sessions.
      </p>
    </form>
  );
}
