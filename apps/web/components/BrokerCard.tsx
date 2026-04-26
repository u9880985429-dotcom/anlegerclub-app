import { ArrowRight, Calendar, ExternalLink } from "lucide-react";
import { BROKER } from "@traderiq/api";
import { VideoPlaceholder } from "./VideoPlaceholder";

/**
 * Brokerempfehlung — Spec: ausschließlich WH-Selfinvest, mit Iris Heinen als
 * Trader-IQ-Studenten-Ansprechpartnerin. Affiliate-Link + Calendly.
 */
export function BrokerCard() {
  return (
    <div className="card-base p-5">
      <div className="mb-3">
        <span className="badge-brand">Brokerempfehlung</span>
      </div>
      <h3 className="text-lg font-bold">{BROKER.name}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{BROKER.description}</p>

      <ul className="mt-4 space-y-1.5 text-sm">
        {BROKER.benefits.map((b) => (
          <li key={b} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5">
        <VideoPlaceholder
          title={`Webinar: ${BROKER.name} × Trader IQ`}
          duration="42:18"
          seed="broker-webinar"
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={BROKER.affiliateUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-brand inline-flex items-center gap-2"
        >
          Konto eröffnen
          <ExternalLink className="h-4 w-4" />
        </a>
        <a
          href={BROKER.contactCalendlyUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary inline-flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Termin mit {BROKER.contactName}
        </a>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Affiliate-Link: Du erhältst exklusive Konditionen, Trader IQ erhält bei Kontoeröffnung eine Provision – ohne Zusatzkosten für dich.
      </p>
    </div>
  );
}
