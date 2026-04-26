/**
 * Visual-Trading-Journal-Style Depot-Übersicht (Spec-Iteration 3).
 * Phase 1: Platzhalter mit "WERT*PL.HALTER"-Kommentaren wo Daten fehlen.
 * Phase 2: API-Anbindung an Visual Trading Journal (iframe oder Plugin – beides bestätigt).
 */

export interface PortfolioCapital {
  /** Investiertes Kapital (in Marktwerten) */
  invested: number;
  /** Gebundenes Kapital (z. B. Margin / Optionsverpflichtungen) */
  bound: number;
  /** Freies Kapital */
  free: number;
}

export interface PortfolioSnapshot {
  productSlug: string;
  totalEquity: number; // = invested + bound + free
  capital: PortfolioCapital;
  cashQuotePercent: number;
  leverage: number; // 1.0 = kein Hebel
  riskBuckets: { label: string; value: number; color: string }[];
  branches: { label: string; value: number; color: string }[];
  positions: { label: string; value: number; color: string }[];
  assetTypes: { label: string; value: number; color: string }[];
}

const PALETTE = [
  "#ff741f", "#3b82f6", "#10b981", "#a855f7", "#ef4444",
  "#0ea5e9", "#eab308", "#14b8a6", "#f97316", "#8b5cf6",
];
const c = (i: number) => PALETTE[i % PALETTE.length]!;

// Daten orientiert an den User-Screenshots vom VTJ-Dashboard
export const portfolioStarter: PortfolioSnapshot = {
  productSlug: "starter",
  totalEquity: 259278,
  capital: {
    invested: 204084, // WERT*PL.HALTER (aus Screenshot: 204.084 USD)
    bound: 22450,    // WERT*PL.HALTER
    free: 32744,     // WERT*PL.HALTER
  },
  cashQuotePercent: 12.6,
  leverage: 0.9,
  riskBuckets: [
    { label: "A (sehr defensiv)", value: 83234, color: c(2) },
    { label: "B (ausgewogen)", value: 58750, color: c(0) },
    { label: "C (offensiv)", value: 79750, color: c(6) },
    { label: "D (sehr offensiv)", value: 4800, color: c(4) },
  ],
  branches: [
    { label: "Informationstechnologie", value: 110350, color: c(0) },
    { label: "Industrie", value: 42000, color: c(1) },
    { label: "Gesundheitswesen", value: 30400, color: c(2) },
    { label: "Kommunikationsdienste", value: 30141, color: c(3) },
    { label: "Nicht-Basiskonsumgüter", value: 10100, color: c(5) },
    { label: "Energie", value: 3550, color: c(4) },
  ],
  positions: [
    { label: "MSFT", value: 28000, color: c(0) },
    { label: "AAPL", value: 24500, color: c(1) },
    { label: "VICI", value: 18000, color: c(2) },
    { label: "BARRIK", value: 12000, color: c(3) },
    { label: "CSX", value: 22000, color: c(4) },
    { label: "META", value: 19000, color: c(5) },
    { label: "DOV", value: 14000, color: c(6) },
    { label: "T", value: 8000, color: c(7) },
    { label: "weitere", value: 58584, color: c(8) },
  ],
  assetTypes: [
    { label: "Aktien", value: 174084, color: c(0) },
    { label: "ETFs", value: 30000, color: c(1) },
    { label: "Cash", value: 32744, color: c(2) },
    { label: "Optionen-Margin", value: 22450, color: c(3) },
  ],
};

export const portfolioTrend: PortfolioSnapshot = {
  productSlug: "trend",
  totalEquity: 340000,
  capital: { invested: 268000, bound: 18000, free: 54000 },
  cashQuotePercent: 15.9,
  leverage: 1.1,
  riskBuckets: [
    { label: "A", value: 60000, color: c(2) },
    { label: "B", value: 110000, color: c(0) },
    { label: "C", value: 120000, color: c(6) },
    { label: "D", value: 50000, color: c(4) },
  ],
  branches: [
    { label: "Tech / Halbleiter", value: 95000, color: c(0) },
    { label: "Industrie", value: 70000, color: c(1) },
    { label: "Finanzwerte", value: 60000, color: c(2) },
    { label: "Healthcare", value: 30000, color: c(3) },
    { label: "Konsum", value: 25000, color: c(5) },
    { label: "Energie", value: 60000, color: c(4) },
  ],
  positions: [
    { label: "AVGO", value: 38000, color: c(0) },
    { label: "GOOGL", value: 32000, color: c(1) },
    { label: "AAPL", value: 28000, color: c(2) },
    { label: "MRNA", value: 22000, color: c(3) },
    { label: "FITB", value: 20000, color: c(4) },
    { label: "AMKR", value: 24000, color: c(5) },
    { label: "TFC", value: 26000, color: c(6) },
    { label: "weitere", value: 150000, color: c(7) },
  ],
  assetTypes: [
    { label: "Aktien", value: 268000, color: c(0) },
    { label: "ETFs", value: 0, color: c(1) },
    { label: "Cash", value: 54000, color: c(2) },
    { label: "Margin", value: 18000, color: c(3) },
  ],
};

export const portfolioStillhalter: PortfolioSnapshot = {
  productSlug: "stillhalter",
  totalEquity: 480000,
  capital: { invested: 240000, bound: 180000, free: 60000 },
  cashQuotePercent: 12.5,
  leverage: 1.4,
  riskBuckets: [
    { label: "A", value: 80000, color: c(2) },
    { label: "B", value: 200000, color: c(0) },
    { label: "C", value: 150000, color: c(6) },
    { label: "D", value: 50000, color: c(4) },
  ],
  branches: [
    { label: "Konsum (defensiv)", value: 110000, color: c(2) },
    { label: "Industrie", value: 90000, color: c(1) },
    { label: "Finanzwerte", value: 80000, color: c(3) },
    { label: "Tech", value: 70000, color: c(0) },
    { label: "Energie", value: 60000, color: c(4) },
    { label: "Healthcare", value: 70000, color: c(5) },
  ],
  positions: [
    { label: "MCD", value: 60000, color: c(0) },
    { label: "CSX", value: 55000, color: c(1) },
    { label: "SLV", value: 40000, color: c(2) },
    { label: "CVS", value: 45000, color: c(3) },
    { label: "MU", value: 50000, color: c(4) },
    { label: "SPY", value: 40000, color: c(5) },
    { label: "TLT", value: 50000, color: c(6) },
    { label: "weitere", value: 140000, color: c(7) },
  ],
  assetTypes: [
    { label: "Aktien (Underlyings)", value: 240000, color: c(0) },
    { label: "Short-Optionen Margin", value: 180000, color: c(3) },
    { label: "Cash", value: 60000, color: c(2) },
  ],
};

export function getPortfolioByProduct(slug: string): PortfolioSnapshot | undefined {
  if (slug === "starter") return portfolioStarter;
  if (slug === "trend") return portfolioTrend;
  if (slug === "stillhalter") return portfolioStillhalter;
  return undefined;
}
