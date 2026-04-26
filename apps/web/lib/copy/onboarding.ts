/**
 * Spec §7 — Onboarding-Slides je Depot. Vom Kunden später überarbeitbar.
 * Phase 1: hardcoded. Phase 2: aus Admin-Editor (OnboardingSlide-Tabelle).
 */

import type { ProductSlug } from "@traderiq/api";

export interface OnboardingSlide {
  title: string;
  body: string;
}

export const ONBOARDING: Record<ProductSlug, OnboardingSlide[]> = {
  starter: [
    { title: "Willkommen im Starter Depot", body: "Schön, dass du dabei bist! Hier siehst du täglich, welche Aktien wir mit echtem Geld kaufen und verkaufen." },
    { title: "So liest du Trade-Signale", body: "Jedes Signal zeigt dir Asset, Einstieg, Stop und Ziel. Setze um, was zu dir passt." },
    { title: "Aktie im Fokus", body: "Einmal pro Woche stellt dir die Redaktion eine besonders aussichtsreiche Aktie ausführlich vor." },
    { title: "DAX Millionär", body: "Eine simple Monatsstrategie für maximalen Effekt bei minimalem Aufwand." },
    { title: "Push & Community", body: "Aktiviere Push-Nachrichten und tausch dich mit anderen Mitgliedern aus." },
  ],
  trend: [
    { title: "Willkommen im Trend Depot", body: "Hier handeln wir technisch: wir folgen klaren Trends, halten Gewinne und schneiden Verluste schnell." },
    { title: "Trade-Signale verstehen", body: "Jedes Signal kommt im Format `TT.MM.JJJJ Aktion` mit allen Details (Einstand, Stop, Ziel)." },
    { title: "Stops richtig setzen", body: "Wir ziehen Stops konsequent nach – das Hauptwerkzeug für die Risikokontrolle." },
    { title: "Brokerwahl", body: "Empfohlen: Interactive Brokers, Captrader oder Tastytrade für US-Aktien." },
    { title: "Push & Community", body: "Aktiviere Push-Nachrichten, damit du keinen Trade verpasst – und tausch dich mit der Community aus." },
  ],
  stillhalter: [
    { title: "Willkommen im Stillhalter Depot", body: "Wir verkaufen systematisch Optionen auf solide Werte und vereinnahmen jeden Monat Prämien." },
    { title: "Cash-Secured Puts & Covered Calls", body: "Die zwei Werkzeuge unserer Strategie. Beide sind im Lexikon erklärt." },
    { title: "Trade-Signale lesen", body: "Mehrere Tickers pro Signal sind normal – jedes Signal listet konkrete Aktionen pro Position." },
    { title: "Margin & Brokerempfehlung", body: "Für Optionen empfehlen wir Interactive Brokers (Margin) oder Tastytrade (Spezialist)." },
    { title: "Push & Community", body: "Push aktivieren, damit du Roll-Termine nicht verpasst. In der Community findest du die geballte Erfahrung anderer Stillhalter." },
  ],
  cockpit: [
    { title: "Willkommen im Trader Cockpit", body: "Dein Marktradar – Perspektiven, Tagesblicke, Wochenblicke und Monatsanalysen kompakt an einer Stelle." },
    { title: "Marktupdates", body: "Tag, Woche, Monat – wähle deine Frequenz. Push-Notifications informieren dich bei großen Ereignissen." },
    { title: "Economic Calendar", body: "Alle marktrelevanten Termine auf einen Blick. (Phase 2: live mit Konsens & Vorperiode.)" },
    { title: "Lexikon", body: "Über 30 Fachbegriffe einfach erklärt – ideal zum Nachschlagen." },
    { title: "Marktanalyse-PDFs", body: "Künftig (Phase 3): KI-gestützte tiefe Marktanalysen als PDF zum Download." },
  ],
  "all-access": [
    { title: "Willkommen im All Access Pass", body: "Du hast Zugriff auf alle 4 Depots und alle 4 Communities – das volle Trader-IQ-Universum." },
    { title: "Dein Hub", body: "Auf dem Dashboard findest du die jüngsten Signale aller Depots zusammengefasst." },
    { title: "Push & Personalisierung", body: "Du kannst Push-Notifications je Depot einzeln steuern (Einstellungen → Benachrichtigungen)." },
    { title: "Community", body: "4 Communities – jede mit eigenem Fokus. Hier wird täglich diskutiert, gefragt, geholfen." },
    { title: "Marktanalysen & Cockpit", body: "Das Cockpit liefert dir den Big Picture – Tagesblick, Wochenblick, Monatsblick. Plus: Lexikon & Calendar." },
  ],
};
