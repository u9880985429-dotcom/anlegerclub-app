"use client";
import { useState, Suspense } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Loader2, AlertCircle } from "lucide-react";

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (!res || res.error) {
      setError("E-Mail oder Passwort falsch.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  function fillDemo(email: string) {
    setEmail(email);
    setPassword("traderiq2026");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[400px] bg-gradient-to-b from-brand/10 to-transparent" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-10">
        <div className="mb-8">
          <Logo variant="light" size="lg" href="/" />
        </div>

        <div className="card-base w-full max-w-md p-6 shadow-lg shadow-brand/5">
          <h1 className="text-xl font-bold">Mitglieder-Login</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Melde dich mit deiner E-Mail und deinem Passwort an.
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
                placeholder="max@traderiq.net"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Passwort</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-base"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-brand w-full">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Anmelden"}
            </button>
          </form>

          <div className="mt-4 flex items-center justify-between text-xs">
            <Link href="/login/forgot-password" className="text-brand hover:underline">
              Passwort vergessen?
            </Link>
            <span className="text-muted-foreground">Phase 2: + SMS-OTP</span>
          </div>
        </div>

        {/* Demo-Login Helper Card */}
        <div className="mt-6 w-full max-w-md rounded-lg border border-dashed border-brand/40 bg-brand/5 p-5 text-sm">
          <div className="mb-3 font-semibold text-brand">📋 Phase-1-Demo-Logins</div>
          <p className="mb-3 text-xs text-muted-foreground">
            Klicke einen Eintrag, um die Felder vorzubefüllen. Passwort für alle:{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">traderiq2026</code>
          </p>
          <div className="space-y-1.5">
            <DemoBtn email="max@traderiq.net" label="Max (active · all-access)" onClick={fillDemo} />
            <DemoBtn email="paused@traderiq.net" label="Lisa (paused → /locked)" onClick={fillDemo} />
            <DemoBtn email="expired@traderiq.net" label="Tom (expired → /locked)" onClick={fillDemo} />
            <DemoBtn email="staff@traderiq.net" label="Admin (staff · /admin)" onClick={fillDemo} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoBtn({ email, label, onClick }: { email: string; label: string; onClick: (e: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(email)}
      className="flex w-full items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-left text-xs transition hover:border-brand/40"
    >
      <span className="font-mono text-muted-foreground">{email}</span>
      <span className="text-foreground">{label}</span>
    </button>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
