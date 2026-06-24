import Link from "next/link";
import { Lock, ArrowRight, ExternalLink, TrendingUp, Sparkles, ShieldCheck, Users } from "lucide-react";
import { PRODUCT_LABELS, PRODUCT_LINKS } from "@/lib/copy/login-status";
import type { ProductSlug } from "@traderiq/api";
import { STARTER_PERFORMANCE, TREND_PERFORMANCE, STILLHALTER_PERFORMANCE } from "@traderiq/api";

interface LockedProductPitchProps {
  slug: Exclude<ProductSlug, "all-access">;
}

const TEASER_COPY: Record<Exclude<ProductSlug, "all-access">, {
  hero: string;
  body: string;
  highlights: string[];
  performance?: { label: string; value: string; benchmark: string };
}> = {
  starter: {
    hero: "Aktiensparplan + DAX-Millionär – die solide Basis.",
    body: "Klein anfangen, schnell aber sicher Vermögen aufbauen. Monatlich investieren, hohe Trefferquoten, transparente Performance über das Visual Trading Journal.",
    highlights: [
      "Tägliche Trade-Signale (Aktiensparplan + DAX-Millionär)",
      'Wöchentliche „Aktie im Fokus"',
      "Monatliche Depotauswertung als Video",
      "Community zu jedem Trade + freier Bereich",
    ],
    performance: {
      label: "Performance YTD 2025",
      value: `+${STARTER_PERFORMANCE.ytdPercent.toFixed(2).replace(".", ",")} %`,
      benchmark: `S&P 500: +${STARTER_PERFORMANCE.benchmark.ytdPercent.toFixed(2).replace(".", ",")} %`,
    },
  },
  trend: {
    hero: "Reine Trendfolge – wir folgen Trends, schneiden Verluste schnell.",
    body: "Technische Strategie für aktive Trader. Klare Stops, klare Einstiege, höhere Trefferquoten in volatilen Phasen.",
    highlights: [
      "Live Trade-Signale (Format TT.MM.JJJJ + Aktion)",
      "Stops als zentrales Risiko-Werkzeug",
      "Monatliche Depot-Auswertung",
      "Community-Diskussion zu jedem Trade",
    ],
    performance: {
      label: "Performance YTD 2026",
      value: `+${TREND_PERFORMANCE.ytdPercent.toFixed(2).replace(".", ",")} %`,
      benchmark: `S&P 500: ${TREND_PERFORMANCE.benchmark.ytdPercent.toFixed(2).replace(".", ",")} %`,
    },
  },
  stillhalter: {
    hero: "Cash-Secured Puts & Covered Calls – planbarer Cashflow.",
    body: "Verkaufe Optionen auf solide US-Werte und vereinnahme Monat für Monat Prämien. Auch in Seitwärtsphasen erwirtschaftest du Rendite.",
    highlights: [
      "Detaillierte Trade-Signale mit Strike, DTE, Roll-Anweisungen",
      "Brokerempfehlung für Optionen (WH-Selfinvest)",
      "Performance-Reporting via Visual Trading Journal",
      "Community zu jedem Stillhalter-Trade",
    ],
    performance: {
      label: "Performance 2025",
      value: `+${STILLHALTER_PERFORMANCE.ytdPercent.toFixed(2).replace(".", ",")} %`,
      benchmark: `S&P 500: +${STILLHALTER_PERFORMANCE.benchmark.ytdPercent.toFixed(2).replace(".", ",")} %`,
    },
  },
  cockpit: {
    hero: "Marktradar mit Tagesblick, Wochenblick, Earnings-Kalender und Lexikon.",
    body: "Dein Überblick über die Märkte. Perspektiven des Chefredakteurs, S&P-500-Earnings-Übersicht mit IV, Economic Calendar – alles an einem Ort, downloadbar als PDF.",
    highlights: [
      "Tägliche, wöchentliche und monatliche Marktanalysen (PDF-Download)",
      "Earnings-Kalender mit Candlestick-Chart pro Aktie",
      "Implizite Volatilität pro Wert",
      "Lexikon der wichtigsten Fachbegriffe",
    ],
  },
};

export function LockedProductPitch({ slug }: LockedProductPitchProps) {
  const teaser = TEASER_COPY[slug];
  const link = PRODUCT_LINKS.find((l) => l.slug === slug)?.url ?? "https://traderiq.net/";
  const allAccessLink = PRODUCT_LINKS.find((l) => l.slug === "all-access")?.url ?? "https://traderiq.net/";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="card-base relative overflow-hidden p-8 shadow-sm">
        {/* Hintergrund-Glow */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand/10 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            <Lock className="h-3.5 w-3.5" />
            Nicht abonniert · Vorschau
          </div>
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight md:text-4xl">
            {PRODUCT_LABELS[slug]}
          </h2>
          <p className="mt-3 max-w-3xl text-lg text-muted-foreground">{teaser.hero}</p>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{teaser.body}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="btn-brand inline-flex items-center gap-2 px-6 py-3 text-base"
            >
              {PRODUCT_LABELS[slug]} freischalten
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={allAccessLink}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-base"
            >
              All-Access-Pass (alle 4 Bereiche)
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Kauf läuft sicher über unseren Partner Ablefy. Du kannst jederzeit kündigen.
          </p>
        </div>
      </div>

      {/* Performance-Teaser */}
      {teaser.performance && (
        <div className="card-base p-6">
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
            <TrendingUp className="h-3.5 w-3.5" /> Was du verpasst
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <div className="text-xs text-muted-foreground">{teaser.performance.label}</div>
              <div className="mt-1 text-3xl font-extrabold text-profit">{teaser.performance.value}</div>
              <div className="mt-1 text-xs text-muted-foreground">{teaser.performance.benchmark}</div>
            </div>
            <FuzzyMetric label="Live-Trade-Signale" value="WERT*PL.HALTER" />
            <FuzzyMetric label="Aktive Mitglieder" value="WERT*PL.HALTER" />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Echte Performance nach Freischaltung — inklusive Drilldown ins Visual Trading Journal.
          </p>
        </div>
      )}

      {/* Highlights */}
      <div className="card-base p-6">
        <div className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand">
          <Sparkles className="h-3.5 w-3.5" /> Was drin ist
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {teaser.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 rounded-md border border-border bg-background/40 p-3 text-sm">
              <span className="mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full bg-brand" />
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Vorschau-Cards (verschwommen) */}
      <div className="grid gap-4 md:grid-cols-3">
        <BlurredPreview icon={TrendingUp} title="Live-Performance" body="Aktuelle Renditen, Sektorverteilung, offene Positionen." />
        <BlurredPreview icon={Users} title="Community" body="Diskussion zu jedem Signal mit Mods und anderen Mitgliedern." />
        <BlurredPreview icon={ShieldCheck} title="Risiko-Management" body="Cashquote, Hebel, Klassifizierung A–D – auf einen Blick." />
      </div>

      {/* Reminder-CTA */}
      <div className="rounded-xl border border-dashed border-brand/40 bg-brand/5 p-6 text-center">
        <h3 className="text-lg font-bold">Bereit, freizuschalten?</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Sicher dir jetzt Zugriff auf {PRODUCT_LABELS[slug]} oder den Trader IQ All-Access-Pass.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <a href={link} target="_blank" rel="noreferrer" className="btn-brand inline-flex items-center gap-2">
            {PRODUCT_LABELS[slug]} freischalten <ArrowRight className="h-4 w-4" />
          </a>
          <Link href="/dashboard" className="btn-secondary">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

function FuzzyMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="relative">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 select-none font-mono text-3xl font-extrabold text-foreground/40 blur-[3px]">
        {value}
      </div>
      <Lock className="absolute right-2 top-2 h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function BlurredPreview({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="card-base relative overflow-hidden p-5">
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-brand/5 via-transparent to-brand/5" />
      <div className="relative z-10">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <h4 className="font-semibold">{title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Lock className="h-3 w-3" />
          Erst nach Freischaltung
        </div>
      </div>
    </div>
  );
}
