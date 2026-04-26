import type { TradeSignal } from "../types";

// Spec §6 + §16 — realistic trade signals with format `TT.MM.JJJJ Aktion`.
// Tickers/dates lifted from the real Anlegerclub research notes in the spec.

const ISO = (de: string): string => {
  const [d, m, y] = de.split(".");
  return `${y}-${m}-${d}T08:00:00Z`;
};

export const trendTrades: TradeSignal[] = [
  {
    id: "t_trend_10",
    productSlug: "trend",
    date: ISO("07.04.2026"),
    action: "NEUER_KAUF",
    tickers: ["AVGO"],
    title: "07.04.2026 Neuer Kauf, Anpassung Stops",
    bodyMd:
      "**Neuer Kauf:** AVGO – Einstieg gemäß Trendsignal über GD200 mit klarer Relative-Strength.\n\n**Anpassung Stops:** Stops aller offenen Positionen auf neue Tagestiefs nachgezogen, Risiko aktiv reduziert.",
    publishedAt: ISO("07.04.2026"),
  },
  {
    id: "t_trend_9",
    productSlug: "trend",
    date: ISO("31.03.2026"),
    action: "ANPASSUNG_STOP",
    tickers: ["AMKR", "FITB", "MRNA", "TFC"],
    title: "31.03.2026 Anpassung Stops",
    bodyMd:
      "Wir bleiben in den Positionen investiert, ziehen die Stops aber konservativ nach. Detail-Levels in der Tabelle unten.",
    publishedAt: ISO("31.03.2026"),
  },
  {
    id: "t_trend_8",
    productSlug: "trend",
    date: ISO("17.03.2026"),
    action: "TAKE_PROFIT",
    tickers: ["NVDA"],
    title: "17.03.2026 Take Profit NVDA",
    bodyMd:
      "Teil-Take-Profit auf NVDA: 50% des Bestands realisiert. Restposition läuft mit Trailing-Stop weiter.",
    publishedAt: ISO("17.03.2026"),
  },
  {
    id: "t_trend_7",
    productSlug: "trend",
    date: ISO("03.03.2026"),
    action: "NEUER_TRADE",
    tickers: ["TFC", "MRNA", "FITB", "AMKR"],
    title: "03.02.2026 Neuer Trade TFC, Anpassung Stop Order MRNA, FITB, AMKR",
    bodyMd:
      "**Neuer Trade:** TFC zum Eröffnungskurs gekauft, Stop initial 8% unter Einstand.\n\nStop-Anpassungen für MRNA, FITB und AMKR: jeweils auf das letzte signifikante Tagestief verschoben.",
    publishedAt: ISO("03.03.2026"),
  },
  {
    id: "t_trend_6",
    productSlug: "trend",
    date: ISO("17.02.2026"),
    action: "ANPASSUNG_STOP",
    tickers: ["AAPL", "MSFT"],
    title: "17.02.2026 Anpassung Stops AAPL, MSFT",
    bodyMd: "Stop-Loss-Anpassungen nach starker Wochenperformance. Beide Positionen im Plus.",
    publishedAt: ISO("17.02.2026"),
  },
  {
    id: "t_trend_5",
    productSlug: "trend",
    date: ISO("10.02.2026"),
    action: "NEUER_KAUF",
    tickers: ["MRNA"],
    title: "10.02.2026 Neuer Kauf MRNA",
    bodyMd: "Antizyklischer Einstieg in MRNA – charttechnischer Boden bestätigt.",
    publishedAt: ISO("10.02.2026"),
  },
  {
    id: "t_trend_4",
    productSlug: "trend",
    date: ISO("03.02.2026"),
    action: "NEUER_TRADE",
    tickers: ["FITB", "AMKR"],
    title: "03.02.2026 Neuer Trade FITB, AMKR",
    bodyMd: "Doppelposition: FITB (Banken) und AMKR (Halbleiter) – beide mit Trendbestätigung.",
    publishedAt: ISO("03.02.2026"),
  },
  {
    id: "t_trend_3",
    productSlug: "trend",
    date: ISO("26.01.2026"),
    action: "ANPASSUNG_STOP",
    tickers: ["GOOGL"],
    title: "26.01.2026 Anpassung Stop GOOGL",
    bodyMd: "GOOGL-Stop wird nachgezogen – wir lassen den Gewinn laufen.",
    publishedAt: ISO("26.01.2026"),
  },
  {
    id: "t_trend_2",
    productSlug: "trend",
    date: ISO("20.01.2026"),
    action: "NEUER_KAUF",
    tickers: ["GOOGL"],
    title: "20.01.2026 Neuer Kauf GOOGL",
    bodyMd: "Frischer Trend nach Earnings-Beat. Einstieg im Pullback an die GD20.",
    publishedAt: ISO("20.01.2026"),
  },
  {
    id: "t_trend_1",
    productSlug: "trend",
    date: ISO("13.01.2026"),
    action: "NEUER_TRADE",
    tickers: ["AAPL"],
    title: "13.01.2026 Neuer Trade AAPL",
    bodyMd: "AAPL als Saisontrade – Einstieg nach erstem Kerzenausbruch über das Vorwochenhoch.",
    publishedAt: ISO("13.01.2026"),
  },
];

export const stillhalterTrades: TradeSignal[] = [
  {
    id: "t_sth_5",
    productSlug: "stillhalter",
    date: ISO("17.04.2026"),
    action: "TAKE_PROFIT",
    tickers: ["CSX", "MCD", "SLV", "CVS", "MU", "SPY", "TLT"],
    title:
      "17.04.2026 CSX, MCD, SLV Take Profit – CVS, MU Anpassung – SLV, SPY, TLT Teurer Trade",
    bodyMd:
      "**Take Profit:** CSX, MCD, SLV – jeweils 80% Restwertgewinn realisiert (Buyback).\n\n**Anpassung:** CVS, MU – Rollen in den nächsten Verfallstag bei höheren Strikes.\n\n**Teurer Trade:** SLV, SPY, TLT – neue Short-Put-Positionen mit attraktiven Prämien.",
    publishedAt: ISO("17.04.2026"),
  },
  {
    id: "t_sth_4",
    productSlug: "stillhalter",
    date: ISO("19.03.2026"),
    action: "TAKE_PROFIT",
    tickers: ["NOW", "CSX", "MCD", "UNP"],
    title: "19.03.2026 NOW Take Profit – CSX gefüllt – MCD, UNP Teurer Trade",
    bodyMd:
      "**Take Profit:** NOW – Short-Call gerollt, Prämie eingestrichen.\n\n**Gefüllt:** CSX – Short-Put assigniert, wir nehmen die Aktie ins Depot.\n\n**Teurer Trade:** MCD, UNP – neue Cash-Secured-Puts platziert.",
    publishedAt: ISO("19.03.2026"),
  },
  {
    id: "t_sth_3",
    productSlug: "stillhalter",
    date: ISO("05.03.2026"),
    action: "ANPASSUNG_STOP",
    tickers: ["AAPL", "AMZN"],
    title: "05.03.2026 Anpassung AAPL, AMZN",
    bodyMd: "Roll der Short-Calls auf höhere Strikes. Beide Positionen weiter im Plus.",
    publishedAt: ISO("05.03.2026"),
  },
  {
    id: "t_sth_2",
    productSlug: "stillhalter",
    date: ISO("21.02.2026"),
    action: "NEUER_TRADE",
    tickers: ["KO", "PEP"],
    title: "21.02.2026 Neuer Trade KO, PEP",
    bodyMd: "Konsumdefensives Doppelpaket – Cash-Secured-Puts mit 30 DTE.",
    publishedAt: ISO("21.02.2026"),
  },
  {
    id: "t_sth_1",
    productSlug: "stillhalter",
    date: ISO("10.02.2026"),
    action: "NEUER_TRADE",
    tickers: ["XOM"],
    title: "10.02.2026 Neuer Trade XOM",
    bodyMd: "XOM-Short-Put zum Wochenanfang – attraktive IV-Prämie nach Korrektur.",
    publishedAt: ISO("10.02.2026"),
  },
];

export const starterTrades: TradeSignal[] = [
  {
    id: "t_st_4",
    productSlug: "starter",
    date: ISO("15.04.2026"),
    action: "NEUER_KAUF",
    tickers: ["VICI"],
    title: "15.04.2026 Neuer Kauf VICI",
    bodyMd: "**Aktie im Fokus** umgesetzt: VICI Properties – starke REIT-Story, monatliche Dividende.",
    publishedAt: ISO("15.04.2026"),
  },
  {
    id: "t_st_3",
    productSlug: "starter",
    date: ISO("28.03.2026"),
    action: "TAKE_PROFIT",
    tickers: ["MSFT"],
    title: "28.03.2026 Take Profit MSFT",
    bodyMd: "MSFT Teil-Verkauf nach 32% Buchgewinn. Restposition bleibt strategisch.",
    publishedAt: ISO("28.03.2026"),
  },
  {
    id: "t_st_2",
    productSlug: "starter",
    date: ISO("11.03.2026"),
    action: "NEUER_KAUF",
    tickers: ["BARRIK"],
    title: "11.03.2026 Neuer Kauf Barrick Gold",
    bodyMd: "Goldsektor-Diversifikation – Einstieg in Barrick Gold zum Aufbau einer Inflations-Hedge.",
    publishedAt: ISO("11.03.2026"),
  },
  {
    id: "t_st_1",
    productSlug: "starter",
    date: ISO("12.02.2026"),
    action: "NEUER_KAUF",
    tickers: ["CSX"],
    title: "12.02.2026 Neuer Kauf CSX",
    bodyMd: "CSX als Infrastruktur-Wert – attraktive Bewertung nach Q4-Reaktion.",
    publishedAt: ISO("12.02.2026"),
  },
];

export const allTrades: TradeSignal[] = [...trendTrades, ...stillhalterTrades, ...starterTrades];

export function getTradesByProduct(slug: string): TradeSignal[] {
  return allTrades
    .filter((t) => t.productSlug === slug)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
