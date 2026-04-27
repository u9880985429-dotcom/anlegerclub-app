import Link from "next/link";
import { ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Briefcase, TrendingUp, CandlestickChart, Compass, Users, Bell } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function InfoPage() {
  return (
    <div className="relative min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Logo variant="light" size="md" href="/" />
        <Link href="/login" className="btn-secondary">Anmelden</Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-4 sm:px-6">
        <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Zurück
        </Link>

        <div className="text-center">
          <span className="badge-brand mb-4 inline-block">Trader IQ Anlegerclub</span>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
            Mehr Rendite. Weniger Risiko. <span className="text-brand">Klare Signale.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
            Lerne in unserem 5-tägigen Live-Webinar, wie erfahrene Trader monatliche Cashflows aufbauen – risikoarm und planbar.
          </p>
        </div>

        {/* Embedded SharePoint video */}
        <section className="mt-10">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="relative" style={{ paddingTop: "56.25%" }}>
              <iframe
                src="https://traderiq.sharepoint.com/sites/4Technologie-12Produktmanagement/_layouts/15/embed.aspx?UniqueId=e5715f85-627e-4787-b222-fb32eca38c74&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create"
                title="TIQ Anlegerclub – Vorstellung"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                frameBorder={0}
                className="absolute inset-0 h-full w-full"
              />
            </div>
            <div className="border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              Vorstellungs-Video aus dem Trader-IQ-Anlegerclub. Auf einigen Geräten ggf. SharePoint-Login nötig.
            </div>
          </div>
        </section>

        {/* Produkt-Übersicht */}
        <section className="mt-14">
          <h2 className="mb-6 text-center text-2xl font-bold tracking-tight">Unsere 4 Depots</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DepotCard icon={Briefcase} title="Starter Depot" body="Monatlicher Aktiensparplan + DAX-Millionär-Strategie. Ideal für Einsteiger." />
            <DepotCard icon={TrendingUp} title="Trend Depot" body="Technischer Trend-Ansatz: Trends mitnehmen, Verluste schnell schneiden." />
            <DepotCard icon={CandlestickChart} title="Stillhalter Depot" body="Cash-Secured Puts & Covered Calls. Monatlicher Optionsprämien-Cashflow." />
            <DepotCard icon={Compass} title="Trader Cockpit" body="Marktradar mit Tagesblick, Wochenblick, Monatsanalysen, Earnings-Kalender." />
          </div>
        </section>

        {/* Was ist drin */}
        <section className="mt-14">
          <div className="grid gap-4 lg:grid-cols-2">
            <Feature
              icon={Sparkles}
              title="Echte Signale, nicht Theorie"
              body="Jeder Kauf, jeder Stop, jeder Take-Profit – mit Datum, Ticker und Begründung. Kein Hin und Her, kein Marketing-Geschwafel."
            />
            <Feature
              icon={Users}
              title="Community bei jedem Depot"
              body="Diskutiere zu jedem Signal mit anderen Mitgliedern und der Redaktion – plus freier Community-Bereich pro Depot."
            />
            <Feature
              icon={Bell}
              title="Push & Mail in Echtzeit"
              body="Verpasse keinen Trade. Push aufs Handy, Mail in dein Postfach – steuerbar nach deinen Wünschen."
            />
            <Feature
              icon={ShieldCheck}
              title="EU-Hosting · DSGVO · Transparent"
              span
              body="Deine Daten in Frankfurt. Kein Tracking. Performance-Auswertungen über das Visual Trading Journal – komplett transparent."
            />
          </div>
        </section>

        {/* CTAs */}
        <section className="mt-14 grid gap-4 sm:grid-cols-2">
          <a
            href="https://traderiq.net/geheimnisse-stillhalter-live/?utm_source=traderiq-app&utm_medium=info-page&utm_campaign=stillhalter-live"
            target="_blank"
            rel="noreferrer"
            className="card-base group flex flex-col p-6 transition hover:border-brand/40"
          >
            <span className="badge-brand mb-3 self-start">5-Tage-Webinar</span>
            <h3 className="text-lg font-bold">Geheimnisse der Stillhalter</h3>
            <p className="mt-1 text-sm text-muted-foreground">Live & kostenlos. Lerne in 5 Tagen, wie monatliche Optionsprämien planbar werden.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand group-hover:underline">
              Jetzt anmelden <ArrowRight className="h-4 w-4" />
            </span>
          </a>
          <a
            href="https://calendly.com/d/cwpq-xv4-f2x/kostenfreies-strategiegesprach"
            target="_blank"
            rel="noreferrer"
            className="card-base group flex flex-col p-6 transition hover:border-brand/40"
          >
            <span className="badge-brand mb-3 self-start">Kostenfrei · 1:1</span>
            <h3 className="text-lg font-bold">Strategiegespräch</h3>
            <p className="mt-1 text-sm text-muted-foreground">Sprich direkt mit einem unserer Strategieberater. Persönlich, ohne Verkaufsdruck.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand group-hover:underline">
              Termin buchen <ArrowRight className="h-4 w-4" />
            </span>
          </a>
        </section>

        <div className="mt-14 text-center">
          <Link href="/login" className="btn-brand inline-flex items-center gap-2 px-6 py-3 text-base">
            Mitglieder-Login
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Trader IQ Anlegerclub ·{" "}
        <a href="mailto:info@traderiq.net" className="underline hover:text-foreground">info@traderiq.net</a>
      </footer>
    </div>
  );
}

function DepotCard({
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

function Feature({
  icon: Icon,
  title,
  body,
  span,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  span?: boolean;
}) {
  return (
    <div className={`card-base p-5 ${span ? "lg:col-span-2" : ""}`}>
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15">
        <Icon className="h-5 w-5 text-brand" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
