/**
 * Brokerempfehlung — Trader IQ kooperiert ausschließlich mit WH-Selfinvest.
 * Ansprechpartnerin für Trader-IQ-Studenten: Iris Heinen.
 */

export const BROKER = {
  name: "WH-Selfinvest",
  affiliateUrl:
    "https://www.whselfinvest.de/de-de/investieren/sicher/beziehung/willkommen?whref=tiq",
  contactName: "Iris Heinen",
  contactCalendlyUrl: "https://calendly.com/iris-heinen-whselfinvest",
  description:
    "Unser exklusiver Partner für deutschsprachige Trader: niedrige Gebühren, geringe Margin-Anforderungen, Zugang zu allen relevanten US-Märkten und vollwertige Optionsplattform.",
  benefits: [
    "Persönliche Ansprechpartnerin für Trader-IQ-Studenten: Iris Heinen",
    "Konditionen exklusiv für Trader-IQ-Mitglieder",
    "Aktien, Optionen, Futures, ETFs in einem Konto",
    "Steuereinfacher Sitz in Luxemburg / Belgien",
  ],
} as const;

export const VTJ = {
  name: "Visual Trading Journal",
  description:
    "Unsere Depots stellen wir transparent über das Visual Trading Journal dar – mit Live-Performance, Positionen und vollständigem Trade-Journal.",
  affiliateUrl: "https://visualtradingjournal.com/traderiq",
  affiliateNote:
    "Für Trader-IQ-Studenten haben wir einen exklusiven Nachlass ausgehandelt – über den Link oben.",
} as const;

export const STRATEGY_CALL = {
  label: "Kostenfreies Strategiegespräch buchen",
  url: "https://calendly.com/d/cwpq-xv4-f2x/kostenfreies-strategiegesprach",
  pitch:
    "Du willst nicht länger warten und keinen Tag an der Börse verlieren? Dann sicher dir jetzt ein kostenfreies Strategiegespräch bei einem unserer Strategieberater.",
} as const;

export const WEBINAR_STILLHALTER = {
  label: "Zum 5-Tage-Webinar anmelden",
  url: "https://traderiq.net/geheimnisse-stillhalter-live/?utm_source=traderiq-app&utm_medium=pitch&utm_campaign=stillhalter-live",
  pitch:
    'Du willst lernen, wie man noch mehr Rendite aus seinem Depot holt – mit einer Trefferquote von 80 %? Dann trag dich für unser nächstes Live-Webinar aus der 5-tägigen Reihe „Geheimnisse der Stillhalter" ein.',
} as const;
