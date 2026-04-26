/**
 * DAX-Millionär Strategie-Signale + Trades + Performance.
 * Datenquelle (Phase 2): Excel-Sheet "DAX Millionär" aus dem SharePoint.
 * Phase 1: realistische Mock-Werte, vom Kunden später überschreibbar via Edit-Mode.
 */

export type StrategieAction = "BUY" | "HOLD" | "SELL";

export interface StrategieSignal {
  id: string;
  /** Format YYYY-MM für Sortierung. Anzeige als "August 2025". */
  monatId: string;
  monatLabel: string;
  action: StrategieAction;
  title: string;
  bodyMd: string;
  publishedAt: string;
}

export const daxStrategieSignale: StrategieSignal[] = [
  {
    id: "dms_2025_08",
    monatId: "2025-08",
    monatLabel: "August 2025",
    action: "SELL",
    title: "August 2025 Signal – Ausstieg DAX LONG-ETF",
    bodyMd:
      "Unser Handelssystem generiert zum Monatsanfang ein Ausstiegssignal aus der bestehenden Position.\n\nWir verkaufen die gesamte Position des DAX LONG-ETFs WKN: LYXOAD zum Preis von je 243,85 € und realisieren einen Gewinn von 38,9 %.",
    publishedAt: "2025-08-01T08:00:00Z",
  },
  {
    id: "dms_2025_09",
    monatId: "2025-09",
    monatLabel: "September 2025",
    action: "HOLD",
    title: "September 2025 Signal – Cash-Position halten",
    bodyMd:
      "Unser Handelssystem zeigt zum Monatsanfang keine klaren Trendsignale. Wir halten die Cash-Position und warten auf das nächste Einstiegssignal.\n\n**Hinweis:** In Phasen ohne klares Signal ist Stillstand der beste Trade.",
    publishedAt: "2025-09-01T08:00:00Z",
  },
  {
    id: "dms_2025_10",
    monatId: "2025-10",
    monatLabel: "Oktober 2025",
    action: "BUY",
    title: "Oktober 2025 Signal – Wiedereinstieg DAX LONG",
    bodyMd:
      "Unser Handelssystem generiert ein Kaufsignal. Wir steigen wieder in den DAX LONG-ETF WKN: LYXOAD ein, zum Preis von je 218,40 €.\n\nAusstiegsschwelle: nächstes systemgeneriertes SELL-Signal.",
    publishedAt: "2025-10-01T08:00:00Z",
  },
  {
    id: "dms_2025_11",
    monatId: "2025-11",
    monatLabel: "November 2025",
    action: "HOLD",
    title: "November 2025 Signal – Position halten",
    bodyMd:
      "Trend bestätigt. Wir halten die Long-Position. Buchgewinn aktuell ca. +6,3 %.",
    publishedAt: "2025-11-01T08:00:00Z",
  },
  {
    id: "dms_2025_12",
    monatId: "2025-12",
    monatLabel: "Dezember 2025",
    action: "HOLD",
    title: "Dezember 2025 Signal – Position halten",
    bodyMd:
      "Saisonal starkes Umfeld. Wir lassen die Position laufen. Buchgewinn ca. +12,8 %.",
    publishedAt: "2025-12-01T08:00:00Z",
  },
  {
    id: "dms_2026_01",
    monatId: "2026-01",
    monatLabel: "Januar 2026",
    action: "SELL",
    title: "Januar 2026 Signal – Take Profit DAX LONG",
    bodyMd:
      "Unser Handelssystem generiert ein Ausstiegssignal. Wir realisieren den vollständigen Bestand zum Preis von 256,90 € je Anteil und sichern einen Gewinn von **+17,6 %** seit Wiedereinstieg.",
    publishedAt: "2026-01-01T08:00:00Z",
  },
  {
    id: "dms_2026_02",
    monatId: "2026-02",
    monatLabel: "Februar 2026",
    action: "BUY",
    title: "Februar 2026 Signal – Neuer Long-Einstieg",
    bodyMd:
      "Nach Korrektur generiert das System ein Kaufsignal. Einstiegspreis: 232,10 € je Anteil.",
    publishedAt: "2026-02-01T08:00:00Z",
  },
  {
    id: "dms_2026_03",
    monatId: "2026-03",
    monatLabel: "März 2026",
    action: "HOLD",
    title: "März 2026 Signal – Position halten",
    bodyMd: "Trend intakt. Buchgewinn ca. +4,9 %.",
    publishedAt: "2026-03-01T08:00:00Z",
  },
  {
    id: "dms_2026_04",
    monatId: "2026-04",
    monatLabel: "April 2026",
    action: "HOLD",
    title: "April 2026 Signal – Position halten",
    bodyMd: "Trend bestätigt. Buchgewinn ca. +8,4 %.",
    publishedAt: "2026-04-01T08:00:00Z",
  },
];

/**
 * Performance-Historie: jährliche Renditen DAX-Millionär-Strategie vs. DAX.
 * Quelle: Kunden-Excel-Sheet "DAX Millionär" (vereinfachte Darstellung).
 */
export interface DaxMillYearRow {
  year: number;
  strategie: number; // Prozent
  dax: number;
}

export const daxMillJahresRenditen: DaxMillYearRow[] = [
  { year: 2018, strategie: 11.4, dax: -18.3 },
  { year: 2019, strategie: 23.6, dax: 25.5 },
  { year: 2020, strategie: 9.8, dax: 3.5 },
  { year: 2021, strategie: 17.2, dax: 15.8 },
  { year: 2022, strategie: 4.6, dax: -12.3 },
  { year: 2023, strategie: 19.8, dax: 20.3 },
  { year: 2024, strategie: 22.4, dax: 18.8 },
  { year: 2025, strategie: 28.6, dax: 12.4 },
];

export interface DaxMillEquity {
  date: string;
  value: number;
}

/** Equity-Curve seit Strategiestart (vereinfacht, monatlich). */
export const daxMillEquityCurve: DaxMillEquity[] = (() => {
  const start = new Date("2018-01-01");
  let v = 10000;
  const out: DaxMillEquity[] = [];
  for (let m = 0; m < 100; m++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + m);
    const drift = 0.011;
    const noise = Math.sin(m * 0.7) * 0.018 + Math.cos(m * 1.3) * 0.012;
    v = v * (1 + drift + noise);
    out.push({ date: d.toISOString().slice(0, 10), value: Math.round(v) });
  }
  return out;
})();

export const STRATEGIE_BADGE_CLASS: Record<StrategieAction, string> = {
  BUY: "bg-profit/15 text-profit border-profit/30",
  HOLD: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  SELL: "bg-loss/15 text-loss border-loss/30",
};
