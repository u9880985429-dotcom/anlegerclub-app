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

// ─── Equity-Kurve & Cashflow (VTJ-Stil "Renditen & Cashflow") ──────────────

export interface EquityMonth {
  month: string; // "Mär 24"
  equity: number; // NLV / Depotwert
  monthlyChangePercent: number;
  ytdPercent: number;
  trades: number;
  cashflowOptionen: number; // Optionsprämien
  cashflowAktien: number; // Realized Gains aus Aktien
  dividenden: number;
  zinsen: number;
  steuern: number;
  gebuehren: number;
}

function buildEquityCurve(start: number, monthlyDrift: number, months: number, label: string): EquityMonth[] {
  const out: EquityMonth[] = [];
  let v = start;
  const startEquity = start;
  const monthLabels: string[] = [];
  const baseDate = new Date("2024-01-01");
  for (let i = 0; i < months; i++) {
    const d = new Date(baseDate);
    d.setMonth(d.getMonth() + i);
    monthLabels.push(d.toLocaleDateString("de-DE", { month: "short", year: "2-digit" }));
  }
  for (let i = 0; i < months; i++) {
    const noise = Math.sin(i * 0.7 + start) * 0.018;
    const change = monthlyDrift + noise;
    const prev = v;
    v = v * (1 + change);
    const ytdPercent = ((v - startEquity) / startEquity) * 100;
    out.push({
      month: monthLabels[i] ?? `M${i}`,
      equity: Math.round(v),
      monthlyChangePercent: Number((change * 100).toFixed(2)),
      ytdPercent: Number(ytdPercent.toFixed(2)),
      trades: 4 + (i % 6),
      cashflowOptionen: Math.round(prev * (0.0035 + Math.abs(noise) * 0.6)),
      cashflowAktien: Math.round(prev * (0.0008 + (i % 4 === 0 ? 0.005 : 0))),
      dividenden: Math.round(prev * 0.0025),
      zinsen: Math.round(prev * 0.0009),
      steuern: -Math.round(prev * 0.0011),
      gebuehren: -Math.round(prev * 0.0004 + (i % 3) * 8),
    });
  }
  out[0]!.cashflowOptionen = 0;
  return out.map((r) => ({ ...r, _label: label } as EquityMonth & { _label: string }));
}

export const equityCurveStarter = buildEquityCurve(180000, 0.029, 24, "starter");
export const equityCurveTrend = buildEquityCurve(220000, 0.012, 24, "trend");
export const equityCurveStillhalter = buildEquityCurve(280000, 0.054, 24, "stillhalter");

export function getEquityCurve(slug: string): EquityMonth[] {
  if (slug === "starter") return equityCurveStarter;
  if (slug === "trend") return equityCurveTrend;
  if (slug === "stillhalter") return equityCurveStillhalter;
  return [];
}

// ─── Offene / Geschlossene Positionen (APA-Style) ─────────────────────────

export type PositionAction = "Buy" | "Sell" | "Verfallen" | "Steuern" | "Dividende" | "Zinsen";
export type PositionType = "Aktie" | "Call" | "Put" | "ETF" | "Fonds";

export interface PositionRow {
  ticker: string;
  date: string; // "5.4." or full ISO
  action: PositionAction;
  type: PositionType;
  shares: number;
  cashflowPerShare: number;
  realizedTotal: number;
  fees: number;
  effectivePrice: number; // Einstiegspreis
  effectivePriceAfter: number; // nach Einbuchen
  open: boolean;
}

export interface PositionGroup {
  ticker: string;
  company: string;
  lastPrice: number;
  profitTotal: number;
  profitPercent: number;
  openCallPercent: number;
  openPutPercent: number;
  closedPercent: number;
  capitalNeed: number;
  invested: number;
  rows: PositionRow[];
}

// Beispiel-Gruppe APA / Apache (orientiert an deinem Screenshot)
export const apaPositionGroup: PositionGroup = {
  ticker: "APA",
  company: "Apache Corp.",
  lastPrice: 35.79,
  profitTotal: 327.28,
  profitPercent: 9.22,
  openCallPercent: 67.4,
  openPutPercent: 14.3,
  closedPercent: 33.5,
  capitalNeed: 0,
  invested: 3550,
  rows: [
    { ticker: "APA", date: "25.3.", action: "Sell", type: "Call", shares: -1, cashflowPerShare: 0.10, realizedTotal: -3251.22, fees: -1.05, effectivePrice: 32.51, effectivePriceAfter: 35.50, open: true },
    { ticker: "APA", date: "22.3.", action: "Verfallen", type: "Call", shares: 0, cashflowPerShare: 0, realizedTotal: -3251.57, fees: 0, effectivePrice: 32.51, effectivePriceAfter: 35.50, open: false },
    { ticker: "APA", date: "8.3.", action: "Verfallen", type: "Put", shares: 0, cashflowPerShare: 0, realizedTotal: -3251.17, fees: 0, effectivePrice: 32.51, effectivePriceAfter: 35.50, open: false },
    { ticker: "APA", date: "8.3.", action: "Sell", type: "Call", shares: -1, cashflowPerShare: 0.35, realizedTotal: -3261.7, fees: -1.05, effectivePrice: 32.61, effectivePriceAfter: 30.70, open: true },
    { ticker: "APA", date: "23.2.", action: "Verfallen", type: "Put", shares: 0, cashflowPerShare: 0, realizedTotal: -3261.17, fees: 0, effectivePrice: 32.61, effectivePriceAfter: 35.50, open: false },
    { ticker: "APA", date: "8.2.", action: "Sell", type: "Put", shares: -1, cashflowPerShare: 0.53, realizedTotal: -3296.17, fees: -1.05, effectivePrice: 32.96, effectivePriceAfter: 30.65, open: true },
    { ticker: "APA", date: "23.2.", action: "Steuern", type: "Aktie", shares: 0, cashflowPerShare: -3.75, realizedTotal: -3349.12, fees: 0, effectivePrice: 33.49, effectivePriceAfter: 31.50, open: false },
    { ticker: "APA", date: "23.2.", action: "Dividende", type: "Aktie", shares: 0, cashflowPerShare: 25.0, realizedTotal: -3345.37, fees: 0, effectivePrice: 33.45, effectivePriceAfter: 31.45, open: false },
    { ticker: "APA", date: "23.2.", action: "Sell", type: "Put", shares: -1, cashflowPerShare: 0.24, realizedTotal: -3370.37, fees: -1.05, effectivePrice: 33.70, effectivePriceAfter: 31.60, open: true },
    { ticker: "APA", date: "29.1.", action: "Buy", type: "Aktie", shares: 1, cashflowPerShare: -0.46, realizedTotal: -3394.32, fees: -1.05, effectivePrice: 33.94, effectivePriceAfter: 31.50, open: true },
    { ticker: "APA", date: "16.1.", action: "Sell", type: "Call", shares: -1, cashflowPerShare: 0.93, realizedTotal: -3348.27, fees: -1.05, effectivePrice: 33.48, effectivePriceAfter: 32.49, open: true },
    { ticker: "APA", date: "16.1.", action: "Buy", type: "Aktie", shares: 1, cashflowPerShare: -1.04, realizedTotal: -3441.27, fees: -1.05, effectivePrice: 34.41, effectivePriceAfter: 31.50, open: true },
    { ticker: "APA", date: "26.1.", action: "Sell", type: "Put", shares: -1, cashflowPerShare: 0.59, realizedTotal: -3337.27, fees: -1.05, effectivePrice: 33.37, effectivePriceAfter: 32.65, open: true },
    { ticker: "APA", date: "12.1.", action: "Sell", type: "Call", shares: -1, cashflowPerShare: -0.04, realizedTotal: -3399.62, fees: 0, effectivePrice: 33.96, effectivePriceAfter: 31.50, open: false },
    { ticker: "APA", date: "5.1.", action: "Verfallen", type: "Call", shares: 0, cashflowPerShare: 0, realizedTotal: -3392.18, fees: 0, effectivePrice: 33.92, effectivePriceAfter: 31.50, open: false },
    { ticker: "APA", date: "5.1.", action: "Sell", type: "Call", shares: -1, cashflowPerShare: 0.26, realizedTotal: -3392.18, fees: -1.05, effectivePrice: 33.92, effectivePriceAfter: 31.50, open: true },
    { ticker: "APA", date: "26.12.23", action: "Sell", type: "Call", shares: -1, cashflowPerShare: 1.07, realizedTotal: -3418.13, fees: -1.05, effectivePrice: 34.18, effectivePriceAfter: 31.50, open: true },
  ],
};

// Vereinfachte Open-Position-Liste (eine Zeile pro offener Position aus Excel-Quelle)
export interface OpenPositionRow {
  ticker: string;
  company: string;
  type: PositionType;
  shares: number;
  avgPrice: number;
  lastPrice: number;
  marketValue: number;
  unrealized: number;
  unrealizedPercent: number;
  branche: string;
  riskBucket: "A" | "B" | "C" | "D";
}

export const openPositionsStarter: OpenPositionRow[] = [
  { ticker: "MSFT", company: "Microsoft", type: "Aktie", shares: 65, avgPrice: 364.5, lastPrice: 432.1, marketValue: 28086, unrealized: 4396, unrealizedPercent: 18.6, branche: "Informationstechnologie", riskBucket: "A" },
  { ticker: "AAPL", company: "Apple", type: "Aktie", shares: 124, avgPrice: 178.2, lastPrice: 198.4, marketValue: 24602, unrealized: 2505, unrealizedPercent: 11.3, branche: "Informationstechnologie", riskBucket: "A" },
  { ticker: "VICI", company: "VICI Properties", type: "Aktie", shares: 580, avgPrice: 28.4, lastPrice: 31.0, marketValue: 17980, unrealized: 1508, unrealizedPercent: 9.2, branche: "Real Estate", riskBucket: "B" },
  { ticker: "BARRIK", company: "Barrick Gold", type: "Aktie", shares: 720, avgPrice: 14.9, lastPrice: 16.7, marketValue: 12024, unrealized: 1296, unrealizedPercent: 12.1, branche: "Materialien", riskBucket: "C" },
  { ticker: "CSX", company: "CSX Corporation", type: "Aktie", shares: 630, avgPrice: 30.2, lastPrice: 34.9, marketValue: 21987, unrealized: 2961, unrealizedPercent: 15.6, branche: "Industrie", riskBucket: "B" },
  { ticker: "META", company: "Meta Platforms", type: "Aktie", shares: 38, avgPrice: 388.0, lastPrice: 488.3, marketValue: 18555, unrealized: 3811, unrealizedPercent: 25.9, branche: "Kommunikationsdienste", riskBucket: "B" },
  { ticker: "DOV", company: "Dover Corp.", type: "Aktie", shares: 70, avgPrice: 165.0, lastPrice: 198.2, marketValue: 13874, unrealized: 2324, unrealizedPercent: 20.1, branche: "Industrie", riskBucket: "A" },
  { ticker: "T", company: "AT&T", type: "Aktie", shares: 380, avgPrice: 18.4, lastPrice: 22.4, marketValue: 8512, unrealized: 1520, unrealizedPercent: 21.7, branche: "Kommunikationsdienste", riskBucket: "C" },
  { ticker: "CVX", company: "Chevron", type: "Aktie", shares: 22, avgPrice: 142.0, lastPrice: 158.7, marketValue: 3491, unrealized: 367, unrealizedPercent: 11.8, branche: "Energie", riskBucket: "B" },
];

export const openPositionsTrend: OpenPositionRow[] = [
  { ticker: "AVGO", company: "Broadcom", type: "Aktie", shares: 28, avgPrice: 1280.0, lastPrice: 1432.7, marketValue: 40115, unrealized: 4275, unrealizedPercent: 11.9, branche: "Halbleiter", riskBucket: "C" },
  { ticker: "GOOGL", company: "Alphabet", type: "Aktie", shares: 195, avgPrice: 152.0, lastPrice: 168.5, marketValue: 32857, unrealized: 3217, unrealizedPercent: 10.8, branche: "Kommunikationsdienste", riskBucket: "B" },
  { ticker: "AAPL", company: "Apple", type: "Aktie", shares: 142, avgPrice: 184.5, lastPrice: 198.4, marketValue: 28172, unrealized: 1973, unrealizedPercent: 7.5, branche: "Informationstechnologie", riskBucket: "B" },
  { ticker: "MRNA", company: "Moderna", type: "Aktie", shares: 320, avgPrice: 62.1, lastPrice: 68.7, marketValue: 21984, unrealized: 2112, unrealizedPercent: 10.6, branche: "Healthcare", riskBucket: "D" },
  { ticker: "FITB", company: "Fifth Third Bancorp", type: "Aktie", shares: 580, avgPrice: 32.2, lastPrice: 36.1, marketValue: 20938, unrealized: 2262, unrealizedPercent: 12.1, branche: "Finanzen", riskBucket: "B" },
  { ticker: "AMKR", company: "Amkor Technology", type: "Aktie", shares: 740, avgPrice: 28.5, lastPrice: 32.4, marketValue: 23976, unrealized: 2886, unrealizedPercent: 13.7, branche: "Halbleiter", riskBucket: "C" },
  { ticker: "TFC", company: "Truist Financial", type: "Aktie", shares: 620, avgPrice: 38.2, lastPrice: 42.8, marketValue: 26536, unrealized: 2852, unrealizedPercent: 12.0, branche: "Finanzen", riskBucket: "B" },
];

export const openPositionsStillhalter: OpenPositionRow[] = [
  { ticker: "MCD", company: "McDonald's", type: "Aktie", shares: 220, avgPrice: 248.0, lastPrice: 268.5, marketValue: 59070, unrealized: 4510, unrealizedPercent: 8.3, branche: "Konsum (defensiv)", riskBucket: "A" },
  { ticker: "CSX", company: "CSX Corporation", type: "Aktie", shares: 1580, avgPrice: 31.0, lastPrice: 34.9, marketValue: 55142, unrealized: 6162, unrealizedPercent: 12.6, branche: "Industrie", riskBucket: "B" },
  { ticker: "SLV", company: "iShares Silver Trust", type: "ETF", shares: 1450, avgPrice: 25.4, lastPrice: 28.1, marketValue: 40745, unrealized: 3915, unrealizedPercent: 10.6, branche: "Edelmetalle", riskBucket: "C" },
  { ticker: "MU", company: "Micron Technology", type: "Aktie", shares: 320, avgPrice: 92.4, lastPrice: 102.4, marketValue: 32768, unrealized: 3200, unrealizedPercent: 10.8, branche: "Halbleiter", riskBucket: "C" },
  { ticker: "CVS", company: "CVS Health", type: "Aktie", shares: 480, avgPrice: 52.0, lastPrice: 58.4, marketValue: 28032, unrealized: 3072, unrealizedPercent: 12.3, branche: "Healthcare", riskBucket: "B" },
  { ticker: "SPY", company: "SPDR S&P 500 ETF", type: "ETF", shares: 30, avgPrice: 695.0, lastPrice: 712.4, marketValue: 21372, unrealized: 522, unrealizedPercent: 2.5, branche: "Index-ETF", riskBucket: "A" },
  { ticker: "TLT", company: "iShares 20+ Y Treasury", type: "ETF", shares: 220, avgPrice: 88.0, lastPrice: 92.4, marketValue: 20328, unrealized: 968, unrealizedPercent: 4.8, branche: "Anleihen", riskBucket: "A" },
  { ticker: "NOW", company: "ServiceNow", type: "Aktie", shares: 18, avgPrice: 712.0, lastPrice: 802.4, marketValue: 14443, unrealized: 1627, unrealizedPercent: 12.7, branche: "Tech", riskBucket: "C" },
];

export function getOpenPositions(slug: string): OpenPositionRow[] {
  if (slug === "starter") return openPositionsStarter;
  if (slug === "trend") return openPositionsTrend;
  if (slug === "stillhalter") return openPositionsStillhalter;
  return [];
}
