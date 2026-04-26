/**
 * Strategie-Beschreibungen je Depot. Vom Kunden bereitgestellt + leicht angepasst.
 * In Phase 2 im Admin-Editor pflegbar.
 */

export const STARTER_STRATEGY = `Die Strategie des Starter Real-Depots

Angefangen mit 5.000 € am 1. Februar 2021 investieren wir monatlich in Aktien mit den stärksten Fundamentaldaten, höchsten Wachstumsaussichten und größten Unterbewertung.

Ein Teil des Depots wird nach der DAX-Millionär-Strategie gehandelt – der Rest wird monatlich in neue Aktien oder Bestandspositionen investiert. Bei der Aktienauswahl verbinden wir hohe Dividendenrenditen mit attraktiven Wachstumschancen.

Zusätzlich sorgen Einzahlungen von 200 € pro Monat für den Wachstumsturbo sowie die lukrativen Dividendenzahlungen.

Das Depot ist ideal für alle, die klein anfangen und schnell, aber sicher Vermögen aufbauen und höchste Chancen mit minimalen Risiken kombinieren wollen.`;

export const TREND_STRATEGY = `Die Strategie des Trend Depots

Das Trend Depot folgt einem rein technischen Ansatz: wir kaufen aktuelle Trends, halten Gewinne konsequent und schneiden Verluste schnell. Stops sind unser zentrales Risiko-Werkzeug.

Seit kurzem haben wir eine neue Strategie in Umsetzung – diese reagiert noch schneller auf Markt-Veränderungen und bringt höhere Trefferquoten in volatilen Phasen.`;

export const STILLHALTER_STRATEGY = `Die Strategie des Stillhalter Depots

Wir verkaufen systematisch Optionen auf solide US-Titel und vereinnahmen Monat für Monat Prämien. Cash-Secured Puts und Covered Calls sind unsere Werkzeuge.

Ziel: planbarer monatlicher Cashflow auf Basis sauberer Risikokontrolle. Auch in Seitwärtsphasen erwirtschaften wir Rendite.`;

export const COCKPIT_STRATEGY = `Das Trader Cockpit

Dein Marktradar – Perspektiven, Tagesblicke, Wochenblicke, Monatsblicke, Earnings-Kalender und Lexikon zentral an einer Stelle. Phase 3: KI-gestützte Marktanalyse-PDFs.`;

export interface DepotPerformance {
  ytdPercent: number;
  benchmark: { name: string; ytdPercent: number };
  outperformancePercent: number;
  // 52 wöchentliche datenpunkte für mini-line-chart (depot vs benchmark)
  history: { week: number; depot: number; benchmark: number }[];
  highlight: string;
}

function genHistory(start: number, end: number, weeks: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < weeks; i++) {
    const t = i / (weeks - 1);
    const noise = Math.sin(i * 0.6) * 1.4 + Math.cos(i * 1.3) * 0.8;
    out.push(Number((start + (end - start) * t + noise).toFixed(2)));
  }
  return out;
}

function pairHistory(depot: number[], benchmark: number[]) {
  return depot.map((d, i) => ({ week: i, depot: d, benchmark: benchmark[i] ?? 0 }));
}

// Daten gemäß Screenshots vom Kunden:
// Starter: +43,48 % seit Jahresbeginn (Stand 31.12.2025)
// Trend  : +14,3 % YTD 2026, S&P 500 -7,33 % → +21,63 % Outperformance
// Stillhalter: +172,88 % YTD 2025, S&P 500 +13,54 %

export const STARTER_PERFORMANCE: DepotPerformance = {
  ytdPercent: 43.48,
  benchmark: { name: "S&P 500", ytdPercent: 18.2 },
  outperformancePercent: 25.28,
  history: pairHistory(
    genHistory(0, 43.48, 52),
    genHistory(0, 18.2, 52),
  ),
  highlight:
    "Stand 31.12.2025 · +43,48 % seit Jahresbeginn (kumulierte Rendite, inkl. Sparplan-Einzahlungen)",
};

export const TREND_PERFORMANCE: DepotPerformance = {
  ytdPercent: 14.3,
  benchmark: { name: "S&P 500", ytdPercent: -7.33 },
  outperformancePercent: 21.63,
  history: pairHistory(
    genHistory(0, 14.3, 16),
    genHistory(0, -7.33, 16),
  ),
  highlight:
    "YTD 2026: 14,30 % – S&P 500 −7,33 % – Outperformance 21,63 % (neue Strategie seit Q1 2026)",
};

export const STILLHALTER_PERFORMANCE: DepotPerformance = {
  ytdPercent: 172.88,
  benchmark: { name: "S&P 500", ytdPercent: 13.54 },
  outperformancePercent: 159.34,
  history: pairHistory(
    genHistory(0, 172.88, 52),
    genHistory(0, 13.54, 52),
  ),
  highlight:
    "2025: +172,88 % – S&P 500 +13,54 % – 12,77-fache Outperformance",
};
