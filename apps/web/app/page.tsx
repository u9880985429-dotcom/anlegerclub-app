import Link from "next/link";
import { ArrowRight, ShieldCheck, Bell, Users, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[1000px] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo variant="dark" size="md" href={null} />
        <Link href="/login" className="btn-secondary">
          Anmelden
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24 pt-12 lg:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <span className="badge-brand mb-5 inline-block">Mitgliederbereich · Phase 1 · Demo</span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            Dein <span className="text-brand">Trader IQ</span> Anlegerclub.
            <br />
            Komplett digital.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">
            Trades, Marktanalysen, Videos und Community – an einem Ort. Push-Benachrichtigungen, sobald die Redaktion handelt.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/login" className="btn-brand inline-flex items-center gap-2 px-6 py-3 text-base">
              Mitgliederbereich öffnen
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="https://traderiq.net/"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary px-6 py-3 text-base"
            >
              Mehr erfahren
            </a>
          </div>
        </div>

        {/* Feature grid */}
        <section className="mt-24 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          <Feature
            icon={Sparkles}
            title="Trade-Signale live"
            body="Jeder neue Kauf, jeder Stop-Move, jeder Take-Profit – im Format TT.MM.JJJJ + Aktion."
          />
          <Feature
            icon={Bell}
            title="Push & Mail"
            body="Du verpasst nie wieder ein Signal. Push und Mail nach deinen Vorlieben."
          />
          <Feature
            icon={Users}
            title="Community pro Depot"
            body="Diskutiere mit anderen Mitgliedern, frage Mods, lerne aus den Trades anderer."
          />
          <Feature
            icon={ShieldCheck}
            title="EU-Hosting & DSGVO"
            body="Deine Daten in Frankfurt. Kein Tracking, keine Drittanbieter-Cookies."
          />
        </section>

        {/* Demo logins hint */}
        <div className="mx-auto mt-20 max-w-2xl rounded-xl border border-dashed border-brand/40 bg-brand/5 p-6 text-sm">
          <div className="mb-3 flex items-center gap-2 font-semibold text-brand">
            <Sparkles className="h-4 w-4" />
            Phase 1 Demo-Logins
          </div>
          <p className="text-muted-foreground">
            Diese Musterapp läuft mit Mock-Daten. Klicke auf{" "}
            <Link href="/login" className="font-medium text-brand underline">
              Anmelden
            </Link>{" "}
            – dort findest du die 4 Demo-Accounts (active / paused / expired / staff).
          </p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Trader IQ Anlegerclub · Demo-Build · {" "}
        <a href="mailto:info@traderiq.net" className="underline hover:text-foreground">
          info@traderiq.net
        </a>
      </footer>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="card-base p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15">
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
