import {
  apaPositionGroup,
  getEquityCurve,
  getOpenPositions,
  getPortfolioByProduct,
} from "@traderiq/api";
import { VisualTradingJournal } from "./VisualTradingJournal";

interface VTJEmbedProps {
  /** Depot-Slug — entscheidet welche Mock-Daten gezeigt werden. */
  productSlug: "starter" | "trend" | "stillhalter";
  title?: string;
}

/**
 * Visual-Trading-Journal-Style Dashboard, wie auf den Kunden-Screenshots gezeigt.
 * - Mehrere Tabs: Depotübersicht, Renditen & Cashflow, Offene/Geschlossene
 *   Positionen, Währungs-Positionen, APA (Beispiel-Underlying).
 * - Daten aus packages/api/src/mock/portfolio.ts
 * - Phase 2: API-Anbindung ans echte VTJ (iframe oder Plugin – beides bestätigt).
 */
export function VTJEmbed({ productSlug }: VTJEmbedProps) {
  const data = getPortfolioByProduct(productSlug);
  const equity = getEquityCurve(productSlug);
  const open = getOpenPositions(productSlug);
  if (!data) return null;
  return (
    <VisualTradingJournal
      data={data}
      equity={equity}
      openPositions={open}
      positionGroup={apaPositionGroup}
    />
  );
}
