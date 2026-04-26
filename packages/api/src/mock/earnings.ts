/**
 * Anstehende US-Earnings (Spec §8 Cockpit-Erweiterung).
 * Phase 1: realistische Platzhalter für ~150 S&P-500-Werte (alle ≥ 20 USD).
 * Phase 2: live von einer Earnings-API (z. B. Finnhub, FMP, Polygon).
 */

export interface EarningsEntry {
  ticker: string;
  company: string;
  date: string;
  timeOfDay: "BMO" | "AMC" | "—";
  estimateEPS: number | null;
  actualEPS: number | null;
  lastPrice: number;
  changeSinceLastEarnings: number;
  impliedVolatility: number;
  priceHistory: number[];
}

function gen(start: number, weeks: number, drift: number, vol: number): number[] {
  let p = start;
  const out: number[] = [start];
  for (let i = 0; i < weeks; i++) {
    p = p * (1 + drift + Math.sin(i * 1.7 + start) * vol);
    out.push(Number(p.toFixed(2)));
  }
  return out;
}

interface SeedRow {
  ticker: string;
  company: string;
  price: number;
  iv: number;
  drift: number;
  daysFromNow: number;
  bmo?: boolean;
  estimateEPS?: number;
  actualEPS?: number | null;
}

const BASE_DATE = new Date("2026-04-27T22:00:00Z");

function dateOf(daysFromNow: number, bmo: boolean): string {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() + daysFromNow);
  d.setUTCHours(bmo ? 11 : 22, bmo ? 0 : 0, 0, 0);
  return d.toISOString();
}

// Realistische S&P-500-Auswahl mit Preisen ≥ $20.
const SEEDS: SeedRow[] = [
  // Mega Caps
  { ticker: "AAPL", company: "Apple Inc.", price: 198.4, iv: 32.8, drift: 0.005, daysFromNow: 3, estimateEPS: 1.62 },
  { ticker: "MSFT", company: "Microsoft Corp.", price: 432.1, iv: 27.5, drift: 0.007, daysFromNow: 2, estimateEPS: 3.12 },
  { ticker: "GOOGL", company: "Alphabet Inc. (A)", price: 168.5, iv: 30.1, drift: 0.006, daysFromNow: 2, estimateEPS: 1.89 },
  { ticker: "GOOG", company: "Alphabet Inc. (C)", price: 170.2, iv: 30.0, drift: 0.006, daysFromNow: 2, estimateEPS: 1.89 },
  { ticker: "AMZN", company: "Amazon.com Inc.", price: 184.2, iv: 35.2, drift: 0.004, daysFromNow: 4, estimateEPS: 0.98 },
  { ticker: "META", company: "Meta Platforms", price: 488.3, iv: 41.4, drift: -0.002, daysFromNow: 3, estimateEPS: 4.85 },
  { ticker: "NVDA", company: "NVIDIA Corp.", price: 880.5, iv: 52.7, drift: 0.012, daysFromNow: 24, estimateEPS: 5.62 },
  { ticker: "BRK.B", company: "Berkshire Hathaway B", price: 412.8, iv: 14.2, drift: 0.003, daysFromNow: 7, estimateEPS: 5.01 },
  { ticker: "TSLA", company: "Tesla Inc.", price: 162.7, iv: 58.3, drift: -0.008, daysFromNow: -4, estimateEPS: 0.52, actualEPS: 0.45 },
  { ticker: "AVGO", company: "Broadcom Inc.", price: 1432.7, iv: 36.4, drift: 0.008, daysFromNow: 39, estimateEPS: 10.85 },
  // Financials
  { ticker: "JPM", company: "JPMorgan Chase", price: 198.5, iv: 22.4, drift: 0.005, daysFromNow: 15, bmo: true, estimateEPS: 4.45 },
  { ticker: "V", company: "Visa Inc.", price: 274.6, iv: 21.8, drift: 0.002, daysFromNow: 2, estimateEPS: 2.43 },
  { ticker: "MA", company: "Mastercard Inc.", price: 472.1, iv: 23.2, drift: 0.003, daysFromNow: 4, bmo: true, estimateEPS: 3.24 },
  { ticker: "BAC", company: "Bank of America", price: 38.5, iv: 27.6, drift: 0.006, daysFromNow: 18, bmo: true, estimateEPS: 0.82 },
  { ticker: "WFC", company: "Wells Fargo", price: 56.4, iv: 28.0, drift: 0.005, daysFromNow: 16, bmo: true, estimateEPS: 1.21 },
  { ticker: "GS", company: "Goldman Sachs", price: 488.2, iv: 26.8, drift: 0.005, daysFromNow: 19, bmo: true, estimateEPS: 9.84 },
  { ticker: "MS", company: "Morgan Stanley", price: 102.7, iv: 25.4, drift: 0.004, daysFromNow: 16, bmo: true, estimateEPS: 1.76 },
  { ticker: "C", company: "Citigroup", price: 67.8, iv: 28.6, drift: 0.003, daysFromNow: 17, bmo: true, estimateEPS: 1.45 },
  { ticker: "BLK", company: "BlackRock", price: 902.4, iv: 22.8, drift: 0.004, daysFromNow: 20, bmo: true, estimateEPS: 9.84 },
  { ticker: "SCHW", company: "Charles Schwab", price: 78.6, iv: 26.4, drift: 0.003, daysFromNow: 18, bmo: true, estimateEPS: 0.92 },
  { ticker: "AXP", company: "American Express", price: 282.6, iv: 23.2, drift: 0.005, daysFromNow: 21, bmo: true, estimateEPS: 3.42 },
  // Tech
  { ticker: "AMD", company: "Advanced Micro Devices", price: 158.4, iv: 48.5, drift: -0.004, daysFromNow: 3, estimateEPS: 0.62 },
  { ticker: "INTC", company: "Intel Corp.", price: 32.4, iv: 45.2, drift: -0.011, daysFromNow: -3, estimateEPS: 0.32, actualEPS: 0.18 },
  { ticker: "ORCL", company: "Oracle Corp.", price: 148.6, iv: 31.4, drift: 0.006, daysFromNow: 47, estimateEPS: 1.48 },
  { ticker: "CRM", company: "Salesforce", price: 282.7, iv: 38.2, drift: 0.006, daysFromNow: 32, estimateEPS: 2.38 },
  { ticker: "ADBE", company: "Adobe Inc.", price: 478.4, iv: 33.8, drift: 0.005, daysFromNow: 50, estimateEPS: 4.62 },
  { ticker: "NOW", company: "ServiceNow", price: 802.4, iv: 41.5, drift: 0.007, daysFromNow: 32, estimateEPS: 3.42 },
  { ticker: "CSCO", company: "Cisco Systems", price: 52.8, iv: 21.4, drift: 0.003, daysFromNow: 18, estimateEPS: 0.91 },
  { ticker: "IBM", company: "IBM Corp.", price: 218.6, iv: 24.6, drift: 0.001, daysFromNow: -2, estimateEPS: 1.62, actualEPS: 1.65 },
  { ticker: "QCOM", company: "Qualcomm", price: 168.4, iv: 38.4, drift: 0.005, daysFromNow: 5, estimateEPS: 2.42 },
  { ticker: "TXN", company: "Texas Instruments", price: 192.6, iv: 28.4, drift: 0.005, daysFromNow: -3, estimateEPS: 1.42, actualEPS: 1.58 },
  { ticker: "AMAT", company: "Applied Materials", price: 198.4, iv: 36.8, drift: 0.005, daysFromNow: 25, estimateEPS: 2.18 },
  { ticker: "LRCX", company: "Lam Research", price: 882.7, iv: 38.4, drift: 0.006, daysFromNow: 25, estimateEPS: 8.62 },
  { ticker: "MU", company: "Micron Technology", price: 102.4, iv: 48.2, drift: 0.008, daysFromNow: 67, estimateEPS: 1.84 },
  { ticker: "PANW", company: "Palo Alto Networks", price: 332.4, iv: 38.6, drift: 0.006, daysFromNow: 27, estimateEPS: 1.62 },
  { ticker: "INTU", company: "Intuit", price: 622.4, iv: 32.8, drift: 0.004, daysFromNow: 27, estimateEPS: 6.84 },
  { ticker: "ACN", company: "Accenture", price: 332.6, iv: 24.2, drift: 0.003, daysFromNow: 70, estimateEPS: 3.42 },
  { ticker: "SHOP", company: "Shopify Inc.", price: 78.4, iv: 48.6, drift: 0.005, daysFromNow: 4, estimateEPS: 0.42 },
  // Communication / Media
  { ticker: "DIS", company: "Walt Disney Co.", price: 98.6, iv: 31.7, drift: 0.005, daysFromNow: 10, estimateEPS: 1.18 },
  { ticker: "NFLX", company: "Netflix Inc.", price: 612.3, iv: 42.8, drift: 0.012, daysFromNow: -5, estimateEPS: 5.45, actualEPS: 5.78 },
  { ticker: "CMCSA", company: "Comcast", price: 38.4, iv: 27.4, drift: 0.001, daysFromNow: 2, bmo: true, estimateEPS: 0.94 },
  { ticker: "TMUS", company: "T-Mobile US", price: 198.6, iv: 24.8, drift: 0.006, daysFromNow: 4, estimateEPS: 2.18 },
  { ticker: "VZ", company: "Verizon Communications", price: 42.1, iv: 18.9, drift: 0.002, daysFromNow: -5, bmo: true, estimateEPS: 1.15, actualEPS: 1.18 },
  { ticker: "T", company: "AT&T Inc.", price: 22.4, iv: 21.5, drift: -0.001, daysFromNow: -4, bmo: true, estimateEPS: 0.58, actualEPS: 0.55 },
  // Consumer
  { ticker: "WMT", company: "Walmart Inc.", price: 60.4, iv: 22.5, drift: 0.004, daysFromNow: 18, bmo: true, estimateEPS: 0.52 },
  { ticker: "HD", company: "Home Depot", price: 342.5, iv: 24.2, drift: 0.001, daysFromNow: 23, bmo: true, estimateEPS: 3.62 },
  { ticker: "MCD", company: "McDonald's Corp.", price: 268.5, iv: 19.8, drift: -0.002, daysFromNow: 2, bmo: true, estimateEPS: 2.78 },
  { ticker: "SBUX", company: "Starbucks", price: 88.4, iv: 28.4, drift: 0.002, daysFromNow: 8, estimateEPS: 0.78 },
  { ticker: "NKE", company: "Nike Inc.", price: 78.4, iv: 26.5, drift: -0.001, daysFromNow: 60, estimateEPS: 0.62 },
  { ticker: "COST", company: "Costco Wholesale", price: 882.5, iv: 22.8, drift: 0.005, daysFromNow: 35, estimateEPS: 4.12 },
  { ticker: "TGT", company: "Target Corp.", price: 142.6, iv: 32.4, drift: 0.001, daysFromNow: 25, bmo: true, estimateEPS: 2.18 },
  { ticker: "KO", company: "Coca-Cola", price: 62.4, iv: 16.8, drift: 0.002, daysFromNow: 3, bmo: true, estimateEPS: 0.71 },
  { ticker: "PEP", company: "PepsiCo", price: 168.4, iv: 19.5, drift: -0.002, daysFromNow: 11, bmo: true, estimateEPS: 1.85 },
  { ticker: "MDLZ", company: "Mondelez", price: 68.4, iv: 21.5, drift: 0.003, daysFromNow: 11, estimateEPS: 0.82 },
  { ticker: "KHC", company: "Kraft Heinz", price: 38.6, iv: 22.4, drift: 0.001, daysFromNow: 4, bmo: true, estimateEPS: 0.62 },
  { ticker: "PG", company: "Procter & Gamble", price: 162.4, iv: 17.2, drift: 0.001, daysFromNow: 2, bmo: true, estimateEPS: 1.42 },
  { ticker: "CL", company: "Colgate-Palmolive", price: 88.6, iv: 18.4, drift: 0.001, daysFromNow: 4, bmo: true, estimateEPS: 0.92 },
  { ticker: "EL", company: "Estee Lauder", price: 78.4, iv: 38.4, drift: -0.005, daysFromNow: 5, bmo: true, estimateEPS: 0.42 },
  { ticker: "LULU", company: "Lululemon", price: 282.4, iv: 38.6, drift: -0.004, daysFromNow: 38, estimateEPS: 2.42 },
  { ticker: "ULTA", company: "Ulta Beauty", price: 382.4, iv: 32.4, drift: -0.002, daysFromNow: 40, estimateEPS: 5.42 },
  { ticker: "CMG", company: "Chipotle", price: 58.4, iv: 32.8, drift: 0.005, daysFromNow: 27, estimateEPS: 0.32 },
  { ticker: "YUM", company: "Yum! Brands", price: 138.6, iv: 22.4, drift: 0.003, daysFromNow: 8, bmo: true, estimateEPS: 1.21 },
  // Healthcare
  { ticker: "UNH", company: "UnitedHealth Group", price: 542.8, iv: 23.4, drift: 0.003, daysFromNow: 79, bmo: true, estimateEPS: 7.45 },
  { ticker: "JNJ", company: "Johnson & Johnson", price: 158.4, iv: 18.4, drift: -0.001, daysFromNow: 7, bmo: true, estimateEPS: 2.62 },
  { ticker: "LLY", company: "Eli Lilly", price: 832.4, iv: 36.4, drift: 0.008, daysFromNow: 5, bmo: true, estimateEPS: 4.42 },
  { ticker: "ABBV", company: "AbbVie", price: 178.4, iv: 22.6, drift: 0.003, daysFromNow: 7, bmo: true, estimateEPS: 2.82 },
  { ticker: "MRK", company: "Merck & Co.", price: 102.4, iv: 23.8, drift: 0.001, daysFromNow: 5, bmo: true, estimateEPS: 1.92 },
  { ticker: "PFE", company: "Pfizer Inc.", price: 26.4, iv: 32.4, drift: -0.007, daysFromNow: 4, bmo: true, estimateEPS: 0.45 },
  { ticker: "TMO", company: "Thermo Fisher Scientific", price: 562.8, iv: 26.4, drift: 0.003, daysFromNow: 4, bmo: true, estimateEPS: 4.62 },
  { ticker: "ABT", company: "Abbott Laboratories", price: 122.4, iv: 22.4, drift: 0.002, daysFromNow: -10, bmo: true, estimateEPS: 1.08, actualEPS: 1.12 },
  { ticker: "DHR", company: "Danaher Corp.", price: 252.4, iv: 24.6, drift: 0.003, daysFromNow: -5, bmo: true, estimateEPS: 1.68, actualEPS: 1.72 },
  { ticker: "ISRG", company: "Intuitive Surgical", price: 542.6, iv: 32.4, drift: 0.005, daysFromNow: -10, estimateEPS: 1.62, actualEPS: 1.81 },
  { ticker: "ELV", company: "Elevance Health", price: 472.4, iv: 26.4, drift: 0.003, daysFromNow: 0, bmo: true, estimateEPS: 9.82 },
  { ticker: "MDT", company: "Medtronic", price: 92.4, iv: 22.8, drift: 0.002, daysFromNow: 28, bmo: true, estimateEPS: 1.42 },
  { ticker: "AMGN", company: "Amgen", price: 312.4, iv: 24.8, drift: 0.003, daysFromNow: 5, estimateEPS: 4.62 },
  { ticker: "GILD", company: "Gilead Sciences", price: 92.4, iv: 26.4, drift: 0.002, daysFromNow: 5, estimateEPS: 1.62 },
  { ticker: "CVS", company: "CVS Health", price: 78.4, iv: 28.4, drift: 0.003, daysFromNow: 14, bmo: true, estimateEPS: 1.62 },
  { ticker: "CI", company: "Cigna Group", price: 332.4, iv: 25.4, drift: 0.003, daysFromNow: 5, bmo: true, estimateEPS: 6.82 },
  { ticker: "BMY", company: "Bristol Myers Squibb", price: 52.4, iv: 24.8, drift: 0.001, daysFromNow: 3, bmo: true, estimateEPS: 1.42 },
  { ticker: "ZTS", company: "Zoetis", price: 178.4, iv: 24.6, drift: 0.002, daysFromNow: 9, bmo: true, estimateEPS: 1.42 },
  { ticker: "BSX", company: "Boston Scientific", price: 92.4, iv: 26.4, drift: 0.005, daysFromNow: 0, bmo: true, estimateEPS: 0.62 },
  { ticker: "REGN", company: "Regeneron Pharmaceuticals", price: 882.4, iv: 32.6, drift: 0.003, daysFromNow: 9, bmo: true, estimateEPS: 9.82 },
  { ticker: "VRTX", company: "Vertex Pharmaceuticals", price: 432.4, iv: 28.6, drift: 0.004, daysFromNow: 9, estimateEPS: 4.42 },
  // Industrial
  { ticker: "BA", company: "Boeing Co.", price: 188.4, iv: 36.5, drift: -0.003, daysFromNow: 5, bmo: true, estimateEPS: -1.22 },
  { ticker: "CAT", company: "Caterpillar", price: 332.4, iv: 26.4, drift: 0.005, daysFromNow: 4, bmo: true, estimateEPS: 5.42 },
  { ticker: "DE", company: "Deere & Company", price: 412.4, iv: 28.4, drift: 0.005, daysFromNow: 19, bmo: true, estimateEPS: 6.82 },
  { ticker: "GE", company: "GE Aerospace", price: 162.4, iv: 28.4, drift: 0.006, daysFromNow: -7, bmo: true, estimateEPS: 1.12, actualEPS: 1.21 },
  { ticker: "HON", company: "Honeywell International", price: 218.4, iv: 22.4, drift: 0.003, daysFromNow: 4, bmo: true, estimateEPS: 2.42 },
  { ticker: "UNP", company: "Union Pacific", price: 232.4, iv: 23.4, drift: 0.003, daysFromNow: -4, bmo: true, estimateEPS: 2.62, actualEPS: 2.71 },
  { ticker: "UPS", company: "United Parcel Service", price: 138.4, iv: 27.6, drift: 0.001, daysFromNow: -2, bmo: true, estimateEPS: 1.62, actualEPS: 1.45 },
  { ticker: "FDX", company: "FedEx Corp.", price: 252.4, iv: 28.4, drift: 0.002, daysFromNow: 65, estimateEPS: 4.42 },
  { ticker: "LMT", company: "Lockheed Martin", price: 482.4, iv: 24.8, drift: 0.001, daysFromNow: -5, bmo: true, estimateEPS: 6.42, actualEPS: 6.84 },
  { ticker: "RTX", company: "RTX Corp.", price: 122.4, iv: 22.6, drift: 0.003, daysFromNow: -8, bmo: true, estimateEPS: 1.22, actualEPS: 1.31 },
  { ticker: "NOC", company: "Northrop Grumman", price: 472.6, iv: 22.4, drift: 0.002, daysFromNow: 5, bmo: true, estimateEPS: 6.21 },
  { ticker: "GD", company: "General Dynamics", price: 282.6, iv: 22.4, drift: 0.002, daysFromNow: 1, bmo: true, estimateEPS: 3.62 },
  { ticker: "EMR", company: "Emerson Electric", price: 112.4, iv: 24.4, drift: 0.003, daysFromNow: 9, bmo: true, estimateEPS: 1.42 },
  { ticker: "ETN", company: "Eaton Corp.", price: 332.4, iv: 26.6, drift: 0.005, daysFromNow: 5, bmo: true, estimateEPS: 2.84 },
  { ticker: "ITW", company: "Illinois Tool Works", price: 252.4, iv: 22.4, drift: 0.002, daysFromNow: -3, bmo: true, estimateEPS: 2.42, actualEPS: 2.45 },
  { ticker: "CSX", company: "CSX Corporation", price: 34.8, iv: 24.8, drift: 0.003, daysFromNow: -5, estimateEPS: 0.46, actualEPS: 0.49 },
  { ticker: "NSC", company: "Norfolk Southern", price: 232.4, iv: 26.4, drift: 0.003, daysFromNow: 0, bmo: true, estimateEPS: 2.92 },
  // Energy
  { ticker: "XOM", company: "Exxon Mobil", price: 118.4, iv: 28.4, drift: 0.005, daysFromNow: 5, bmo: true, estimateEPS: 2.18 },
  { ticker: "CVX", company: "Chevron Corp.", price: 158.7, iv: 26.8, drift: 0.004, daysFromNow: 5, bmo: true, estimateEPS: 2.85 },
  { ticker: "COP", company: "ConocoPhillips", price: 108.4, iv: 32.4, drift: 0.006, daysFromNow: 11, bmo: true, estimateEPS: 1.92 },
  { ticker: "SLB", company: "Schlumberger", price: 48.4, iv: 36.4, drift: 0.004, daysFromNow: -7, bmo: true, estimateEPS: 0.84, actualEPS: 0.86 },
  { ticker: "EOG", company: "EOG Resources", price: 122.4, iv: 32.4, drift: 0.005, daysFromNow: 9, estimateEPS: 2.62 },
  { ticker: "PSX", company: "Phillips 66", price: 138.4, iv: 32.4, drift: 0.004, daysFromNow: 0, bmo: true, estimateEPS: 1.42 },
  { ticker: "MPC", company: "Marathon Petroleum", price: 162.4, iv: 32.4, drift: 0.004, daysFromNow: 7, bmo: true, estimateEPS: 1.62 },
  { ticker: "VLO", company: "Valero Energy", price: 142.4, iv: 32.4, drift: 0.005, daysFromNow: 0, bmo: true, estimateEPS: 1.42 },
  { ticker: "OXY", company: "Occidental Petroleum", price: 58.4, iv: 36.8, drift: 0.005, daysFromNow: 14, estimateEPS: 0.62 },
  // Materials
  { ticker: "LIN", company: "Linde PLC", price: 462.8, iv: 22.4, drift: 0.004, daysFromNow: 5, bmo: true, estimateEPS: 4.12 },
  { ticker: "APD", company: "Air Products and Chemicals", price: 282.4, iv: 24.8, drift: 0.003, daysFromNow: 11, bmo: true, estimateEPS: 3.62 },
  { ticker: "FCX", company: "Freeport-McMoRan", price: 48.4, iv: 38.6, drift: 0.006, daysFromNow: -3, bmo: true, estimateEPS: 0.42, actualEPS: 0.45 },
  { ticker: "NEM", company: "Newmont Corp.", price: 58.4, iv: 36.8, drift: 0.005, daysFromNow: -3, estimateEPS: 0.62, actualEPS: 0.71 },
  { ticker: "ECL", company: "Ecolab", price: 232.4, iv: 22.4, drift: 0.003, daysFromNow: 4, bmo: true, estimateEPS: 1.42 },
  { ticker: "DD", company: "DuPont de Nemours", price: 78.4, iv: 24.4, drift: 0.002, daysFromNow: 5, bmo: true, estimateEPS: 0.92 },
  { ticker: "DOW", company: "Dow Inc.", price: 52.4, iv: 28.4, drift: 0.001, daysFromNow: -3, bmo: true, estimateEPS: 0.62, actualEPS: 0.58 },
  // Real Estate
  { ticker: "PLD", company: "Prologis", price: 122.4, iv: 24.6, drift: 0.003, daysFromNow: -10, estimateEPS: 1.42, actualEPS: 1.45 },
  { ticker: "AMT", company: "American Tower", price: 218.4, iv: 24.4, drift: 0.003, daysFromNow: 5, bmo: true, estimateEPS: 2.42 },
  { ticker: "EQIX", company: "Equinix", price: 882.4, iv: 28.4, drift: 0.005, daysFromNow: 5, estimateEPS: 8.62 },
  { ticker: "WELL", company: "Welltower", price: 132.4, iv: 24.4, drift: 0.005, daysFromNow: 5, estimateEPS: 1.12 },
  { ticker: "PSA", company: "Public Storage", price: 312.4, iv: 22.4, drift: 0.003, daysFromNow: 5, estimateEPS: 4.12 },
  { ticker: "VICI", company: "VICI Properties", price: 32.4, iv: 22.4, drift: 0.004, daysFromNow: 5, bmo: true, estimateEPS: 0.62 },
  { ticker: "O", company: "Realty Income", price: 58.4, iv: 22.4, drift: 0.002, daysFromNow: 9, estimateEPS: 0.42 },
  // Utilities
  { ticker: "NEE", company: "NextEra Energy", price: 78.4, iv: 22.4, drift: 0.003, daysFromNow: -7, bmo: true, estimateEPS: 0.92, actualEPS: 0.96 },
  { ticker: "DUK", company: "Duke Energy", price: 112.4, iv: 18.4, drift: 0.002, daysFromNow: 5, bmo: true, estimateEPS: 1.42 },
  { ticker: "SO", company: "Southern Company", price: 88.4, iv: 18.6, drift: 0.002, daysFromNow: 5, bmo: true, estimateEPS: 1.12 },
  { ticker: "AEP", company: "American Electric Power", price: 102.4, iv: 19.4, drift: 0.002, daysFromNow: 5, bmo: true, estimateEPS: 1.42 },
  { ticker: "D", company: "Dominion Energy", price: 56.4, iv: 22.4, drift: 0.002, daysFromNow: 5, bmo: true, estimateEPS: 0.92 },
  { ticker: "EXC", company: "Exelon", price: 42.4, iv: 22.4, drift: 0.002, daysFromNow: 5, bmo: true, estimateEPS: 0.72 },
  { ticker: "SRE", company: "Sempra Energy", price: 88.4, iv: 22.4, drift: 0.002, daysFromNow: 5, bmo: true, estimateEPS: 1.12 },
  // Semiconductor / Tech mid-caps
  { ticker: "ADI", company: "Analog Devices", price: 232.4, iv: 32.4, drift: 0.005, daysFromNow: 25, bmo: true, estimateEPS: 1.62 },
  { ticker: "MRVL", company: "Marvell Technology", price: 78.4, iv: 42.4, drift: 0.005, daysFromNow: 32, estimateEPS: 0.62 },
  { ticker: "KLAC", company: "KLA Corporation", price: 728.4, iv: 32.4, drift: 0.005, daysFromNow: 0, estimateEPS: 7.42 },
  { ticker: "SNPS", company: "Synopsys", price: 558.4, iv: 32.4, drift: 0.005, daysFromNow: 25, estimateEPS: 3.42 },
  { ticker: "CDNS", company: "Cadence Design Systems", price: 282.4, iv: 32.4, drift: 0.005, daysFromNow: 0, estimateEPS: 1.62 },
  { ticker: "CRWD", company: "CrowdStrike Holdings", price: 332.4, iv: 42.4, drift: 0.006, daysFromNow: 32, estimateEPS: 0.92 },
  { ticker: "FTNT", company: "Fortinet", price: 88.4, iv: 32.4, drift: 0.004, daysFromNow: 5, estimateEPS: 0.42 },
  { ticker: "NXPI", company: "NXP Semiconductors", price: 232.4, iv: 36.4, drift: 0.005, daysFromNow: 0, estimateEPS: 3.42 },
  { ticker: "ON", company: "ON Semiconductor", price: 78.4, iv: 42.4, drift: 0.003, daysFromNow: 0, bmo: true, estimateEPS: 0.92 },
  { ticker: "MCHP", company: "Microchip Technology", price: 58.4, iv: 36.4, drift: 0.003, daysFromNow: 9, estimateEPS: 0.62 },
  // Other
  { ticker: "MMM", company: "3M Company", price: 132.4, iv: 24.4, drift: 0.001, daysFromNow: -5, bmo: true, estimateEPS: 1.62, actualEPS: 1.71 },
  { ticker: "BX", company: "Blackstone", price: 152.4, iv: 28.4, drift: 0.005, daysFromNow: -7, bmo: true, estimateEPS: 1.12, actualEPS: 1.18 },
  { ticker: "SPGI", company: "S&P Global", price: 482.4, iv: 22.4, drift: 0.004, daysFromNow: 5, bmo: true, estimateEPS: 3.62 },
  { ticker: "ICE", company: "Intercontinental Exchange", price: 152.4, iv: 24.4, drift: 0.003, daysFromNow: 5, bmo: true, estimateEPS: 1.42 },
  { ticker: "CME", company: "CME Group", price: 232.4, iv: 22.4, drift: 0.003, daysFromNow: 5, bmo: true, estimateEPS: 2.42 },
  { ticker: "CB", company: "Chubb Limited", price: 282.4, iv: 22.4, drift: 0.003, daysFromNow: -7, estimateEPS: 5.42, actualEPS: 5.62 },
  { ticker: "PGR", company: "Progressive Corp.", price: 232.4, iv: 22.4, drift: 0.005, daysFromNow: 0, bmo: true, estimateEPS: 3.42 },
  { ticker: "MET", company: "MetLife", price: 78.4, iv: 24.4, drift: 0.003, daysFromNow: 5, bmo: true, estimateEPS: 1.92 },
  { ticker: "AIG", company: "American International Group", price: 78.4, iv: 24.4, drift: 0.003, daysFromNow: 5, bmo: true, estimateEPS: 1.42 },
];

export const upcomingEarnings: EarningsEntry[] = SEEDS.filter((s) => s.price >= 20).map((s) => ({
  ticker: s.ticker,
  company: s.company,
  date: dateOf(s.daysFromNow, !!s.bmo),
  timeOfDay: s.bmo ? "BMO" : "AMC",
  estimateEPS: s.estimateEPS ?? null,
  actualEPS: s.actualEPS ?? null,
  lastPrice: s.price,
  changeSinceLastEarnings: Number((s.drift * 100 * 12).toFixed(2)),
  impliedVolatility: s.iv,
  priceHistory: gen(s.price * 0.92, 12, s.drift, s.iv / 2400),
}));

export function searchEarnings(query: string): EarningsEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return upcomingEarnings;
  return upcomingEarnings.filter(
    (e) => e.ticker.toLowerCase().includes(q) || e.company.toLowerCase().includes(q),
  );
}
