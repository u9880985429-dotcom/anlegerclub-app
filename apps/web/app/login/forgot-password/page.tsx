"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) {
      setError("Bitte gib eine gültige E-Mail-Adresse ein.");
      return;
    }
    setLoading(true);
    // Phase 1: Mock — keine echte Mail wird verschickt.
    // Phase 2: POST /api/auth/forgot-password → versendet Mail mit signed Reset-Token.
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-brand/10 to-transparent" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-8">
          <Logo variant="light" size="lg" href="/" />
        </div>

        <div className="card-base w-full max-w-md p-6 shadow-lg shadow-brand/5">
          <Link
            href="/login"
            className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Zurück zum Login
          </Link>

          {!submitted ? (
            <>
              <h1 className="text-xl font-bold">Passwort vergessen?</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Gib deine E-Mail-Adresse ein. Wir senden dir einen Link, mit dem du dein Passwort
                zurücksetzen kannst.
              </p>

              <form onSubmit={onSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">E-Mail</label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-base"
                    placeholder="deine@email.de"
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" disabled={loading} className="btn-brand w-full inline-flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Sende Link…
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" /> Reset-Link senden
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Der Link zum Zurücksetzen ist 30 Minuten gültig und kann nur einmal verwendet werden.
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-profit/15 text-profit">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-bold">Mail wird versendet</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Wenn ein Konto mit der E-Mail <strong>{email}</strong> existiert, haben wir dir gerade
                einen Link zum Zurücksetzen geschickt.
              </p>
              <div className="mt-4 rounded-md border border-dashed border-border bg-muted/40 p-3 text-left text-xs text-muted-foreground">
                <strong className="text-foreground">Tipp:</strong> Prüfe auch den Spam-Ordner. Der
                Link ist 30 Minuten gültig und kann nur einmal verwendet werden.
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <Link href="/login" className="btn-brand inline-flex items-center gap-2">
                  Zurück zum Login
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail("");
                  }}
                  className="btn-secondary"
                >
                  Andere E-Mail nutzen
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
