import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { LogOut, ExternalLink, AlertTriangle, Pause, XCircle } from "lucide-react";
import {
  PRODUCT_LINKS,
  SUPPORT_EMAIL,
  endedText,
  pausedText,
  statusHeadline,
} from "@/lib/copy/login-status";
import { LogoutButton } from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

export default async function LockedPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const status = session.user.status;
  if (status === "ACTIVE" || status === "CANCELLED") {
    // Active users belong on the dashboard.
    redirect("/dashboard");
  }

  const vorname = session.user.firstName;
  const isPaused = status === "PAUSED";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border px-6">
        <Logo variant="dark" size="sm" href={null} />
        <LogoutButton />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="card-base w-full max-w-2xl p-8 shadow-lg">
          <div
            className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full ${
              isPaused ? "bg-amber-500/15 text-amber-500" : "bg-destructive/15 text-destructive"
            }`}
          >
            {isPaused ? <Pause className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
          </div>

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{statusHeadline(status)}</h1>

          {isPaused ? (
            <p className="mt-3 text-base text-muted-foreground">{pausedText(vorname)}</p>
          ) : (
            <>
              <p className="mt-3 text-base text-muted-foreground">{endedText(vorname)}</p>
              <ul className="mt-5 space-y-2">
                {PRODUCT_LINKS.map((link) => (
                  <li key={link.slug}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3 text-sm transition hover:border-brand/40 hover:bg-brand/5"
                    >
                      <span className="font-medium">{link.label}</span>
                      <ExternalLink className="h-4 w-4 text-brand" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-muted-foreground">
                Fragen? <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand underline">{SUPPORT_EMAIL}</a>
              </p>
            </>
          )}

          {isPaused && (
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://member.geldiq.com/account"
                target="_blank"
                rel="noreferrer"
                className="btn-brand inline-flex items-center gap-2"
              >
                Zahlungsdaten bei Ablefy aktualisieren
                <ExternalLink className="h-4 w-4" />
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="btn-secondary">
                Support kontaktieren
              </a>
            </div>
          )}

          <div className="mt-8 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span>
              Phase 2: Status-Sync via Ablefy-Webhooks. Aktuell zeigt die Demo den hardcoded Demo-Status für{" "}
              <strong>{session.user.email}</strong>.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
