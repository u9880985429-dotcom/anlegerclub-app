import Link from "next/link";
import { ArrowRight, Bell, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SignalTape } from "@/components/SignalTape";

export default function MarketingPage() {
  return (
    <div className="relative min-h-screen">
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo variant="light" size="md" href={null} />
        <Link href="/login" className="btn-secondary">
          Anmelden
        </Link>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 lg:pt-12">
        {/* Hero als Bento: Claim links, Signatur-Element (Signal-Tape) rechts. */}
        <section className="grid items-stretch gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="card-elevated flex flex-col justify-center p-7 sm:p-9">
            <span className="badge-brand mb-5 w-fit">Mitgliederbereich · Trader IQ Anlegerclub</span>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-navy-900 md:text-5xl">
              Wir bilden <span className="text-brand">Investoren</span> aus.
            </h1>
            <p className="mt-5 max-w-md text-lg text-muted-foreground">
              Trades, Marktanalysen, Videos und Community an einem Ort. Du bekommst eine Nachricht,
              sobald die Redaktion handelt.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/login" className="btn-brand inline-flex items-center gap-2 px-6 py-3 text-base">
                Mitgliederbereich öffnen
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/info" className="btn-secondary px-6 py-3 text-base">
                Mehr erfahren
              </Link>
            </div>
          </div>

          {/* Signatur: ruhiges, dunkles Signal-Tape — der eine wiedererkennbare Block. */}
          <SignalTape />
        </section>

        {/* Sekundaer-Bento — bewusst ungleich gross: breiter Ablauf + schmaler Vertrauensblock. */}
        <section className="mt-5 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
          {/* Breiter Block: echter Ablauf in drei Schritten (Reihenfolge traegt Bedeutung). */}
          <div className="card-base p-7 sm:p-8">
            <h2 className="font-display text-xl font-bold tracking-tight text-navy-900">
              So läuft ein Signal bei dir an
            </h2>
            <ol className="mt-6 grid gap-6 sm:grid-cols-3">
              <Step
                no="01"
                title="Redaktion handelt"
                body="Ein neuer Kauf, ein angepasster Stop oder ein Gewinn wird im Depot eingetragen."
              />
              <Step
                no="02"
                title="Du wirst benachrichtigt"
                body="Push aufs Handy und Mail — je nachdem, was dir lieber ist. Du verpasst nichts."
              />
              <Step
                no="03"
                title="Du fragst nach"
                body="Unter jedem Signal kannst du mit der Redaktion und anderen Mitgliedern reden."
              />
            </ol>
          </div>

          {/* Schmaler Block: ein einziges, ruhiges Vertrauensargument. */}
          <div className="card-base flex flex-col gap-4 p-7 sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <h2 className="font-display text-base font-bold tracking-tight text-navy-900">
                Daten in Deutschland
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Gehostet in Frankfurt, nach DSGVO. Kein Tracking, keine Drittanbieter-Cookies. Deine
              Anmeldung läuft über deine Ablefy-Mailadresse.
            </p>
            <div className="mt-auto flex items-center gap-2 border-t border-border pt-4 text-sm text-muted-foreground">
              <Bell className="h-4 w-4 text-brand" />
              <span>Benachrichtigungen stellst du selbst ein.</span>
            </div>
          </div>
        </section>

        <p className="mx-auto mt-6 max-w-xl text-center text-xs text-muted-foreground">
          Die Signale oben sind Beispiele.{" "}
          <Link href="/login" className="font-medium text-brand underline underline-offset-2">
            Melde dich an
          </Link>
          , um deinen Mitgliederbereich zu öffnen.
        </p>
      </main>

      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Trader IQ Anlegerclub ·{" "}
        <Link href="/info" className="underline hover:text-foreground">Über uns</Link> ·{" "}
        <a href="mailto:info@traderiq.net" className="underline hover:text-foreground">info@traderiq.net</a>
      </footer>
    </div>
  );
}

function Step({ no, title, body }: { no: string; title: string; body: string }) {
  return (
    <li className="relative">
      <span className="font-mono text-sm font-semibold tabular-nums text-brand">{no}</span>
      <h3 className="mt-2 font-semibold text-navy-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </li>
  );
}
