import type { FocusStock, Lesson, LexikonEntry, MarketUpdate } from "../types";

// ─── Aktie im Fokus (Spec §6 Starter) ─────────────────────────────────────
const PLACEHOLDER_LONGTEXT = "Hier wurde noch kein Text hinterlegt. Im Bearbeitungsmodus kannst du als Owner/Admin den vollständigen Beitrag ergänzen.";

export const focusStocks: FocusStock[] = [
  {
    id: "fs_1",
    ticker: "BARRIK",
    company: "Barrick Gold Corp.",
    thesis: "Inflations-Hedge mit attraktiver Bewertung und Dividende.",
    publishedAt: "2026-04-22T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_BARRIK",
    videoDuration: "8:14",
  },
  {
    id: "fs_2",
    ticker: "VICI",
    company: "VICI Properties",
    thesis: "Casino-REIT mit zuverlässiger Mietkulisse und steigender Dividende.",
    publishedAt: "2026-04-15T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_VICI",
    videoDuration: "7:42",
  },
  {
    id: "fs_3",
    ticker: "CSX",
    company: "CSX Corporation",
    thesis: "Schienenlogistik-Riese mit attraktiver Bewertung nach Korrektur.",
    publishedAt: "2026-04-08T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_CSX",
    videoDuration: "6:58",
  },
  {
    id: "fs_4",
    ticker: "MSFT",
    company: "Microsoft",
    thesis: "AI-Cloud-Leader mit defensivem Cashflow-Profil.",
    publishedAt: "2026-04-01T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_MSFT",
    videoDuration: "9:24",
  },
  {
    id: "fs_5",
    ticker: "DOVER",
    company: "Dover Corp.",
    thesis: "Industriedividenden-Aristokrat mit 67 Jahren Steigerungshistorie.",
    publishedAt: "2026-03-25T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_DOV",
    videoDuration: "7:18",
  },
  {
    id: "fs_6",
    ticker: "META",
    company: "Meta Platforms",
    thesis: "Werbe-Cashflow + Reels-Wachstum, weiterhin günstig bewertet.",
    publishedAt: "2026-03-18T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_META",
    videoDuration: "8:42",
  },
  {
    id: "fs_7",
    ticker: "WBD",
    company: "Warner Bros. Discovery",
    thesis: "Turnaround-Story – Schuldenabbau gelingt Stück für Stück.",
    publishedAt: "2026-03-11T08:00:00Z",
    videoAssetId: "mux_demo_focus_WBD",
    videoDuration: "11:08",
    longTextMd:
      `Warner Bros Discovery\n\nEine alte Bekannte, zu der wir wie die "Jungfrau zum Kind" gekommen sind. Durch Abspaltung eines Unternehmensteils ist schon so mancher Börsianer zu einer neuen Aktie im Depot gekommen. Ein Grund mehr, die Aktie einmal genauer unter die Lupe zu nehmen.\n\nBei der Suche nach der Aktie des Monats haben wir lange recherchieren müssen, da das Marktumfeld aktuell sehr herausfordernd ist. Wir suchten eine Aktie aus, die in diesem Umfeld kein Crashkandidat ist und ein solides Geschäftsmodell aufweist. Lass Dich mit der Aktie des Monats überraschen!`,
  },
  {
    id: "fs_8",
    ticker: "T",
    company: "AT&T",
    thesis: "Stabile Dividendenrendite über 6%, Kerngeschäft stabilisiert.",
    publishedAt: "2026-03-04T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_T",
    videoDuration: "7:52",
  },
  {
    id: "fs_9",
    ticker: "RCII",
    company: "Rent-A-Center (Upbound)",
    thesis: "Konsumfinanzierungs-Nische mit hohem Free Cashflow.",
    publishedAt: "2026-02-25T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_RCII",
    videoDuration: "6:34",
  },
  {
    id: "fs_10",
    ticker: "FDP",
    company: "Fresh Del Monte Produce",
    thesis: "Substanzwert mit globaler Fruchtlogistik – defensiv & günstig.",
    publishedAt: "2026-02-18T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_FDP",
    videoDuration: "8:08",
  },
  {
    id: "fs_11",
    ticker: "MDC",
    company: "MDC Partners",
    thesis: "Werbe-Holding mit verbessertem Margenprofil.",
    publishedAt: "2026-02-11T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_MDC",
    videoDuration: "7:16",
  },
  {
    id: "fs_12",
    ticker: "MED",
    company: "Medifast",
    thesis: "Direct-to-Consumer-Health-Player mit starkem Brand.",
    publishedAt: "2026-02-04T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_MED",
    videoDuration: "8:22",
  },
  {
    id: "fs_13",
    ticker: "CVX",
    company: "Chevron",
    thesis: "Integrierter Öl-Major mit kapitaldisziplinierter Strategie.",
    publishedAt: "2026-01-28T08:00:00Z",
    longTextMd: PLACEHOLDER_LONGTEXT,
    videoAssetId: "mux_demo_focus_CVX",
    videoDuration: "9:42",
  },
];

export function getFocusStockById(id: string): FocusStock | undefined {
  return focusStocks.find((f) => f.id === id);
}

// ─── DAX MILLIONÄR (Spec §6 Starter) ──────────────────────────────────────
export const daxMillionaerLessons: Lesson[] = [
  { id: "dm_1", productSlug: "starter", section: "DAX MILLIONÄR", title: "Strategie & Signale", bodyMd: "Die DAX-Millionär-Strategie ist eine **simple Monatsstrategie** für maximalen Effekt bei minimalem Aufwand. Du brauchst nur einen Brokerzugang und 30 Minuten pro Monat.", videoAssetId: "mux_demo_dm_1", order: 1, visible: true },
  { id: "dm_2", productSlug: "starter", section: "DAX MILLIONÄR", title: "Trades & Performance", bodyMd: "Im Schnitt 4–6 Trades pro Jahr. Historische Auswertung zeigt eine annualisierte Rendite von ~14% bei klar definiertem Risiko.", videoAssetId: "mux_demo_dm_2", order: 2, visible: true },
];

// ─── Marktupdates Cockpit (Spec §16: 3×Tag, 4×Woche, 6×Monat) ─────────────
export const marketUpdates: MarketUpdate[] = [
  // Tagesblick
  { id: "mu_t_1", kind: "tag", title: "Tagesblick 25.04.2026 – Fed-Sitzung im Fokus", bodyMd: "Wall Street eröffnet leicht im Plus. Die Renditen 10-jähriger US-Treasuries steigen auf 4,38%. **DAX** +0,3%, **S&P 500** +0,2%.", publishedAt: "2026-04-25T08:00:00Z" },
  { id: "mu_t_2", kind: "tag", title: "Tagesblick 24.04.2026 – Tech-Earnings beflügeln", bodyMd: "Nach starken Zahlen von **MSFT** und **GOOGL** läuft der Tech-Sektor heiß. **NDX** +1,4% intraday.", publishedAt: "2026-04-24T08:00:00Z" },
  { id: "mu_t_3", kind: "tag", title: "Tagesblick 23.04.2026 – Ölpreis stabil", bodyMd: "WTI hält die Marke von 76 USD. Energiesektor mit moderaten Aufschlägen.", publishedAt: "2026-04-23T08:00:00Z" },
  // Wochenblick
  { id: "mu_w_1", kind: "woche", title: "Wochenblick KW 17 – Earnings-Saison Halbzeit", bodyMd: "150 von 500 S&P-Werten haben gemeldet, 78% schlagen die Erwartungen. **Highlights:** AVGO, COST, TGT.", publishedAt: "2026-04-21T08:00:00Z" },
  { id: "mu_w_2", kind: "woche", title: "Wochenblick KW 16 – Volatilität bleibt erhöht", bodyMd: "VIX schwankt zwischen 17 und 22. Defensive Sektoren outperformen.", publishedAt: "2026-04-14T08:00:00Z" },
  { id: "mu_w_3", kind: "woche", title: "Wochenblick KW 15 – Rotation in Substanz", bodyMd: "Value-Werte ziehen an, Growth verliert leicht. Banken und Energie führen die Indizes an.", publishedAt: "2026-04-07T08:00:00Z" },
  { id: "mu_w_4", kind: "woche", title: "Wochenblick KW 14 – DAX testet Ausbruch", bodyMd: "DAX nähert sich erneut der 20.000er Marke. Charttechnisch wäre ein Tagesschluss darüber stark bullish.", publishedAt: "2026-03-31T08:00:00Z" },
  // Monatsblick
  { id: "mu_m_1", kind: "monat", title: "Monatsblick April 2026", bodyMd: "Solider Monat trotz Volatilitätsspitzen. Wichtigste Treiber: AI-Earnings, Fed-Pause, China-Stimulus.", publishedAt: "2026-04-01T08:00:00Z" },
  { id: "mu_m_2", kind: "monat", title: "Monatsblick März 2026", bodyMd: "März lieferte +2,1% im S&P 500. Banken nach Stresstests stark. **Risiko:** Yield-Curve-Inversion bleibt bestehen.", publishedAt: "2026-03-01T08:00:00Z" },
  { id: "mu_m_3", kind: "monat", title: "Monatsblick Februar 2026", bodyMd: "Februar +0,6%. Tech überdurchschnittlich, REITs schwach. **Top:** NVDA, **Flop:** Real Estate Sector.", publishedAt: "2026-02-01T08:00:00Z" },
  { id: "mu_m_4", kind: "monat", title: "Monatsblick Januar 2026", bodyMd: "Schwacher Jahresstart mit −1,8%. Saisonalität spricht für Erholung im Q1-Schluss.", publishedAt: "2026-01-01T08:00:00Z" },
  { id: "mu_m_5", kind: "monat", title: "Monatsblick Dezember 2025", bodyMd: "Santa Rally fiel aus. S&P 500 −0,3%. Defensive Werte stabilisieren das Depot.", publishedAt: "2025-12-01T08:00:00Z" },
  { id: "mu_m_6", kind: "monat", title: "Monatsblick November 2025", bodyMd: "Starker November mit +4,2%. Soft-Landing-Narrativ stützt Risikoassets.", publishedAt: "2025-11-01T08:00:00Z" },
];

// ─── Lexikon (Spec §6 Cockpit) ────────────────────────────────────────────
export const lexikon: LexikonEntry[] = [
  { id: "lx_1", term: "Stop-Loss", definitionMd: "Eine Order, die eine Position automatisch schließt, sobald ein bestimmter Verlustpegel erreicht wird. Dient der Risikobegrenzung." },
  { id: "lx_2", term: "Take-Profit", definitionMd: "Eine Order, die eine Position automatisch bei einem definierten Gewinn-Niveau schließt. Sichert Gewinne ab." },
  { id: "lx_3", term: "Trailing Stop", definitionMd: "Ein dynamischer Stop, der mit dem Kurs mitläuft – aber nur in eine Richtung. Erlaubt Gewinne laufen zu lassen." },
  { id: "lx_4", term: "Cash-Secured Put", definitionMd: "Verkauf einer Put-Option, abgesichert durch ausreichend Cash zum Kauf der Aktie zum Strike. Stillhalter-Standard." },
  { id: "lx_5", term: "Covered Call", definitionMd: "Verkauf einer Call-Option auf eine bereits gehaltene Aktienposition. Generiert Zusatzrendite bei Seitwärtsmärkten." },
  { id: "lx_6", term: "Roll", definitionMd: "Schließen einer auslaufenden Optionsposition + gleichzeitiges Eröffnen einer neuen Position mit späterem Verfallsdatum oder anderem Strike." },
  { id: "lx_7", term: "Implizite Volatilität (IV)", definitionMd: "Markterwartung über zukünftige Kursschwankungen, abgeleitet aus Optionspreisen. Treiber der Optionsprämien." },
  { id: "lx_8", term: "Delta", definitionMd: "Maß für die Sensitivität eines Optionspreises gegenüber dem Underlying. Approximiert die Wahrscheinlichkeit, im Geld zu enden." },
  { id: "lx_9", term: "DTE", definitionMd: "Days to Expiration – Tage bis zum Verfall einer Option. Steuert das Time-Decay-Profil." },
  { id: "lx_10", term: "Margin", definitionMd: "Die Sicherheitsleistung, die der Broker für gehebelte Positionen verlangt." },
];

// ─── Lessons je Depot (Welcome, Strategie, Brokerwahl, Tutorials) ─────────
export const allLessons: Lesson[] = [
  // Starter
  { id: "ls_st_1", productSlug: "starter", section: "Welcome", title: "Welcome Starter Depot", bodyMd: "Schön, dass du dabei bist! Im Welcome-Video (4:25) führt dich der Chefredakteur durch die wichtigsten Funktionen.", videoAssetId: "mux_demo_starter_welcome", order: 1, visible: true },
  { id: "ls_st_2", productSlug: "starter", section: "Strategie und Performance", title: "Strategie", bodyMd: "Wir kombinieren Value-Aktien mit klar definierten Stops. Dadurch entsteht ein langfristig solides Aktiendepot mit überschaubarem Risiko.", videoAssetId: "mux_demo_starter_strat", order: 1, visible: true },
  { id: "ls_st_3", productSlug: "starter", section: "Strategie und Performance", title: "Depot + Performance", bodyMd: "Aktuelle Depotzusammensetzung und Performance-Charts (interaktiv in Phase 2).", videoAssetId: null, order: 2, visible: true },
  { id: "ls_st_4", productSlug: "starter", section: "Strategie und Performance", title: "Trade Journal", bodyMd: "Vollständige Historie aller Käufe und Verkäufe – exportierbar als Excel ab Phase 3.", videoAssetId: null, order: 3, visible: true },
  ...daxMillionaerLessons,

  // Trend
  { id: "ls_tr_1", productSlug: "trend", section: "START", title: "Einführung", bodyMd: "Das **Trend Depot** folgt einem rein technischen Ansatz: wir kaufen Trends, halten Gewinne, schneiden Verluste schnell.", videoAssetId: "mux_demo_trend_intro", order: 1, visible: true },
  { id: "ls_tr_2", productSlug: "trend", section: "START", title: "Trade Journal", bodyMd: "Live-Trade-Journal mit Einstand, Stop, Ziel und realisierter Performance.", videoAssetId: null, order: 2, visible: true },
  { id: "ls_tr_3", productSlug: "trend", section: "START", title: "Brokerwahl", bodyMd: "Empfohlene Broker für USA-Aktien: Interactive Brokers, Captrader, Tastytrade.", videoAssetId: null, order: 3, visible: true },

  // Stillhalter
  { id: "ls_sh_1", productSlug: "stillhalter", section: "START", title: "Einführung", bodyMd: "Das **Stillhalter Depot** verkauft systematisch Optionen auf solide US-Werte und vereinnahmt monatliche Prämien.", videoAssetId: "mux_demo_sth_intro", order: 1, visible: true },
  { id: "ls_sh_2", productSlug: "stillhalter", section: "START", title: "Performance + Trade Journal", bodyMd: "Vollständige Optionshistorie mit Prämien-Cashflow und realisierten Renditen.", videoAssetId: null, order: 2, visible: true },
  { id: "ls_sh_3", productSlug: "stillhalter", section: "START", title: "Brokerempfehlung", bodyMd: "Für Optionen: **Interactive Brokers** (niedrige Margin) oder **Tastytrade** (Optionsspezialist).", videoAssetId: null, order: 3, visible: true },

  // Cockpit
  { id: "ls_co_1", productSlug: "cockpit", section: "Welcome", title: "Onboarding Cockpit", bodyMd: "Welcome-Video (9:34) – Tour durch alle Cockpit-Module: Marktupdates, Lexikon, Economic Calendar.", videoAssetId: "mux_demo_cockpit_welcome", order: 1, visible: true },
  { id: "ls_co_2", productSlug: "cockpit", section: "Perspektiven", title: "Perspektiven des Chefredakteurs", bodyMd: "Wöchentliche Einordnung der Marktlage – persönlich und ungeschönt.", videoAssetId: "mux_demo_cockpit_persp", order: 1, visible: true },
];
